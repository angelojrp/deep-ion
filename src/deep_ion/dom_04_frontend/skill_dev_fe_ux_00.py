"""skill_dev_fe_ux_00 — UX Analysis (Heuristic Evaluation) entry point.

Analyzes the UI/UX described in a GitHub Issue using Nielsen's 10 heuristics,
WCAG 2.1 AA checks, and design system consistency validation.

Usage:
    python skill_dev_fe_ux_00.py --issue 42
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.ux_analysis_result import (
    ConsistencyIssue,
    HeuristicViolation,
    NielsenHeuristic,
    Severity,
    UxAnalysisResult,
    WcagIssue,
    WcagLevel,
)
from deep_ion.dom_04_frontend.domain.ux_policy import validate_wcag_compliance
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.template_reader import TemplateReader
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier

app = typer.Typer(add_completion=False)

_CONFIDENCE_THRESHOLD = 0.65


def _load_prompt() -> str:
    """Load the UX analysis prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "ux_analysis_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return "Analyze the UX of the described interface. Return JSON only."


def _load_ux_context() -> str:
    """Load the shared UX context."""
    context_path = Path(__file__).resolve().parent / "prompts" / "ux_context_v1.txt"
    if context_path.exists():
        return context_path.read_text(encoding="utf-8")
    return ""


def _parse_llm_response(content: str) -> dict:
    """Extract JSON from LLM response, handling code fences."""
    # Try to find JSON in a code fence first
    if "```json" in content:
        start = content.index("```json") + 7
        end = content.index("```", start)
        return json.loads(content[start:end].strip())
    if "```" in content:
        start = content.index("```") + 3
        # Skip optional language tag on same line
        newline = content.index("\n", start)
        start = newline + 1
        end = content.index("```", start)
        return json.loads(content[start:end].strip())
    # Try parsing the whole content as JSON
    return json.loads(content.strip())


def _build_analysis_result(issue_number: int, data: dict) -> UxAnalysisResult:
    """Build a typed UxAnalysisResult from parsed LLM JSON."""
    heuristic_map = {h.value: h for h in NielsenHeuristic}
    severity_map = {s.value: s for s in Severity}
    level_map = {l.value: l for l in WcagLevel}

    heuristic_violations = []
    for v in data.get("heuristic_violations", []):
        heuristic_key = v.get("heuristic", "")
        heuristic = heuristic_map.get(heuristic_key, NielsenHeuristic.CONSISTENCY)
        heuristic_violations.append(
            HeuristicViolation(
                heuristic=heuristic,
                severity=severity_map.get(v.get("severity", "info"), Severity.INFO),
                element=v.get("element", ""),
                description=v.get("description", ""),
                suggestion=v.get("suggestion", ""),
            ),
        )

    wcag_issues = []
    for w in data.get("wcag_issues", []):
        wcag_issues.append(
            WcagIssue(
                criterion=w.get("criterion", ""),
                level=level_map.get(w.get("level", "AA"), WcagLevel.AA),
                severity=severity_map.get(w.get("severity", "warning"), Severity.WARNING),
                element=w.get("element", ""),
                description=w.get("description", ""),
                suggestion=w.get("suggestion", ""),
            ),
        )

    consistency_issues = []
    for c in data.get("consistency_issues", []):
        consistency_issues.append(
            ConsistencyIssue(
                category=c.get("category", ""),
                expected=c.get("expected", ""),
                found=c.get("found", ""),
                element=c.get("element", ""),
                description=c.get("description", ""),
            ),
        )

    return UxAnalysisResult(
        issue_number=issue_number,
        screens_analyzed=data.get("screens_analyzed", []),
        heuristic_violations=heuristic_violations,
        wcag_issues=wcag_issues,
        consistency_issues=consistency_issues,
        overall_score=min(10.0, max(0.0, float(data.get("overall_score", 0.0)))),
        confidence_score=min(1.0, max(0.0, float(data.get("confidence_score", 0.0)))),
    )


def _format_report(result: UxAnalysisResult) -> str:
    """Format the UX analysis result as a GitHub comment."""
    lines: list[str] = []
    lines.append(f"## UX-ANALISE-{result.issue_number}")
    lines.append("")
    lines.append(f"**Score UX:** {result.overall_score:.1f}/10.0 | "
                 f"**Confidence:** {result.confidence_score:.2f} | "
                 f"**Findings:** {result.total_findings}")
    lines.append("")

    if result.heuristic_violations:
        lines.append("### Heuristic Violations (Nielsen)")
        lines.append("| # | Heuristic | Severity | Element | Description | Suggestion |")
        lines.append("|---|-----------|----------|---------|-------------|------------|")
        for i, v in enumerate(result.heuristic_violations, 1):
            sev_icon = {"blocker": "❌", "warning": "⚠️", "info": "ℹ️"}.get(v.severity.value, "")
            lines.append(f"| {i} | {v.heuristic.value} | {sev_icon} {v.severity.value} | {v.element} | {v.description} | {v.suggestion} |")
        lines.append("")

    if result.wcag_issues:
        lines.append("### WCAG 2.1 AA Issues")
        lines.append("| # | Criterion | Level | Severity | Element | Description | Suggestion |")
        lines.append("|---|-----------|-------|----------|---------|-------------|------------|")
        for i, w in enumerate(result.wcag_issues, 1):
            sev_icon = {"blocker": "❌", "warning": "⚠️", "info": "ℹ️"}.get(w.severity.value, "")
            lines.append(f"| {i} | {w.criterion} | {w.level.value} | {sev_icon} {w.severity.value} | {w.element} | {w.description} | {w.suggestion} |")
        lines.append("")

    if result.consistency_issues:
        lines.append("### Design System Consistency")
        lines.append("| # | Category | Expected | Found | Element | Description |")
        lines.append("|---|----------|----------|-------|---------|-------------|")
        for i, c in enumerate(result.consistency_issues, 1):
            lines.append(f"| {i} | {c.category} | {c.expected} | {c.found} | {c.element} | {c.description} |")
        lines.append("")

    if not result.heuristic_violations and not result.wcag_issues and not result.consistency_issues:
        lines.append("### ✅ No UX issues found")
        lines.append("")

    return "\n".join(lines)


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute UX Analysis skill for the given issue."""
    github = GitHubClient()

    # 1. Transition label.
    github.add_label(issue, "ux/analise-em-andamento")

    # 2. Read issue details.
    issue_data = github.get_issue(issue)
    issue_body = issue_data.get("body", "") or ""
    issue_title = issue_data.get("title", "")

    # 3. Look for existing ADR-FE or UC comments for extra context.
    adr_comment = github.find_comment_by_prefix(issue, "## ADR-FE-") or ""
    uc_comment = github.find_comment_by_prefix(issue, "## UC-") or ""

    # 4. Build UX context.
    blueprint = BlueprintReader()
    blueprint_context = blueprint.build_context_for_tier("SENIOR")
    template_reader = TemplateReader()
    ux_shared_context = _load_ux_context()
    full_context = template_reader.build_ux_context(blueprint_context, ux_shared_context)

    # 5. Build user prompt.
    user_prompt_parts = [
        f"UX Context:\n{full_context}",
        f"\n\nIssue Title: {issue_title}",
        f"\nIssue Description:\n{issue_body}",
    ]
    if adr_comment:
        user_prompt_parts.append(f"\n\nADR-FE Comment:\n{adr_comment}")
    if uc_comment:
        user_prompt_parts.append(f"\n\nUse Case Comment:\n{uc_comment}")

    user_prompt = "".join(user_prompt_parts)

    # 6. Call LLM.
    system_prompt = _load_prompt()
    provider = ProviderFactory.create(FrontendTier.SENIOR)
    response = provider.call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 7. Parse LLM response.
    try:
        data = _parse_llm_response(response.content)
    except (json.JSONDecodeError, ValueError) as exc:
        _publish_block(github, issue, f"Failed to parse LLM response as JSON: {exc}")
        raise typer.Exit(code=1)

    # 8. Build typed result.
    result = _build_analysis_result(issue, data)

    # 9. Augment with deterministic WCAG checks if HTML is available.
    html_content = issue_body
    if adr_comment:
        html_content += "\n" + adr_comment
    deterministic_wcag = validate_wcag_compliance(html_content)
    if deterministic_wcag:
        # Merge deterministic findings (avoid duplicates by criterion+element).
        existing_keys = {(w.criterion, w.element) for w in result.wcag_issues}
        new_issues = [w for w in deterministic_wcag if (w.criterion, w.element) not in existing_keys]
        if new_issues:
            all_wcag = list(result.wcag_issues) + new_issues
            result = result.model_copy(update={"wcag_issues": all_wcag})

    # 10. Check confidence threshold.
    if result.confidence_score < _CONFIDENCE_THRESHOLD:
        github.add_label(issue, "ux/analise-escalada")
        record = FrontendDecisionRecord(
            skill="skill_dev_fe_ux_00",
            issue_id=issue,
            decision_type="ux_analysis",
            decision="escalate",
            confidence_score=result.confidence_score,
            tier="SENIOR",
            model_used=response.model,
            output_tokens_used=response.output_tokens,
            blueprint_hash=blueprint.hash[:12],
            prompt_version="v1",
            justification=f"Confidence {result.confidence_score:.2f} < {_CONFIDENCE_THRESHOLD}",
            ux_score=result.overall_score,
            wcag_violations_count=len(result.wcag_issues),
        )
        github.post_comment(issue, record.to_github_comment())
        report = _format_report(result)
        github.post_comment(issue, report + f"\n\n> ⚠️ **Escalado:** confidence_score {result.confidence_score:.2f} < {_CONFIDENCE_THRESHOLD}. Revisão humana necessária.")
        typer.echo(f"UX Analysis escalated: confidence {result.confidence_score:.2f}")
        raise typer.Exit(code=0)

    # 11. Publish report.
    report = _format_report(result)
    github.post_comment(issue, report)

    # 12. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_00",
        issue_id=issue,
        decision_type="ux_analysis",
        decision="approve",
        confidence_score=result.confidence_score,
        tier="SENIOR",
        model_used=response.model,
        output_tokens_used=response.output_tokens,
        blueprint_hash=blueprint.hash[:12],
        prompt_version="v1",
        blocks_detected=[v.heuristic.value for v in result.heuristic_violations if v.severity == Severity.BLOCKER],
        ux_score=result.overall_score,
        wcag_violations_count=len(result.wcag_issues),
    )
    github.post_comment(issue, record.to_github_comment())

    # 13. Transition label.
    github.add_label(issue, "ux/analise-concluida")

    typer.echo(
        f"UX Analysis completed: score={result.overall_score:.1f}, "
        f"findings={result.total_findings}, confidence={result.confidence_score:.2f}"
    )


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_00",
        issue_id=issue,
        decision_type="ux_analysis",
        decision="block",
        confidence_score=0.0,
        tier="SENIOR",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
