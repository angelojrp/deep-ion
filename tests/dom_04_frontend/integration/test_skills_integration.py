"""Integration tests for DOM-04 Frontend Skills.

Tests the full orchestration flow of each skill with mocked GitHub API and LLM provider.
Uses pytest + unittest.mock to isolate external dependencies.
"""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from typer.testing import CliRunner

from deep_ion.dom_04_frontend.providers.llm_provider import LLMResponse


# ── Fixtures ─────────────────────────────────────────────────────────────────

runner = CliRunner()


def _mock_github_client() -> MagicMock:
    """Create a fully mocked GitHubClient."""
    client = MagicMock()
    client.get_issue.return_value = {
        "title": "Add Balance Component",
        "number": 42,
        "labels": [],
    }
    client.post_comment.return_value = {"id": 1}
    client.add_label.return_value = {"id": 1}
    return client


def _adr_fe_comment(
    *,
    description: str = "Simple balance display",
    target_module: str = "conta",
    affected_files: list[str] | None = None,
) -> str:
    return (
        f"## ADR-FE-42\n\n"
        f"Description: {description}\n"
        f"Module: {target_module}\n"
        f"Files: {', '.join(affected_files or [])}\n"
    )


def _fe_tier_comment(
    *,
    tier: str = "JUNIOR",
    confidence_score: float = 0.85,
    complexity_score: float = 1.0,
) -> str:
    data = {
        "tier": tier,
        "score_complexidade": complexity_score,
        "confidence_score": confidence_score,
    }
    return f"## FE-TIER-42\n\n```json\n{json.dumps(data, indent=2)}\n```"


def _llm_response_with_code(
    *,
    code: str = "export const Balance = () => <div>Balance</div>;",
    file_path: str = "presentation/components/Balance.tsx",
    language: str = "tsx",
    model: str = "gpt-4o",
    extra_block: str | None = None,
) -> LLMResponse:
    content = f"```{language} {file_path}\n{code}\n```"
    if extra_block:
        content += f"\n{extra_block}"
    return LLMResponse(
        content=content,
        model=model,
        output_tokens=50,
        input_tokens=100,
        finish_reason="stop",
    )


def _llm_json_response(
    *,
    complexity_score: float = 1.5,
    confidence_score: float = 0.85,
    model: str = "gpt-4o",
) -> LLMResponse:
    data = {
        "complexity_score": complexity_score,
        "confidence_score": confidence_score,
    }
    return LLMResponse(
        content=json.dumps(data),
        model=model,
        output_tokens=10,
        input_tokens=50,
        finish_reason="stop",
    )


# ── Classifier Skill Tests ──────────────────────────────────────────────────

_CLS_MOD = "deep_ion.dom_04_frontend.skill_dev_fe_classifier"


class TestClassifierSkill:
    """Integration tests for skill_dev_fe_classifier."""

    @patch(f"{_CLS_MOD}.ProviderFactory")
    @patch(f"{_CLS_MOD}.GitHubClient")
    def test_happy_path_classifies_to_junior(
        self, MockGitHubClient: MagicMock, MockProviderFactory: MagicMock
    ) -> None:
        """Simple task → classified as JUNIOR, label applied, comment posted."""
        from deep_ion.dom_04_frontend.skill_dev_fe_classifier import app

        github = _mock_github_client()
        MockGitHubClient.return_value = github

        # ADR-FE comment present.
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _adr_fe_comment() if prefix == "## ADR-FE-" else None
        )
        github.parse_adr_fe_comment.return_value = {
            "description": "Simple balance display",
            "target_module": "conta",
            "affected_files": [],
        }

        # LLM returns valid JSON with high confidence.
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_json_response(confidence_score=0.90)
        MockProviderFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        # Should post FE-TIER comment + DecisionRecord.
        assert github.post_comment.call_count >= 2
        # Should add a tier label.
        github.add_label.assert_called_once()
        label_arg = github.add_label.call_args[0][1]
        assert label_arg == "fe-agent/junior"

    @patch(f"{_CLS_MOD}.ProviderFactory")
    @patch(f"{_CLS_MOD}.GitHubClient")
    def test_low_confidence_escalates(
        self, MockGitHubClient: MagicMock, MockProviderFactory: MagicMock
    ) -> None:
        """Confidence < 0.65 → escalates with fe-agent/escalado label."""
        from deep_ion.dom_04_frontend.skill_dev_fe_classifier import app

        github = _mock_github_client()
        MockGitHubClient.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _adr_fe_comment() if prefix == "## ADR-FE-" else None
        )
        github.parse_adr_fe_comment.return_value = {
            "description": "Simple component",
            "target_module": "shared",
            "affected_files": [],
        }

        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_json_response(confidence_score=0.30)
        MockProviderFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        # Should add escalation label.
        github.add_label.assert_called_once_with(42, "fe-agent/escalado")

    @patch(f"{_CLS_MOD}.GitHubClient")
    def test_missing_adr_comment_blocks(self, MockGitHubClient: MagicMock) -> None:
        """No ADR-FE comment → blocks with decision='block'."""
        from deep_ion.dom_04_frontend.skill_dev_fe_classifier import app

        github = _mock_github_client()
        MockGitHubClient.return_value = github
        github.find_comment_by_prefix.return_value = None

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1
        # Block DecisionRecord posted.
        github.post_comment.assert_called_once()

    @patch(f"{_CLS_MOD}.ProviderFactory")
    @patch(f"{_CLS_MOD}.GitHubClient")
    def test_auth_keyword_routes_to_senior(
        self, MockGitHubClient: MagicMock, MockProviderFactory: MagicMock
    ) -> None:
        """Task with auth keywords → blocks at both Junior and Pleno → SENIOR."""
        from deep_ion.dom_04_frontend.skill_dev_fe_classifier import app

        github = _mock_github_client()
        MockGitHubClient.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _adr_fe_comment(description="Implement oauth2 authentication flow")
            if prefix == "## ADR-FE-"
            else None
        )
        github.parse_adr_fe_comment.return_value = {
            "description": "Implement oauth2 authentication flow",
            "target_module": "conta",
            "affected_files": [],
        }

        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_json_response(confidence_score=0.90)
        MockProviderFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        label_arg = github.add_label.call_args[0][1]
        assert label_arg == "fe-agent/senior"


# ── Junior Skill Tests ───────────────────────────────────────────────────────

_JR_MOD = "deep_ion.dom_04_frontend.skill_dev_fe_junior"


class TestJuniorSkill:
    """Integration tests for skill_dev_fe_junior."""

    @patch(f"{_JR_MOD}.ProviderFactory")
    @patch(f"{_JR_MOD}.BlueprintReader")
    @patch(f"{_JR_MOD}.GitHubClient")
    def test_happy_path_generates_code(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """Valid JUNIOR tier + valid LLM output → code generated, decision posted."""
        from deep_ion.dom_04_frontend.skill_dev_fe_junior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="JUNIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment() if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "JUNIOR", "confidence_score": 0.85}
        github.parse_adr_fe_comment.return_value = {
            "description": "Simple button",
            "target_module": "shared",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "# Presentation layer context"
        blueprint.hash = "abc123"
        MockBlueprint.return_value = blueprint

        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code()
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "completed" in result.output.lower()
        github.post_comment.assert_called()

    @patch(f"{_JR_MOD}.GitHubClient")
    def test_missing_tier_comment_blocks(self, MockGitHub: MagicMock) -> None:
        """No FE-TIER comment → blocks."""
        from deep_ion.dom_04_frontend.skill_dev_fe_junior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.return_value = None

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1

    @patch(f"{_JR_MOD}.GitHubClient")
    def test_tier_mismatch_blocks(self, MockGitHub: MagicMock) -> None:
        """Tier = PLENO → Junior skill blocks."""
        from deep_ion.dom_04_frontend.skill_dev_fe_junior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="PLENO") if prefix == "## FE-TIER-" else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "PLENO", "confidence_score": 0.9}

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1

    @patch(f"{_JR_MOD}.ProviderFactory")
    @patch(f"{_JR_MOD}.BlueprintReader")
    @patch(f"{_JR_MOD}.GitHubClient")
    def test_layer_violation_blocks(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """Generated file outside presentation layer → blocks."""
        from deep_ion.dom_04_frontend.skill_dev_fe_junior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="JUNIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment() if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "JUNIOR", "confidence_score": 0.85}
        github.parse_adr_fe_comment.return_value = {
            "description": "Component",
            "target_module": "shared",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "context"
        blueprint.hash = "abc"
        MockBlueprint.return_value = blueprint

        # LLM generates file in infrastructure layer — violation.
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code(
            file_path="infrastructure/api/client.ts",
            code="export const apiClient = {};",
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1

    @patch(f"{_JR_MOD}.ProviderFactory")
    @patch(f"{_JR_MOD}.BlueprintReader")
    @patch(f"{_JR_MOD}.GitHubClient")
    def test_output_policy_violation_blocks(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """LLM returns no code blocks → OutputPolicyViolation → blocks."""
        from deep_ion.dom_04_frontend.skill_dev_fe_junior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="JUNIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment() if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "JUNIOR", "confidence_score": 0.85}
        github.parse_adr_fe_comment.return_value = {
            "description": "Component",
            "target_module": "shared",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "context"
        blueprint.hash = "abc"
        MockBlueprint.return_value = blueprint

        # LLM returns prose only — no code blocks.
        mock_provider = MagicMock()
        mock_provider.call.return_value = LLMResponse(
            content="Here is a great explanation of how to build this component.",
            model="gpt-4o",
            output_tokens=50,
            input_tokens=100,
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1


# ── Pleno Skill Tests ────────────────────────────────────────────────────────

_PL_MOD = "deep_ion.dom_04_frontend.skill_dev_fe_pleno"


class TestPlenoSkill:
    """Integration tests for skill_dev_fe_pleno."""

    @patch(f"{_PL_MOD}.ProviderFactory")
    @patch(f"{_PL_MOD}.BlueprintReader")
    @patch(f"{_PL_MOD}.GitHubClient")
    def test_happy_path_pleno(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """Valid PLENO tier + valid LLM output → code generated."""
        from deep_ion.dom_04_frontend.skill_dev_fe_pleno import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="PLENO") if prefix == "## FE-TIER-"
            else _adr_fe_comment() if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "PLENO", "confidence_score": 0.85}
        github.parse_adr_fe_comment.return_value = {
            "description": "Add transfer form with hook",
            "target_module": "transacao",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "# Pleno context"
        blueprint.hash = "def456"
        MockBlueprint.return_value = blueprint

        hook_code = (
            "import { useQuery } from '@tanstack/react-query';\n"
            "// RN-01\n"
            "export const useBalance = () => useQuery({ queryKey: ['balance'] });\n"
        )
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code(
            file_path="application/hooks/useBalance.ts",
            language="ts",
            code=hook_code,
            model="gpt-5.1-codex",
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "completed" in result.output.lower()

    @patch(f"{_PL_MOD}.GitHubClient")
    def test_senior_tier_rejected(self, MockGitHub: MagicMock) -> None:
        """Pleno skill rejects SENIOR tier."""
        from deep_ion.dom_04_frontend.skill_dev_fe_pleno import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="SENIOR") if prefix == "## FE-TIER-" else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "SENIOR", "confidence_score": 0.9}

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1

    @patch(f"{_PL_MOD}.ProviderFactory")
    @patch(f"{_PL_MOD}.BlueprintReader")
    @patch(f"{_PL_MOD}.GitHubClient")
    def test_tanstack_in_usecases_blocked(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """TanStack Query hook in use-cases layer → validation violation."""
        from deep_ion.dom_04_frontend.skill_dev_fe_pleno import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="PLENO") if prefix == "## FE-TIER-"
            else _adr_fe_comment() if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "PLENO", "confidence_score": 0.85}
        github.parse_adr_fe_comment.return_value = {
            "description": "Use case logic",
            "target_module": "transacao",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "context"
        blueprint.hash = "abc"
        MockBlueprint.return_value = blueprint

        # useQuery in use-cases layer = violation.
        bad_code = "import { useQuery } from '@tanstack/react-query';\nexport const loadData = () => useQuery({});"
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code(
            file_path="application/use-cases/loadData.ts",
            language="ts",
            code=bad_code,
            model="gpt-5.1-codex",
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1


# ── Senior Skill Tests ───────────────────────────────────────────────────────

_SR_MOD = "deep_ion.dom_04_frontend.skill_dev_fe_senior"


class TestSeniorSkill:
    """Integration tests for skill_dev_fe_senior."""

    @patch(f"{_SR_MOD}.ProviderFactory")
    @patch(f"{_SR_MOD}.BlueprintReader")
    @patch(f"{_SR_MOD}.GitHubClient")
    def test_happy_path_senior(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """Valid SENIOR task → code generated across layers."""
        from deep_ion.dom_04_frontend.skill_dev_fe_senior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="SENIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment(description="Full auth module") if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "SENIOR", "confidence_score": 0.90}
        github.parse_adr_fe_comment.return_value = {
            "description": "Full auth module",
            "target_module": "conta",
            "affected_files": [],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "# Full blueprint context"
        blueprint.hash = "ghi789"
        MockBlueprint.return_value = blueprint

        code_with_aria = (
            "export const LoginButton = () => (\n"
            "  <button aria-label=\"Login\">Login</button>\n"
            ");\n"
        )
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code(
            file_path="presentation/components/LoginButton.tsx",
            code=code_with_aria,
            model="claude-opus-4.6",
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "completed" in result.output.lower()
        github.post_comment.assert_called()

    @patch(f"{_SR_MOD}.ProviderFactory")
    @patch(f"{_SR_MOD}.BlueprintReader")
    @patch(f"{_SR_MOD}.GitHubClient")
    def test_lgpd_detected_escalates(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """LGPD scope detected, no gate approval → posts escalation and exits."""
        from deep_ion.dom_04_frontend.skill_dev_fe_senior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="SENIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment(description="Handle CPF masking in user profile")
            if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "SENIOR", "confidence_score": 0.9}
        github.parse_adr_fe_comment.return_value = {
            "description": "Handle CPF masking in user profile",
            "target_module": "conta",
            "affected_files": [],
        }
        # No lgpd/gate-approved label.
        github.get_issue.return_value = {
            "title": "CPF Masking",
            "number": 42,
            "labels": [],
        }

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "lgpd" in result.output.lower()
        # Escalation record posted.
        github.post_comment.assert_called()

    @patch(f"{_SR_MOD}.ProviderFactory")
    @patch(f"{_SR_MOD}.BlueprintReader")
    @patch(f"{_SR_MOD}.GitHubClient")
    def test_lgpd_with_gate_approved_proceeds(
        self, MockGitHub: MagicMock, MockBlueprint: MagicMock, MockFactory: MagicMock
    ) -> None:
        """LGPD scope detected + lgpd/gate-approved label → proceeds with generation."""
        from deep_ion.dom_04_frontend.skill_dev_fe_senior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.side_effect = lambda _issue, prefix: (
            _fe_tier_comment(tier="SENIOR") if prefix == "## FE-TIER-"
            else _adr_fe_comment(description="Handle CPF masking")
            if prefix == "## ADR-FE-"
            else None
        )
        github.parse_fe_tier_comment.return_value = {"tier": "SENIOR", "confidence_score": 0.9}
        github.parse_adr_fe_comment.return_value = {
            "description": "Handle CPF masking",
            "target_module": "conta",
            "affected_files": [],
        }
        # lgpd/gate-approved label IS present.
        github.get_issue.return_value = {
            "title": "CPF Masking",
            "number": 42,
            "labels": [{"name": "lgpd/gate-approved"}],
        }

        blueprint = MagicMock()
        blueprint.build_context_for_tier.return_value = "# Full context"
        blueprint.hash = "hash123"
        MockBlueprint.return_value = blueprint

        code_with_aria = (
            "export const CpfField = () => (\n"
            "  <input aria-label=\"CPF\" type=\"text\" />\n"
            ");\n"
        )
        mock_provider = MagicMock()
        mock_provider.call.return_value = _llm_response_with_code(
            file_path="presentation/components/CpfField.tsx",
            code=code_with_aria,
            model="claude-opus-4.6",
        )
        MockFactory.create.return_value = mock_provider

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 0
        assert "completed" in result.output.lower()

    @patch(f"{_SR_MOD}.GitHubClient")
    def test_missing_adr_comment_blocks(self, MockGitHub: MagicMock) -> None:
        """No ADR-FE comment → blocks."""
        from deep_ion.dom_04_frontend.skill_dev_fe_senior import app

        github = _mock_github_client()
        MockGitHub.return_value = github
        github.find_comment_by_prefix.return_value = None

        result = runner.invoke(app, ["--issue", "42"])

        assert result.exit_code == 1
