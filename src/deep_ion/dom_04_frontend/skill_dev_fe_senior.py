"""skill_dev_fe_senior — Senior Frontend Agent entry point.

Handles T0/T1/T2 frontend tasks: full-stack frontend modules, OAuth2/PKCE,
LGPD compliance, cross-layer analysis, E2E stubs. Model: Claude Opus 4.6.

Usage:
    python skill_dev_fe_senior.py --issue 42
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.code_generation_result import CodeGenerationResult, GeneratedFile
from deep_ion.dom_04_frontend.domain.frontend_task import FrontendTask
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import ModelBudgetPolicy
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy, OutputPolicyViolation
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.pr_publisher import PrPublisher, GitHubContext
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)

# Senior has no directory restrictions — can write to any layer.

# LGPD detection patterns.
_LGPD_KEYWORDS: frozenset[str] = frozenset({
    "cpf",
    "email",
    "nome completo",
    "telefone",
    "endereço",
    "dados pessoais",
    "lgpd",
    "consentimento",
    "personal data",
})

# Accessibility enforcement patterns.
_INTERACTIVE_ELEMENTS = re.compile(
    r"<(button|input|select|textarea|a)\b",
    re.IGNORECASE,
)
_ARIA_PATTERN = re.compile(r"aria-(?:label|labelledby|describedby|hidden)")


def _load_prompt() -> str:
    """Load the Senior codegen prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "senior_codegen_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return OutputPolicy.SYSTEM_INSTRUCTION


def _detect_lgpd_scope(task: FrontendTask) -> bool:
    """Detect LGPD-sensitive scope from task description and files."""
    if task.lgpd_scope:
        return True
    combined = f"{task.title} {task.description}".lower()
    return any(keyword in combined for keyword in _LGPD_KEYWORDS)


def _validate_accessibility(files: list[GeneratedFile]) -> list[str]:
    """Validate that interactive components have aria-* attributes."""
    violations: list[str] = []
    for f in files:
        if f.is_test or not f.path.endswith(".tsx"):
            continue
        for i, line in enumerate(f.content.splitlines(), start=1):
            if _INTERACTIVE_ELEMENTS.search(line):
                # Check surrounding lines for aria attributes.
                context_start = max(0, i - 3)
                context_end = min(len(f.content.splitlines()), i + 3)
                context = "\n".join(f.content.splitlines()[context_start:context_end])
                if not _ARIA_PATTERN.search(context):
                    violations.append(
                        f"File '{f.path}' line {i}: interactive element missing aria-* attribute.",
                    )
    return violations


def _validate_auth_guards(files: list[GeneratedFile]) -> list[str]:
    """Validate that protected routes use auth guards."""
    violations: list[str] = []
    for f in files:
        if f.is_test:
            continue
        if "route" in f.path.lower() or "router" in f.path.lower():
            if "ProtectedRoute" not in f.content and "authGuard" not in f.content:
                if re.search(r"<Route\b", f.content):
                    violations.append(
                        f"File '{f.path}': route definitions found without ProtectedRoute guard.",
                    )
    return violations


def _perform_cross_layer_impact_analysis(files: list[GeneratedFile]) -> dict[str, list[str]]:
    """Analyze which layers are touched and cross-layer imports."""
    layer_files: dict[str, list[str]] = {
        "presentation": [],
        "application": [],
        "domain": [],
        "infrastructure": [],
        "other": [],
    }
    for f in files:
        if f.is_test:
            continue
        path_lower = f.path.lower()
        categorized = False
        for layer in ("presentation", "application", "domain", "infrastructure"):
            if f"{layer}/" in path_lower:
                layer_files[layer].append(f.path)
                categorized = True
                break
        if not categorized:
            layer_files["other"].append(f.path)

    return {k: v for k, v in layer_files.items() if v}


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute Senior frontend agent for the given issue."""
    github = GitHubClient()

    # 1. Read FE-TIER comment (Senior processes any tier — it's the final fallback).
    tier_comment = github.find_comment_by_prefix(issue, "## FE-TIER-")
    tier_data: dict[str, float | str | list[str]] = {}
    if tier_comment:
        tier_data = github.parse_fe_tier_comment(tier_comment) or {}

    # 2. Read ADR-FE comment for task details.
    adr_comment = github.find_comment_by_prefix(issue, "## ADR-FE-")
    if not adr_comment:
        _publish_block(github, issue, "No ## ADR-FE- comment found.")
        raise typer.Exit(code=1)

    parsed = github.parse_adr_fe_comment(adr_comment)
    issue_data = github.get_issue(issue)

    task = FrontendTask(
        issue_number=issue,
        title=issue_data.get("title", ""),
        description=parsed.get("description", ""),
        target_module=parsed.get("target_module", "shared"),
        affected_files=parsed.get("affected_files", []),
        classification=str(tier_data.get("classification", "T2")),
    )

    # 3. Detect LGPD scope — block and escalate if detected.
    lgpd_scope = _detect_lgpd_scope(task)
    if lgpd_scope:
        # LGPD tasks require human gate — publish escalation and stop if no gate approval.
        record = FrontendDecisionRecord(
            skill="skill_dev_fe_senior",
            issue_id=issue,
            decision_type="lgpd_check",
            decision="escalar",
            confidence_score=float(tier_data.get("confidence_score", 0.0)),
            tier="SENIOR",
            lgpd_scope=True,
            justification=(
                "LGPD-sensitive scope detected. "
                "Human gate approval required before code generation."
            ),
        )
        github.post_comment(issue, record.to_github_comment())
        # Check if LGPD gate was already approved (label check).
        issue_labels = [
            label.get("name", "") for label in issue_data.get("labels", [])
        ]
        if "lgpd/gate-approved" not in issue_labels:
            typer.echo("LGPD scope detected — awaiting human gate approval.")
            raise typer.Exit(code=0)

    # 4. Read TestPlan from DOM-05a if available.
    test_plan = github.find_comment_by_prefix(issue, "## TestPlan-")

    # 5. Build LLM context from blueprint (full for Senior).
    blueprint = BlueprintReader()
    blueprint_context = blueprint.build_context_for_tier("SENIOR")
    blueprint_hash = blueprint.hash

    # 6. Cross-layer impact analysis.
    model = ModelBudgetPolicy.default_model(FrontendTier.SENIOR)

    # 7. Generate code via LLM.
    provider = ProviderFactory.create(FrontendTier.SENIOR)
    system_prompt = _load_prompt()

    user_prompt_parts = [
        f"Blueprint context:\n{blueprint_context}\n",
        f"Task: {task.title}",
        f"Description: {task.description}",
        f"Module: {task.target_module}",
        f"Affected files: {', '.join(task.affected_files) or 'none'}",
        "Generate full-stack frontend TypeScript code across all layers as needed.",
        "Include: unit tests + integration tests + E2E stub (Playwright).",
        "Ensure aria-* attributes on all interactive components.",
        "Use i18n translation keys for all user-facing text.",
    ]
    if test_plan:
        user_prompt_parts.append(f"\nTestPlan context:\n{test_plan}")
    if lgpd_scope:
        user_prompt_parts.append(
            "\nLGPD scope: this task involves personal data. "
            "Apply masking patterns and consent verification where applicable."
        )

    user_prompt = "\n".join(user_prompt_parts)

    response = provider.call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 8. Strip prose (NV-01..NV-06).
    try:
        stripped = OutputPolicy.strip_prose(response.content)
    except OutputPolicyViolation as exc:
        _publish_block(github, issue, f"OutputPolicy violation: {exc.reason}")
        raise typer.Exit(code=1)

    # 9. Build generated files.
    generated_files: list[GeneratedFile] = []
    for block in stripped.code_blocks:
        is_test = (
            ".test." in block.file_path
            or ".spec." in block.file_path
            or "test" in block.language.lower()
            or "e2e" in block.file_path.lower()
        )
        generated_files.append(
            GeneratedFile(
                path=block.file_path or "generated/Unknown.tsx",
                content=block.content,
                is_test=is_test,
            ),
        )

    # 10. Validate: accessibility, auth guards, NV-03 comments.
    all_violations: list[str] = []
    all_violations.extend(_validate_accessibility(generated_files))
    all_violations.extend(_validate_auth_guards(generated_files))

    for f in generated_files:
        nv03_violations = OutputPolicy.validate_no_prose_comments(f.content)
        all_violations.extend(f"File '{f.path}': {v}" for v in nv03_violations)

    # Senior logs violations as warnings but does not block (human review expected).
    layer_impact = _perform_cross_layer_impact_analysis(generated_files)

    # 11. Detect RN triggers.
    rn_triggered: list[str] = []
    rn_pattern = re.compile(r"RN-\d{2}")
    for f in generated_files:
        rn_triggered.extend(rn_pattern.findall(f.content))
    rn_triggered = sorted(set(rn_triggered))

    result = CodeGenerationResult(
        files=generated_files,
        model_used=model,
        output_tokens_used=response.output_tokens,
        prompt_version="v1",
        blueprint_hash=blueprint_hash,
        raw_response=response.content,
    )

    # 12. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_senior",
        issue_id=issue,
        decision_type="code_generation",
        decision="approve",
        confidence_score=float(tier_data.get("confidence_score", 0.0)),
        tier="SENIOR",
        model_used=model,
        output_tokens_used=response.output_tokens,
        rn_triggered=rn_triggered,
        lgpd_scope=lgpd_scope,
        blueprint_hash=blueprint_hash,
        prompt_version="v1",
    )
    github.post_comment(issue, record.to_github_comment())

    typer.echo(
        f"Senior agent completed: {len(generated_files)} files generated. "
        f"Layers: {list(layer_impact.keys())}. "
        f"Violations (warnings): {len(all_violations)}."
    )


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_senior",
        issue_id=issue,
        decision_type="code_generation",
        decision="block",
        confidence_score=0.0,
        tier="SENIOR",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
