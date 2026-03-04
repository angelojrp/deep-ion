"""skill_dev_fe_classifier — Task Classifier entry point.

Routes frontend tasks to Junior/Pleno/Sênior based on deterministic
checks + supervised LLM complexity analysis.

Usage:
    python skill_dev_fe_classifier.py --issue 42
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.frontend_task import FrontendTask
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy
from deep_ion.dom_04_frontend.domain.task_classifier import TaskClassifier
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)

# Confidence threshold — below this, escalate to Risk Arbiter.
_CONFIDENCE_THRESHOLD = 0.65

# Label mappings for tier routing.
_TIER_LABELS: dict[FrontendTier, str] = {
    FrontendTier.JUNIOR: "fe-agent/junior",
    FrontendTier.PLENO: "fe-agent/pleno",
    FrontendTier.SENIOR: "fe-agent/senior",
}
_ESCALATION_LABEL = "fe-agent/escalado"


def _load_classifier_prompt() -> str:
    """Load the classifier prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "classifier_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return ""


def _build_user_prompt(task: FrontendTask) -> str:
    """Build the user prompt for LLM complexity analysis."""
    return (
        f"Task: {task.title}\n"
        f"Description: {task.description}\n"
        f"Module: {task.target_module}\n"
        f"Affected files: {', '.join(task.affected_files) or 'none'}\n"
        f"Classification: {task.classification}\n"
        f"LGPD scope: {task.lgpd_scope}\n"
        f"RN references: {', '.join(task.rn_references) or 'none'}\n"
    )


def _parse_llm_response(response_text: str) -> dict[str, float]:
    """Parse LLM response for complexity score and confidence."""
    try:
        data = json.loads(response_text)
        return {
            "complexity_score": float(data.get("complexity_score", 0.0)),
            "confidence_score": float(data.get("confidence_score", 0.0)),
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"complexity_score": 0.0, "confidence_score": 0.0}


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Classify a frontend task and route to the appropriate tier agent."""
    github = GitHubClient()

    # 1. Read ADR-FE comment from Issue.
    adr_comment = github.find_comment_by_prefix(issue, "## ADR-FE-")
    if not adr_comment:
        _publish_error(github, issue, "No ## ADR-FE- comment found on issue.")
        raise typer.Exit(code=1)

    parsed = github.parse_adr_fe_comment(adr_comment)

    # 2. Build FrontendTask.
    issue_data = github.get_issue(issue)
    task = FrontendTask(
        issue_number=issue,
        title=issue_data.get("title", ""),
        description=parsed.get("description", ""),
        target_module=parsed.get("target_module", "shared"),
        affected_files=parsed.get("affected_files", []),
    )

    # 3. Deterministic classification.
    classification = TaskClassifier.classify(task)

    # 4. LLM-supervised complexity analysis (GPT-4o — cheap, sufficient).
    llm_scores = {"complexity_score": classification.complexity_score, "confidence_score": 0.0}
    try:
        provider = ProviderFactory.create(FrontendTier.JUNIOR)  # Classifier uses GPT-4o.
        system_prompt = _load_classifier_prompt() or (
            "You are a frontend task complexity classifier. "
            "Respond with JSON only: {\"complexity_score\": float, \"confidence_score\": float}. "
            "No prose."
        )
        user_prompt = _build_user_prompt(task)
        response = provider.call(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        llm_scores = _parse_llm_response(response.content)
    except Exception:
        # LLM failure: fall back to deterministic-only classification.
        llm_scores["confidence_score"] = 0.5

    confidence = llm_scores.get("confidence_score", 0.0)
    final_tier = classification.tier
    blocks = classification.blocks_detected

    # 5. Check confidence threshold.
    if confidence < _CONFIDENCE_THRESHOLD:
        # Escalate to Risk Arbiter — do not proceed.
        record = FrontendDecisionRecord(
            skill="skill_dev_fe_classifier",
            issue_id=issue,
            decision_type="classification",
            decision="escalar",
            confidence_score=confidence,
            tier=final_tier.value,
            complexity_score=classification.complexity_score,
            blocks_detected=blocks,
            justification=(
                f"confidence_score {confidence:.2f} < {_CONFIDENCE_THRESHOLD}. "
                "Escalating to Risk Arbiter for human review."
            ),
        )
        github.post_comment(issue, record.to_github_comment())
        github.add_label(issue, _ESCALATION_LABEL)
        typer.echo(f"Escalated: confidence {confidence:.2f} < {_CONFIDENCE_THRESHOLD}")
        raise typer.Exit(code=0)

    # 6. Publish FE-TIER comment (NV-05: JSON only, no prose).
    tier_data = {
        "tier": final_tier.value,
        "score_complexidade": round(classification.complexity_score, 2),
        "confidence_score": round(confidence, 2),
        "bloqueios_detectados": blocks,
    }
    tier_comment = f"## FE-TIER-{issue}\n\n```json\n{json.dumps(tier_data, indent=2, ensure_ascii=False)}\n```"
    github.post_comment(issue, tier_comment)

    # 7. Add tier label for routing.
    label = _TIER_LABELS.get(final_tier, _ESCALATION_LABEL)
    github.add_label(issue, label)

    # 8. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_classifier",
        issue_id=issue,
        decision_type="classification",
        decision="approve",
        confidence_score=confidence,
        tier=final_tier.value,
        complexity_score=classification.complexity_score,
        blocks_detected=blocks,
    )
    github.post_comment(issue, record.to_github_comment())

    typer.echo(f"Classified: tier={final_tier.value}, score={classification.complexity_score:.2f}, confidence={confidence:.2f}")


def _publish_error(github: GitHubClient, issue: int, message: str) -> None:
    """Publish an error DecisionRecord to the issue."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_classifier",
        issue_id=issue,
        decision_type="classification",
        decision="block",
        confidence_score=0.0,
        tier="UNKNOWN",
        justification=message,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
