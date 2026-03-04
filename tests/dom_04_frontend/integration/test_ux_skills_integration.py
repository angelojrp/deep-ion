"""Integration tests for DOM-04 UX Skills.

Tests the full orchestration flow of each UX skill with mocked GitHub API and LLM provider.
"""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from typer.testing import CliRunner

from deep_ion.dom_04_frontend.providers.llm_provider import LLMResponse

runner = CliRunner()


# ── Fixtures ─────────────────────────────────────────────────────────────────


def _mock_github_client() -> MagicMock:
    """Create a fully mocked GitHubClient."""
    client = MagicMock()
    client.get_issue.return_value = {
        "title": "Add Balance Card Component",
        "number": 42,
        "body": "Create a balance card component showing account balance.\n<img src='icon.png'>",
        "labels": [],
    }
    client.post_comment.return_value = {"id": 1}
    client.add_label.return_value = {"id": 1}
    client.find_comment_by_prefix.return_value = None
    return client


def _mock_github_client_for_pr() -> MagicMock:
    """Create a mocked GitHubClient with PR-related methods."""
    client = _mock_github_client()
    client.get_pr_diff.return_value = """
diff --git a/src/presentation/components/Balance.tsx b/src/presentation/components/Balance.tsx
--- /dev/null
+++ b/src/presentation/components/Balance.tsx
@@ -0,0 +1,10 @@
+import React from 'react';
+
+export const Balance = () => {
+  return (
+    <div style={{ color: '#ff0000' }}>
+      <img src="icon.png">
+      Saldo disponível
+    </div>
+  );
+};
"""
    client.get_pr_files.return_value = [
        {"filename": "src/presentation/components/Balance.tsx", "status": "added"},
    ]
    return client


def _ux_analysis_llm_response(
    *,
    overall_score: float = 7.5,
    confidence_score: float = 0.85,
    violations: bool = True,
) -> LLMResponse:
    """Create a mock LLM response for UX analysis."""
    data: dict[str, Any] = {
        "screens_analyzed": ["balance-card"],
        "heuristic_violations": [],
        "wcag_issues": [],
        "consistency_issues": [],
        "overall_score": overall_score,
        "confidence_score": confidence_score,
    }
    if violations:
        data["heuristic_violations"] = [
            {
                "heuristic": "H1_visibility_of_system_status",
                "severity": "warning",
                "element": "balance display",
                "description": "No loading indicator",
                "suggestion": "Add skeleton loader",
            },
        ]
        data["wcag_issues"] = [
            {
                "criterion": "1.1.1",
                "level": "A",
                "severity": "blocker",
                "element": "<img>",
                "description": "Missing alt text",
                "suggestion": "Add alt attribute",
            },
        ]
    return LLMResponse(
        content=f"```json\n{json.dumps(data, indent=2)}\n```",
        model="gpt-4o",
        output_tokens=200,
        input_tokens=500,
    )


def _ux_prototype_llm_response() -> LLMResponse:
    """Create a mock LLM response for prototype generation."""
    html = """<!-- screen: balance-card | state: data | flow-from: home | flow-to: transactions -->
<main>
    <h1>Saldo</h1>
    <div class="card">
        <span>R$ 1.234,56</span>
    </div>
    <button data-flow="transactions">Ver transações</button>
</main>"""
    content = f"```html docs/business/conta/prototipos/balance-card.html\n{html}\n```"
    return LLMResponse(
        content=content,
        model="gpt-4o",
        output_tokens=150,
        input_tokens=400,
    )


def _ux_component_llm_response() -> LLMResponse:
    """Create a mock LLM response for component generation."""
    component = """import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils';

interface BalanceCardProps {
  amount: number;
  currency?: string;
}

export const BalanceCard = ({ amount, currency = 'BRL' }: BalanceCardProps) => {
  const { t } = useTranslation();
  return (
    <div className={cn("rounded-lg p-4 shadow-md")} aria-label={t('balance.card')}>
      <span>{t('balance.label')}</span>
      <span>R$ {amount.toLocaleString('pt-BR')}</span>
    </div>
  );
};"""
    test = """import { render, screen } from '@testing-library/react';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard', () => {
  it('renders balance amount', () => {
    render(<BalanceCard amount={1234.56} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});"""
    content = (
        f"```tsx presentation/components/BalanceCard/BalanceCard.tsx\n{component}\n```\n\n"
        f"```tsx tests/presentation/components/BalanceCard.test.tsx\n{test}\n```"
    )
    return LLMResponse(
        content=content,
        model="gpt-4o",
        output_tokens=300,
        input_tokens=600,
    )


def _ux_review_llm_response(*, verdict: str = "block") -> LLMResponse:
    """Create a mock LLM response for UX PR review."""
    data = {
        "findings": [
            {
                "check": "R3",
                "severity": "blocker",
                "file": "src/presentation/components/Balance.tsx",
                "line_hint": "Saldo disponível",
                "description": "Hardcoded user-facing text",
                "suggestion": "Use useTranslation()",
            },
        ],
        "summary": {
            "blockers": 1,
            "warnings": 0,
            "infos": 0,
            "verdict": verdict,
        },
        "confidence_score": 0.90,
    }
    return LLMResponse(
        content=f"```json\n{json.dumps(data, indent=2)}\n```",
        model="gpt-4o",
        output_tokens=100,
        input_tokens=300,
    )


# ── SKILL-UX-00 Tests ───────────────────────────────────────────────────────


class TestSkillUx00Integration:
    """Integration tests for UX Analysis skill."""

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.GitHubClient")
    def test_successful_analysis(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client()
        MockGitHub.return_value = github

        MockBlueprint.return_value.build_context_for_tier.return_value = "blueprint ctx"
        MockBlueprint.return_value.hash = "abc123"
        MockTemplate.return_value.build_ux_context.return_value = "ux ctx"

        provider = MagicMock()
        provider.call.return_value = _ux_analysis_llm_response()
        MockProvider.create.return_value = provider

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_00 import app

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "UX Analysis completed" in result.stdout
        # Verify labels were applied.
        github.add_label.assert_any_call(42, "ux/analise-em-andamento")
        github.add_label.assert_any_call(42, "ux/analise-concluida")
        # Verify report was posted.
        assert github.post_comment.call_count >= 2  # report + decision record

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_00.GitHubClient")
    def test_low_confidence_escalation(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client()
        MockGitHub.return_value = github

        MockBlueprint.return_value.build_context_for_tier.return_value = "ctx"
        MockBlueprint.return_value.hash = "abc123"
        MockTemplate.return_value.build_ux_context.return_value = "ux"

        provider = MagicMock()
        provider.call.return_value = _ux_analysis_llm_response(confidence_score=0.40)
        MockProvider.create.return_value = provider

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_00 import app

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "escalated" in result.stdout
        github.add_label.assert_any_call(42, "ux/analise-escalada")


# ── SKILL-UX-01 Tests ───────────────────────────────────────────────────────


class TestSkillUx01Integration:
    """Integration tests for UX Prototype Generator skill."""

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_01.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_01.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_01.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_01.GitHubClient")
    def test_successful_prototype_generation(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client()
        MockGitHub.return_value = github

        MockBlueprint.return_value.build_context_for_tier.return_value = "blueprint ctx"
        MockBlueprint.return_value.hash = "abc123"
        MockTemplate.return_value.build_ux_context.return_value = "ux ctx"
        MockTemplate.return_value.read_template.return_value = "<html>template</html>"
        MockTemplate.return_value.extract_design_tokens.return_value = {"--color-primary": "#6C5CE7"}

        provider = MagicMock()
        provider.call.return_value = _ux_prototype_llm_response()
        MockProvider.create.return_value = provider

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_01 import app

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "Prototype generated" in result.stdout
        github.add_label.assert_any_call(42, "ux/prototipo-em-andamento")
        github.add_label.assert_any_call(42, "ux/prototipo-concluido")


# ── SKILL-UX-02 Tests ───────────────────────────────────────────────────────


class TestSkillUx02Integration:
    """Integration tests for UX Component Generator skill."""

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_02.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_02.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_02.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_02.GitHubClient")
    def test_successful_component_generation(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client()
        MockGitHub.return_value = github

        MockBlueprint.return_value.build_context_for_tier.return_value = "blueprint ctx"
        MockBlueprint.return_value.hash = "abc123"
        MockTemplate.return_value.build_ux_context.return_value = "ux ctx"

        provider = MagicMock()
        provider.call.return_value = _ux_component_llm_response()
        MockProvider.create.return_value = provider

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_02 import app

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "Component generation completed" in result.stdout
        github.add_label.assert_any_call(42, "ux/componente-em-andamento")
        github.add_label.assert_any_call(42, "ux/componente-concluido")


# ── SKILL-UX-03 Tests ───────────────────────────────────────────────────────


class TestSkillUx03Integration:
    """Integration tests for UX PR Review skill."""

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.GitHubClient")
    def test_pr_with_blockers(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client_for_pr()
        MockGitHub.return_value = github

        MockBlueprint.return_value.hash = "abc123"
        MockTemplate.return_value.build_ux_context.return_value = "ux ctx"
        MockTemplate.return_value.extract_design_tokens.return_value = {}

        provider = MagicMock()
        provider.call.return_value = _ux_review_llm_response(verdict="block")
        MockProvider.create.return_value = provider

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_03 import app

        result = runner.invoke(app, ["--pr", "87"])

        assert result.exit_code == 0
        assert "verdict=block" in result.stdout
        github.add_label.assert_any_call(87, "ux/review-em-andamento")
        github.add_label.assert_any_call(87, "ux/review-bloqueado")

    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.ProviderFactory")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.BlueprintReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.TemplateReader")
    @patch("deep_ion.dom_04_frontend.skill_dev_fe_ux_03.GitHubClient")
    def test_pr_no_frontend_files(
        self,
        MockGitHub: MagicMock,
        MockTemplate: MagicMock,
        MockBlueprint: MagicMock,
        MockProvider: MagicMock,
    ) -> None:
        github = _mock_github_client()
        github.get_pr_diff.return_value = "diff --git a/README.md b/README.md\n+readme change"
        github.get_pr_files.return_value = [
            {"filename": "README.md", "status": "modified"},
        ]
        MockGitHub.return_value = github

        from deep_ion.dom_04_frontend.skill_dev_fe_ux_03 import app

        result = runner.invoke(app, ["--pr", "87"])

        assert result.exit_code == 0
        assert "auto-approved" in result.stdout
        github.add_label.assert_any_call(87, "ux/review-aprovado")
