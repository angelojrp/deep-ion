"""skill_dev_fe_ux_03 — UX PR Review entry point.

Analyzes a Pull Request diff for UX issues: WCAG compliance, design token
consistency, i18n, responsive design, and component patterns.

Usage:
    python skill_dev_fe_ux_03.py --pr 87
"""

from __future__ import annotations

import json
from pathlib import Path

import typer

from deep_ion.dom_04_frontend.audit.frontend_ledger import FrontendDecisionRecord
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.ux_policy import validate_pr_diff_ux
from deep_ion.dom_04_frontend.infrastructure.blueprint_reader import BlueprintReader
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient
from deep_ion.dom_04_frontend.infrastructure.template_reader import TemplateReader
from deep_ion.dom_04_frontend.providers.provider_factory import ProviderFactory

app = typer.Typer(add_completion=False)

_CONFIDENCE_THRESHOLD = 0.65

_FRONTEND_EXTENSIONS = frozenset({".tsx", ".ts", ".css", ".html", ".jsx"})

_EXCLUDED_PATTERNS = frozenset({".test.", ".spec.", ".config.", "__test__", "__mock__"})


def _load_prompt() -> str:
    """Load the UX review prompt template."""
    prompt_path = Path(__file__).resolve().parent / "prompts" / "ux_review_v1.txt"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return "Review the PR diff for UX issues. Return JSON only."


def _load_ux_context() -> str:
    """Load the shared UX context."""
    context_path = Path(__file__).resolve().parent / "prompts" / "ux_context_v1.txt"
    if context_path.exists():
        return context_path.read_text(encoding="utf-8")
    return ""


def _filter_diff(full_diff: str, pr_files: list[dict]) -> str:
    """Filter diff to include only frontend-relevant files."""
    relevant_files = set()
    for f in pr_files:
        filename = f.get("filename", "")
        ext = Path(filename).suffix.lower()
        if ext in _FRONTEND_EXTENSIONS and not any(p in filename for p in _EXCLUDED_PATTERNS):
            relevant_files.add(filename)

    if not relevant_files:
        return ""

    # Parse the unified diff and keep only relevant file sections.
    sections: list[str] = []
    current_section: list[str] = []
    current_file = ""

    for line in full_diff.splitlines():
        if line.startswith("diff --git"):
            # Save previous section if relevant.
            if current_file and current_file in relevant_files and current_section:
                sections.append("\n".join(current_section))
            current_section = [line]
            # Extract file path: diff --git a/path b/path
            parts = line.split(" b/", 1)
            current_file = parts[1] if len(parts) > 1 else ""
        else:
            current_section.append(line)

    # Save last section.
    if current_file and current_file in relevant_files and current_section:
        sections.append("\n".join(current_section))

    return "\n".join(sections)


def _parse_llm_response(content: str) -> dict:
    """Extract JSON from LLM response, handling code fences."""
    if "```json" in content:
        start = content.index("```json") + 7
        end = content.index("```", start)
        return json.loads(content[start:end].strip())
    if "```" in content:
        start = content.index("```") + 3
        newline = content.index("\n", start)
        start = newline + 1
        end = content.index("```", start)
        return json.loads(content[start:end].strip())
    return json.loads(content.strip())


def _format_report(pr_number: int, data: dict, deterministic_findings: list[dict]) -> str:
    """Format the review findings as a GitHub comment."""
    lines: list[str] = []
    lines.append(f"## UX-REVIEW-{pr_number}")
    lines.append("")

    summary = data.get("summary", {})
    verdict = summary.get("verdict", "approve")
    verdict_icon = {"approve": "✅", "approve_with_warnings": "⚠️", "block": "❌"}.get(verdict, "")

    lines.append(f"**Verdict:** {verdict_icon} {verdict.upper()} | "
                 f"**Blockers:** {summary.get('blockers', 0)} | "
                 f"**Warnings:** {summary.get('warnings', 0)} | "
                 f"**Info:** {summary.get('infos', 0)}")
    lines.append("")

    all_findings = data.get("findings", [])

    # Add deterministic findings.
    for df in deterministic_findings:
        # Avoid duplicates (same check).
        if not any(f.get("check") == df["check"] for f in all_findings):
            all_findings.append({
                "check": df["check"],
                "severity": df["severity"],
                "file": "—",
                "line_hint": "—",
                "description": df["detail"],
                "suggestion": "See UX policy for remediation.",
            })

    if all_findings:
        lines.append("### Findings")
        lines.append("| # | Check | Severity | File | Description | Suggestion |")
        lines.append("|---|-------|----------|------|-------------|------------|")
        for i, f in enumerate(all_findings, 1):
            sev = f.get("severity", "info")
            sev_icon = {"blocker": "❌", "warning": "⚠️", "info": "ℹ️"}.get(sev, "")
            lines.append(
                f"| {i} | {f.get('check', '')} | {sev_icon} {sev} | "
                f"`{f.get('file', '')}` | {f.get('description', '')} | {f.get('suggestion', '')} |"
            )
        lines.append("")
    else:
        lines.append("### ✅ No UX issues found in this PR")
        lines.append("")

    return "\n".join(lines)


@app.command()
def main(
    pr: int = typer.Option(..., "--pr", help="Pull Request number"),
) -> None:
    """Execute UX PR Review skill for the given pull request."""
    github = GitHubClient()

    # 1. Transition label.
    github.add_label(pr, "ux/review-em-andamento")

    # 2. Fetch PR diff and files.
    try:
        full_diff = github.get_pr_diff(pr)
        pr_files = github.get_pr_files(pr)
    except Exception as exc:
        _publish_block(github, pr, f"Failed to fetch PR diff: {exc}")
        raise typer.Exit(code=1)

    # 3. Filter to frontend-relevant files.
    filtered_diff = _filter_diff(full_diff, pr_files)
    if not filtered_diff:
        # No frontend files changed — auto-approve.
        record = FrontendDecisionRecord(
            skill="skill_dev_fe_ux_03",
            issue_id=pr,
            decision_type="ux_review",
            decision="approve",
            confidence_score=1.0,
            tier="SENIOR",
            justification="No frontend files changed in this PR.",
        )
        github.post_comment(pr, record.to_github_comment())
        github.add_label(pr, "ux/review-aprovado")
        typer.echo("UX Review: no frontend files — auto-approved.")
        raise typer.Exit(code=0)

    # 4. Run deterministic checks.
    deterministic_findings = validate_pr_diff_ux(filtered_diff)

    # 5. Build LLM context.
    blueprint = BlueprintReader()
    ux_shared_context = _load_ux_context()
    template_reader = TemplateReader()
    tokens = template_reader.extract_design_tokens()
    token_summary = ", ".join(sorted(tokens.keys())[:30]) if tokens else "none extracted"

    user_prompt = (
        f"UX Context:\n{ux_shared_context}"
        f"\n\nDesign Tokens available: {token_summary}"
        f"\n\nPR Diff (frontend files only):\n```diff\n{filtered_diff[:8000]}\n```"
    )

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
        _publish_block(github, pr, f"Failed to parse LLM review response: {exc}")
        raise typer.Exit(code=1)

    # 8. Determine verdict (combine LLM + deterministic).
    llm_findings = data.get("findings", [])
    all_findings = llm_findings + deterministic_findings

    has_blockers = any(f.get("severity") == "blocker" for f in all_findings)
    has_warnings = any(f.get("severity") == "warning" for f in all_findings)

    if has_blockers:
        verdict = "block"
        verdict_label = "ux/review-bloqueado"
    elif has_warnings:
        verdict = "approve_with_warnings"
        verdict_label = "ux/review-aprovado-com-alertas"
    else:
        verdict = "approve"
        verdict_label = "ux/review-aprovado"

    # Ensure summary reflects combined findings.
    data["summary"] = {
        "blockers": sum(1 for f in all_findings if f.get("severity") == "blocker"),
        "warnings": sum(1 for f in all_findings if f.get("severity") == "warning"),
        "infos": sum(1 for f in all_findings if f.get("severity") == "info"),
        "verdict": verdict,
    }

    # 9. Check confidence.
    confidence = float(data.get("confidence_score", 1.0))
    if confidence < _CONFIDENCE_THRESHOLD:
        verdict_label = "ux/review-bloqueado"

    # 10. Publish report.
    report = _format_report(pr, data, deterministic_findings)
    if confidence < _CONFIDENCE_THRESHOLD:
        report += f"\n\n> ⚠️ **Escalado:** confidence_score {confidence:.2f} < {_CONFIDENCE_THRESHOLD}. Revisão humana necessária."
    github.post_comment(pr, report)

    # 11. Publish DecisionRecord.
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_03",
        issue_id=pr,
        decision_type="ux_review",
        decision=verdict,
        confidence_score=confidence,
        tier="SENIOR",
        model_used=response.model,
        output_tokens_used=response.output_tokens,
        blueprint_hash=blueprint.hash[:12],
        prompt_version="v1",
        blocks_detected=[f["check"] for f in all_findings if f.get("severity") == "blocker"],
        wcag_violations_count=sum(1 for f in all_findings if f.get("check", "").startswith("R1")),
    )
    github.post_comment(pr, record.to_github_comment())

    # 12. Apply verdict label.
    github.add_label(pr, verdict_label)

    typer.echo(f"UX Review completed: verdict={verdict}, blockers={data['summary']['blockers']}, warnings={data['summary']['warnings']}")


def _publish_block(github: GitHubClient, pr: int, reason: str) -> None:
    """Publish a block DecisionRecord."""
    record = FrontendDecisionRecord(
        skill="skill_dev_fe_ux_03",
        issue_id=pr,
        decision_type="ux_review",
        decision="block",
        confidence_score=0.0,
        tier="SENIOR",
        justification=reason,
    )
    github.post_comment(pr, record.to_github_comment())


if __name__ == "__main__":
    app()
