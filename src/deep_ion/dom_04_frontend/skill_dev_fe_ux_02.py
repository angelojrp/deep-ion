"""skill_dev_fe_ux_02 — UX Component & Pattern Generator entry point.

Creates reusable React components (shadcn/ui + Tailwind) and documents
UX patterns to facilitate the frontend development team.

Usage:
    python skill_dev_fe_ux_02.py --issue 42
"""

from __future__ import annotations

import json
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy, OutputPolicyViolation
from deep_ion.dom_04_frontend.domain.ux_component_result import (
    GeneratedUxComponent,
    UxComponentResult,
)
from deep_ion.dom_04_frontend.domain.ux_policy import validate_component_conventions
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.template_reader import TemplateReader
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)

# Component files must be in presentation/components/.
_ALLOWED_DIR = "presentation/components/"


def _load_prompt() -> str:
    """Load the UX component prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "ux_component_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return "Generate React components. Respond with code blocks only."


def _load_ux_context() -> str:
    """Load the shared UX context."""
    context_path = Path(__file__).resolve().parent / "prompts" / "ux_context_v1.txt"
    if context_path.exists():
        return context_path.read_text(encoding="utf-8")
    return ""


def _infer_component_name(file_path: str) -> str:
    """Infer PascalCase component name from file path."""
    stem = Path(file_path).stem
    # Remove common suffixes/prefixes
    for suffix in (".test", ".spec", ".example"):
        if stem.endswith(suffix):
            stem = stem[: -len(suffix)]
    return stem


def _is_test_file(path: str) -> bool:
    """Check if a file path represents a test file."""
    lower = path.lower()
    return any(marker in lower for marker in (".test.", ".spec.", "tests/", "example"))


def _format_report(result: UxComponentResult) -> str:
    """Format the component result as a GitHub comment."""
    lines: list[str] = []
    lines.append(f"## UX-COMP-{result.issue_number}")
    lines.append("")
    lines.append(f"**Components:** {result.component_count} | "
                 f"**Model:** {result.model_used} | "
                 f"**All paths valid:** {'✅' if result.all_paths_valid else '⚠️'}")
    lines.append("")

    for comp in result.components:
        lines.append(f"### `{comp.name}`")
        lines.append(f"**Path:** `{comp.file_path}`")
        lines.append("")

        if comp.props_interface:
            lines.append("**Props:**")
            lines.append(f"```typescript\n{comp.props_interface}\n```")
            lines.append("")

        lines.append("**Component:**")
        lines.append(f"```tsx {comp.file_path}\n{comp.code}\n```")
        lines.append("")

        if comp.test_code:
            lines.append("**Test:**")
            lines.append(f"```tsx tests/{comp.file_path.replace('.tsx', '.test.tsx')}\n{comp.test_code}\n```")
            lines.append("")

        if comp.usage_example:
            lines.append("**Usage:**")
            lines.append(f"```tsx\n{comp.usage_example}\n```")
            lines.append("")

        if comp.design_rationale:
            lines.append(f"> **Design rationale:** {comp.design_rationale}")
            lines.append("")

    if result.pattern_docs:
        lines.append("### Pattern Documentation")
        lines.append(result.pattern_docs)
        lines.append("")

    return "\n".join(lines)


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute UX Component Generator skill for the given issue."""
    github = GitHubClient()

    # 1. Transition label.
    github.add_label(issue, "ux/componente-em-andamento")

    # 2. Read issue details.
    issue_data = github.get_issue(issue)
    issue_body = issue_data.get("body", "") or ""
    issue_title = issue_data.get("title", "")

    # 3. Look for previous UX analysis and prototype comments.
    ux_analysis = github.find_comment_by_prefix(issue, f"## UX-ANALISE-{issue}") or ""
    ux_prototype = github.find_comment_by_prefix(issue, f"## UX-PROTO-{issue}") or ""

    # 4. Build context.
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
    if ux_analysis:
        user_prompt_parts.append(f"\n\nPrevious UX Analysis:\n{ux_analysis}")
    if ux_prototype:
        user_prompt_parts.append(f"\n\nPrevious UX Prototype:\n{ux_prototype[:3000]}")

    user_prompt = "".join(user_prompt_parts)

    # 6. Call LLM.
    system_prompt = _load_prompt()
    provider = ProviderFactory.create(FrontendTier.SENIOR)
    response = provider.call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 7. Strip prose and extract code blocks.
    try:
        stripped = OutputPolicy.strip_prose(response.content)
    except OutputPolicyViolation as exc:
        _publish_block(github, issue, f"OutputPolicy violation: {exc.reason}")
        raise typer.Exit(code=1)

    # 8. Build components from code blocks.
    # Group code blocks by component name.
    component_blocks: dict[str, dict[str, str]] = {}

    for block in stripped.code_blocks:
        name = _infer_component_name(block.file_path)
        if name not in component_blocks:
            component_blocks[name] = {"code": "", "test": "", "example": "", "props": ""}

        if _is_test_file(block.file_path):
            component_blocks[name]["test"] = block.content
        elif "example" in block.file_path.lower():
            component_blocks[name]["example"] = block.content
        elif block.file_path.startswith(_ALLOWED_DIR) or block.language in ("tsx", "typescript", "ts"):
            component_blocks[name]["code"] = block.content
            # Try to extract props interface.
            import re
            props_match = re.search(r"((?:export\s+)?(?:interface|type)\s+\w+Props\s*(?:extends[^{]+)?\{[^}]+\})", block.content, re.DOTALL)
            if props_match:
                component_blocks[name]["props"] = props_match.group(1)

    # 9. Validate components.
    components: list[GeneratedUxComponent] = []
    convention_warnings: list[str] = []

    for name, blocks in component_blocks.items():
        if not blocks["code"]:
            continue

        # Validate conventions.
        checks = validate_component_conventions(blocks["code"])
        failed_checks = [c for c in checks if not c.passed]
        if failed_checks:
            for c in failed_checks:
                convention_warnings.append(f"{name}: {c.rule} — {c.detail}")

        file_path = f"presentation/components/{name}/{name}.tsx"

        components.append(
            GeneratedUxComponent(
                name=name,
                file_path=file_path,
                code=blocks["code"],
                props_interface=blocks["props"],
                usage_example=blocks["example"],
                design_rationale="",
                test_code=blocks["test"],
            ),
        )

    if not components:
        _publish_block(github, issue, "LLM response contained no valid component code blocks.")
        raise typer.Exit(code=1)

    result = UxComponentResult(
        issue_number=issue,
        components=components,
        pattern_docs="",
        model_used=response.model,
        output_tokens_used=response.output_tokens,
        prompt_version="v1",
        blueprint_hash=blueprint.hash,
    )

    # 10. Publish report.
    report = _format_report(result)
    if convention_warnings:
        report += "\n\n### ⚠️ Convention Warnings\n" + "\n".join(f"- {w}" for w in convention_warnings)
    github.post_comment(issue, report)

    # 11. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_02",
        issue_id=issue,
        decision_type="ux_component",
        decision="approve",
        confidence_score=1.0,
        tier="SENIOR",
        model_used=response.model,
        output_tokens_used=response.output_tokens,
        blueprint_hash=blueprint.hash[:12],
        prompt_version="v1",
        blocks_detected=convention_warnings[:10],
    )
    github.post_comment(issue, record.to_github_comment())

    # 12. Transition label.
    github.add_label(issue, "ux/componente-concluido")

    typer.echo(f"UX Component generation completed: {result.component_count} components.")


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_02",
        issue_id=issue,
        decision_type="ux_component",
        decision="block",
        confidence_score=0.0,
        tier="SENIOR",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
