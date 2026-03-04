"""skill_dev_fe_junior — Junior Frontend Agent entry point.

Handles T0 (trivial) frontend tasks: atomic components, Tailwind adjustments,
simple validations. Presentation layer only. Model: GPT-4o.

Usage:
    python skill_dev_fe_junior.py --issue 42
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

# Junior allowed output directories (presentation layer only).
_JUNIOR_ALLOWED_DIRS: frozenset[str] = frozenset({
    "presentation/components/",
    "presentation/pages/",
})

# Junior forbidden import patterns.
_JUNIOR_FORBIDDEN_IMPORTS: list[re.Pattern[str]] = [
    re.compile(r"from\s+['\"]@infrastructure", re.IGNORECASE),
    re.compile(r"from\s+['\"]@application", re.IGNORECASE),
    re.compile(r"from\s+['\"]@domain", re.IGNORECASE),
    re.compile(r"import.*from\s+['\"].*infrastructure", re.IGNORECASE),
]


def _load_prompt() -> str:
    """Load the Junior codegen prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "junior_codegen_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return OutputPolicy.SYSTEM_INSTRUCTION


def _validate_output_paths(files: list[GeneratedFile]) -> list[str]:
    """Validate that all generated files are in Junior-allowed directories."""
    violations: list[str] = []
    for f in files:
        path_lower = f.path.lower()
        if not any(allowed in path_lower for allowed in _JUNIOR_ALLOWED_DIRS):
            violations.append(f"File '{f.path}' is outside Junior allowed directories.")
    return violations


def _validate_imports(files: list[GeneratedFile]) -> list[str]:
    """Validate that no generated file imports from forbidden layers."""
    violations: list[str] = []
    for f in files:
        if f.is_test:
            continue
        for pattern in _JUNIOR_FORBIDDEN_IMPORTS:
            if pattern.search(f.content):
                violations.append(f"File '{f.path}' contains forbidden import: {pattern.pattern}")
    return violations


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute Junior frontend agent for the given issue."""
    github = GitHubClient()

    # 1. Read FE-TIER comment and validate tier == JUNIOR.
    tier_comment = github.find_comment_by_prefix(issue, "## FE-TIER-")
    if not tier_comment:
        _publish_block(github, issue, "No ## FE-TIER- comment found.")
        raise typer.Exit(code=1)

    tier_data = github.parse_fe_tier_comment(tier_comment)
    if not tier_data or tier_data.get("tier") != "JUNIOR":
        _publish_block(github, issue, f"Tier mismatch: expected JUNIOR, got {tier_data}")
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
        classification="T0",
    )

    # 3. Validate model budget.
    model = ModelBudgetPolicy.default_model(FrontendTier.JUNIOR)
    try:
        ModelBudgetPolicy.validate_or_raise(model, FrontendTier.JUNIOR)
    except ModelBudgetViolation as exc:
        _publish_block(github, issue, f"Model budget violation: {exc}")
        raise typer.Exit(code=1)

    # 4. Build LLM context from blueprint.
    blueprint = BlueprintReader()
    blueprint_context = blueprint.build_context_for_tier("JUNIOR")
    blueprint_hash = blueprint.hash

    # 5. Generate code via LLM.
    provider = ProviderFactory.create(FrontendTier.JUNIOR)
    system_prompt = _load_prompt()
    user_prompt = (
        f"Blueprint context:\n{blueprint_context}\n\n"
        f"Task: {task.title}\n"
        f"Description: {task.description}\n"
        f"Module: {task.target_module}\n"
        f"Generate TypeScript code for presentation layer only. "
        f"Include Vitest + Testing Library tests."
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
                path=block.file_path or f"presentation/components/Generated.tsx",
                content=block.content,
                is_test=is_test,
            ),
        )

    # 8. Validate output paths and imports.
    path_violations = _validate_output_paths([f for f in generated_files if not f.is_test])
    import_violations = _validate_imports(generated_files)
    all_violations = path_violations + import_violations

    if all_violations:
        _publish_block(
            github,
            issue,
            f"Layer isolation violations:\n" + "\n".join(f"- {v}" for v in all_violations),
        )
        raise typer.Exit(code=1)

    result = CodeGenerationResult(
        files=generated_files,
        model_used=model,
        output_tokens_used=response.output_tokens,
        prompt_version="v1",
        blueprint_hash=blueprint_hash,
        raw_response=response.content,
    )

    # 9. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_junior",
        issue_id=issue,
        decision_type="code_generation",
        decision="approve",
        confidence_score=tier_data.get("confidence_score", 0.0),
        tier="JUNIOR",
        model_used=model,
        output_tokens_used=response.output_tokens,
        blueprint_hash=blueprint_hash,
        prompt_version="v1",
    )
    github.post_comment(issue, record.to_github_comment())

    typer.echo(f"Junior agent completed: {len(generated_files)} files generated.")


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_junior",
        issue_id=issue,
        decision_type="code_generation",
        decision="block",
        confidence_score=0.0,
        tier="JUNIOR",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
