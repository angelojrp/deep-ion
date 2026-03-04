"""skill_dev_fe_ux_01 — UX Prototype Generator entry point.

Generates low-fidelity HTML prototypes using the project's design tokens
and the prototype-screen-template.html as base.

Usage:
    python skill_dev_fe_ux_01.py --issue 42
"""

from __future__ import annotations

import json
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy, OutputPolicyViolation
from deep_ion.dom_04_frontend.domain.ux_policy import validate_design_token_usage
from deep_ion.dom_04_frontend.domain.ux_prototype_result import (
    PrototypeScreen,
    ScreenState,
    UxPrototypeResult,
)
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.template_reader import TemplateReader
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)


def _load_prompt() -> str:
    """Load the UX prototype prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "ux_prototype_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return "Generate HTML prototypes. Respond with code blocks only."


def _load_ux_context() -> str:
    """Load the shared UX context."""
    context_path = Path(__file__).resolve().parent / "prompts" / "ux_context_v1.txt"
    if context_path.exists():
        return context_path.read_text(encoding="utf-8")
    return ""


def _extract_screen_id(file_path: str, content: str) -> str:
    """Extract screen ID from file path or HTML comment."""
    # Try HTML comment: <!-- screen: {id} ... -->
    if "<!-- screen:" in content:
        start = content.index("<!-- screen:") + 12
        end = content.index("|", start) if "|" in content[start:start + 80] else content.index("-->", start)
        return content[start:end].strip()
    # Fall back to file path
    if file_path:
        return Path(file_path).stem
    return "unknown-screen"


def _extract_states(content: str) -> list[ScreenState]:
    """Extract screen states from HTML comment metadata."""
    state_map = {s.value: s for s in ScreenState}
    states: list[ScreenState] = []
    lower = content.lower()
    for state_name, state_enum in state_map.items():
        if state_name in lower:
            states.append(state_enum)
    return states or [ScreenState.DATA]


def _extract_flows(content: str) -> list[str]:
    """Extract navigation flows from data-flow attributes."""
    import re
    return re.findall(r'data-flow=["\']([^"\']+)["\']', content)


def _format_report(result: UxPrototypeResult) -> str:
    """Format the prototype result as a GitHub comment."""
    lines: list[str] = []
    lines.append(f"## UX-PROTO-{result.issue_number}")
    lines.append("")
    lines.append(f"**Screens:** {result.screen_count} | "
                 f"**All states covered:** {'✅' if result.all_states_covered else '⚠️ Incomplete'} | "
                 f"**Model:** {result.model_used}")
    lines.append("")

    for screen in result.screens:
        lines.append(f"### {screen.title} (`{screen.screen_id}`)")
        lines.append(f"**States:** {', '.join(s.value for s in screen.states)}")
        if screen.navigation_flows:
            lines.append(f"**Flows to:** {', '.join(screen.navigation_flows)}")
        lines.append("")
        lines.append(f"```html {screen.screen_id}.html")
        lines.append(screen.html_content)
        lines.append("```")
        lines.append("")

    if result.design_tokens_used:
        lines.append(f"**Design tokens used:** {', '.join(result.design_tokens_used[:20])}")

    return "\n".join(lines)


@app.command()
def main(
    issue: int = typer.Option(..., "--issue", help="GitHub Issue number"),
) -> None:
    """Execute UX Prototype Generator skill for the given issue."""
    github = GitHubClient()

    # 1. Transition label.
    github.add_label(issue, "ux/prototipo-em-andamento")

    # 2. Read issue details.
    issue_data = github.get_issue(issue)
    issue_body = issue_data.get("body", "") or ""
    issue_title = issue_data.get("title", "")

    # 3. Look for previous UX analysis comment.
    ux_analysis = github.find_comment_by_prefix(issue, f"## UX-ANALISE-{issue}") or ""

    # 4. Build context.
    blueprint = BlueprintReader()
    blueprint_context = blueprint.build_context_for_tier("SENIOR")
    template_reader = TemplateReader()
    template_html = template_reader.read_template()
    tokens = template_reader.extract_design_tokens()
    ux_shared_context = _load_ux_context()
    full_context = template_reader.build_ux_context(blueprint_context, ux_shared_context)

    # 5. Build user prompt.
    user_prompt_parts = [
        f"UX Context:\n{full_context}",
        f"\n\nBase HTML Template (use as reference for tokens and structure):\n```html\n{template_html[:3000]}\n```",
        f"\n\nIssue Title: {issue_title}",
        f"\nIssue Description:\n{issue_body}",
    ]
    if ux_analysis:
        user_prompt_parts.append(f"\n\nPrevious UX Analysis:\n{ux_analysis}")

    user_prompt = "".join(user_prompt_parts)

    # 6. Call LLM.
    system_prompt = _load_prompt()
    provider = ProviderFactory.create(FrontendTier.SENIOR)
    response = provider.call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 7. Strip prose and extract HTML blocks.
    try:
        stripped = OutputPolicy.strip_prose(response.content)
    except OutputPolicyViolation as exc:
        _publish_block(github, issue, f"OutputPolicy violation: {exc.reason}")
        raise typer.Exit(code=1)

    # 8. Build prototype screens from code blocks.
    screens: list[PrototypeScreen] = []
    tokens_used: set[str] = set()

    for block in stripped.code_blocks:
        if block.language not in ("html", "htm", ""):
            continue
        screen_id = _extract_screen_id(block.file_path, block.content)
        states = _extract_states(block.content)
        flows = _extract_flows(block.content)

        # Track token usage.
        for token_name in tokens:
            if token_name in block.content:
                tokens_used.add(token_name)

        screens.append(
            PrototypeScreen(
                screen_id=screen_id,
                title=screen_id.replace("-", " ").title(),
                html_content=block.content,
                states=states,
                navigation_flows=flows,
            ),
        )

    if not screens:
        _publish_block(github, issue, "LLM response contained no valid HTML prototype screens.")
        raise typer.Exit(code=1)

    result = UxPrototypeResult(
        issue_number=issue,
        screens=screens,
        design_tokens_used=sorted(tokens_used),
        blueprint_hash=blueprint.hash,
        model_used=response.model,
        prompt_version="v1",
    )

    # 9. Publish report.
    report = _format_report(result)
    github.post_comment(issue, report)

    # 10. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_01",
        issue_id=issue,
        decision_type="ux_prototype",
        decision="approve",
        confidence_score=1.0,
        tier="SENIOR",
        model_used=response.model,
        output_tokens_used=response.output_tokens,
        blueprint_hash=blueprint.hash[:12],
        prompt_version="v1",
    )
    github.post_comment(issue, record.to_github_comment())

    # 11. Transition label.
    github.add_label(issue, "ux/prototipo-concluido")

    typer.echo(f"UX Prototype generated: {result.screen_count} screens.")


def _publish_block(github: GitHubClient, issue: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_01",
        issue_id=issue,
        decision_type="ux_prototype",
        decision="block",
        confidence_score=0.0,
        tier="SENIOR",
        justification=reason,
    )
    github.post_comment(issue, record.to_github_comment())


if __name__ == "__main__":
    app()
