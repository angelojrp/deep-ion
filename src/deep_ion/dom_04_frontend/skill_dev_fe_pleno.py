"""skill_dev_fe_pleno — Pleno Frontend Agent entry point.

Handles T0/T1 frontend tasks: pages with hooks, TanStack Query integration,
use-cases, FE deterministic error handling. Model: GPT-5.1-Codex.

Usage:
    python skill_dev_fe_pleno.py --issue 42
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
from deep_ion.dom_04_frontend.domain.model_budget_policy import ModelBudgetPolicy, ModelBudgetViolation
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy, OutputPolicyViolation
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.pr_publisher import PrPublisher, GitHubContext
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)

# Pleno allowed output directories (presentation + application layers).
_PLENO_ALLOWED_DIRS: frozenset[str] = frozenset({
    "presentation/components/",
    "presentation/pages/",
    "application/hooks/",
    "application/use-cases/",
    "application/stores/",
})

# Pleno forbidden import patterns.
_PLENO_FORBIDDEN_IMPORTS: list[re.Pattern[str]] = [
    re.compile(r"from\s+['\"]@infrastructure/auth", re.IGNORECASE),
    re.compile(r"import.*tokenService", re.IGNORECASE),
]

# i18n enforcement pattern — user-facing text must use translation keys.
_HARDCODED_TEXT_PATTERN = re.compile(
    r"""(?:>\s*[A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[a-zà-ÿA-ZÀ-ÿ]+){2,}|"""
    r"""(?:label|placeholder|title|alt)=["'][A-ZÀ-ÿ])""",
)


def _load_prompt() -> str:
    """Load the Pleno codegen prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "pleno_codegen_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return OutputPolicy.SYSTEM_INSTRUCTION


def _validate_output_paths(files: list[GeneratedFile]) -> list[str]:
    """Validate that all generated files are in Pleno-allowed directories."""
    violations: list[str] = []
    for f in files:
        if f.is_test:
            continue
        path_lower = f.path.lower()
        if not any(allowed in path_lower for allowed in _PLENO_ALLOWED_DIRS):
            violations.append(f"File '{f.path}' is outside Pleno allowed directories.")
    return violations


def _validate_imports(files: list[GeneratedFile]) -> list[str]:
    """Validate import restrictions for Pleno."""
    violations: list[str] = []
    for f in files:
        if f.is_test:
            continue
        for pattern in _PLENO_FORBIDDEN_IMPORTS:
            if pattern.search(f.content):
                violations.append(f"File '{f.path}' contains forbidden import: {pattern.pattern}")
    return violations


def _validate_i18n(files: list[GeneratedFile]) -> list[str]:
    """Check for hardcoded user-facing text (must use i18n keys)."""
    violations: list[str] = []
    for f in files:
        if f.is_test or not f.path.endswith((".tsx", ".ts")):
            continue
        for i, line in enumerate(f.content.splitlines(), start=1):
            if _HARDCODED_TEXT_PATTERN.search(line):
                violations.append(
                    f"File '{f.path}' line {i}: possible hardcoded user-facing text (must use i18n).",
                )
    return violations


def _validate_tanstack_patterns(files: list[GeneratedFile]) -> list[str]:
    """Validate TanStack Query patterns — hooks only in hooks/, not in use-cases."""
    violations: list[str] = []
    for f in files:
        if f.is_test:
            continue
        if "use-cases/" in f.path.lower():
            if re.search(r"\b(useQuery|useMutation|useQueryClient)\b", f.content):
                violations.append(
                    f"File '{f.path}': TanStack Query hooks not allowed in use-cases layer.",
                )
    return violations


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute Pleno frontend agent for the given issue."""
    github = GitHubClient()

    # 1. Read FE-TIER comment and validate tier == PLENO.
    tier_comment = github.find_comment_by_prefix(issue, "## FE-TIER-")
    if not tier_comment:
        _publish_block(github, issue, "No ## FE-TIER- comment found.")
        raise typer.Exit(code=1)

    tier_data = github.parse_fe_tier_comment(tier_comment)
    if not tier_data or tier_data.get("tier") not in ("PLENO", "JUNIOR"):
        _publish_block(github, issue, f"Tier mismatch: expected PLENO, got {tier_data}")
        raise typer.Exit(code=1)

    # Block if tier is SENIOR (Pleno cannot handle Senior tasks).
    if tier_data.get("tier") == "SENIOR":
        _publish_block(github, issue, "Tier is SENIOR — Pleno cannot handle this task.")
        raise typer.Exit(code=1)

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
        classification="T1",
    )

    # 3. Validate model budget.
    model = ModelBudgetPolicy.default_model(FrontendTier.PLENO)
    try:
        ModelBudgetPolicy.validate_or_raise(model, FrontendTier.PLENO)
    except ModelBudgetViolation as exc:
        _publish_block(github, issue, f"Model budget violation: {exc}")
        raise typer.Exit(code=1)

    # 4. Build LLM context from blueprint.
    blueprint = BlueprintReader()
    blueprint_context = blueprint.build_context_for_tier("PLENO")
    blueprint_hash = blueprint.hash

    # 5. Generate code via LLM.
    provider = ProviderFactory.create(FrontendTier.PLENO)
    system_prompt = _load_prompt()
    user_prompt = (
        f"Blueprint context:\n{blueprint_context}\n\n"
        f"Task: {task.title}\n"
        f"Description: {task.description}\n"
        f"Module: {task.target_module}\n"
        f"Generate TypeScript code for presentation and application layers. "
        f"Include custom hooks with TanStack Query patterns. "
        f"Include unit tests (hooks) + integration tests (MSW mock server). "
        f"Use i18n translation keys for all user-facing text."
    )

    response = provider.call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 6. Strip prose (NV-01..NV-06).
    try:
        stripped = OutputPolicy.strip_prose(response.content)
    except OutputPolicyViolation as exc:
        _publish_block(github, issue, f"OutputPolicy violation: {exc.reason}")
        raise typer.Exit(code=1)

    # 7. Build generated files from code blocks.
    generated_files: list[GeneratedFile] = []
    for block in stripped.code_blocks:
        is_test = ".test." in block.file_path or "test" in block.language.lower()
        generated_files.append(
            GeneratedFile(
                path=block.file_path or f"application/hooks/useGenerated.ts",
                content=block.content,
                is_test=is_test,
            ),
        )

    # 8. Validate output paths, imports, i18n, and TanStack patterns.
    all_violations: list[str] = []
    all_violations.extend(_validate_output_paths(generated_files))
    all_violations.extend(_validate_imports(generated_files))
    all_violations.extend(_validate_i18n(generated_files))
    all_violations.extend(_validate_tanstack_patterns(generated_files))

    # Check for NV-03 violations in generated code.
    for f in generated_files:
        nv03_violations = OutputPolicy.validate_no_prose_comments(f.content)
        all_violations.extend(f"File '{f.path}': {v}" for v in nv03_violations)

    if all_violations:
        _publish_block(
            github,
            issue,
            "Validation violations:\n" + "\n".join(f"- {v}" for v in all_violations),
        )
        raise typer.Exit(code=1)

    # 9. Detect RN triggers.
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

    # 10. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_pleno",
        issue_id=issue,
        decision_type="code_generation",
        decision="approve",
        confidence_score=tier_data.get("confidence_score", 0.0),
        tier="PLENO",
        model_used=model,
        output_tokens_used=response.output_tokens,
        rn_triggered=rn_triggered,
        blueprint_hash=blueprint_hash,
        prompt_version="v1",
    )
    github.post_comment(issue, record.to_github_comment())

    typer.echo(f"Pleno agent completed: {len(generated_files)} files generated.")


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_pleno",
        issue_id=issue,
        decision_type="code_generation",
        decision="block",
        confidence_score=0.0,
        tier="PLENO",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
