"""Unit tests for BudgetAwareProvider — decorator enforcing budget on LLM calls."""

from __future__ import annotations

from dataclasses import dataclass
from unittest.mock import MagicMock

import pytest

from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import ModelBudgetViolation
from deep_ion.dom_04_frontend.providers.budget_aware_provider import BudgetAwareProvider
from deep_ion.dom_04_frontend.providers.llm_provider import LLMResponse


# ── Fixtures ─────────────────────────────────────────────────────────────────


def _mock_provider(*, name: str = "mock") -> MagicMock:
    """Create a mock LLMProvider that returns a canned LLMResponse."""
    provider = MagicMock()
    provider.provider_name = name
    provider.call.return_value = LLMResponse(
        content="```tsx\nconst X = () => <div />;\n```",
        model="gpt-4o",
        output_tokens=50,
        input_tokens=100,
        finish_reason="stop",
    )
    return provider


# ── Constructor & Properties ─────────────────────────────────────────────────


class TestConstruction:
    """Test BudgetAwareProvider initialization."""

    def test_provider_name_delegated(self) -> None:
        mock = _mock_provider(name="copilot")
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)
        assert bap.provider_name == "copilot"

    def test_tier_accessible(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.PLENO)
        assert bap.tier == FrontendTier.PLENO


# ── call: budget enforcement ─────────────────────────────────────────────────


class TestCallBudgetEnforcement:
    """Test that call() validates model budget before forwarding."""

    def test_allowed_model_forwarded(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        result = bap.call(
            system_prompt="sys",
            user_prompt="user",
            model="gpt-4o",
        )

        mock.call.assert_called_once()
        assert result.content is not None

    def test_rejected_model_raises_violation(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        with pytest.raises(ModelBudgetViolation) as exc_info:
            bap.call(
                system_prompt="sys",
                user_prompt="user",
                model="claude-opus-4.6",
            )

        assert exc_info.value.tier == FrontendTier.JUNIOR
        mock.call.assert_not_called()

    def test_none_model_uses_tier_default(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        bap.call(system_prompt="sys", user_prompt="user", model=None)

        # Default for Junior is gpt-4o
        mock.call.assert_called_once()
        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["model"] == "gpt-4o"

    def test_pleno_allows_gpt_5_1_codex(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.PLENO)

        bap.call(
            system_prompt="sys",
            user_prompt="user",
            model="gpt-5.1-codex",
        )

        mock.call.assert_called_once()

    def test_pleno_blocks_claude(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.PLENO)

        with pytest.raises(ModelBudgetViolation):
            bap.call(
                system_prompt="sys",
                user_prompt="user",
                model="claude-opus-4.6",
            )

        mock.call.assert_not_called()

    def test_senior_allows_any_model(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.SENIOR)

        bap.call(
            system_prompt="sys",
            user_prompt="user",
            model="claude-opus-4.6",
        )

        mock.call.assert_called_once()

    def test_temperature_forwarded(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        bap.call(
            system_prompt="sys",
            user_prompt="user",
            model="gpt-4o",
            temperature=0.7,
        )

        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["temperature"] == 0.7


# ── call_with_fallback: soft budget enforcement ──────────────────────────────


class TestCallWithFallback:
    """Test that call_with_fallback falls back instead of raising."""

    def test_allowed_model_passes_through(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        bap.call_with_fallback(
            system_prompt="sys",
            user_prompt="user",
            model="gpt-4o",
        )

        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["model"] == "gpt-4o"

    def test_rejected_model_falls_back_to_default(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        # claude is rejected for Junior; should fall back to gpt-4o
        bap.call_with_fallback(
            system_prompt="sys",
            user_prompt="user",
            model="claude-opus-4.6",
        )

        mock.call.assert_called_once()
        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["model"] == "gpt-4o"

    def test_pleno_claude_falls_back_to_codex(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.PLENO)

        bap.call_with_fallback(
            system_prompt="sys",
            user_prompt="user",
            model="claude-opus-4.6",
        )

        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["model"] == "gpt-5.1-codex"

    def test_none_model_uses_default(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.PLENO)

        bap.call_with_fallback(
            system_prompt="sys",
            user_prompt="user",
            model=None,
        )

        call_kwargs = mock.call.call_args
        # Default for Pleno is gpt-5.1-codex
        assert call_kwargs.kwargs["model"] == "gpt-5.1-codex"

    def test_senior_no_fallback_needed(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.SENIOR)

        bap.call_with_fallback(
            system_prompt="sys",
            user_prompt="user",
            model="anything-goes",
        )

        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["model"] == "anything-goes"


# ── Provider delegation ──────────────────────────────────────────────────────


class TestProviderDelegation:
    """Verify that prompts and parameters are correctly delegated."""

    def test_system_prompt_forwarded(self) -> None:
        mock = _mock_provider()
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        bap.call(
            system_prompt="Be brief.",
            user_prompt="Generate code.",
            model="gpt-4o",
        )

        call_kwargs = mock.call.call_args
        assert call_kwargs.kwargs["system_prompt"] == "Be brief."
        assert call_kwargs.kwargs["user_prompt"] == "Generate code."

    def test_response_returned_unchanged(self) -> None:
        expected = LLMResponse(
            content="code here",
            model="gpt-4o",
            output_tokens=10,
            input_tokens=20,
        )
        mock = _mock_provider()
        mock.call.return_value = expected
        bap = BudgetAwareProvider(provider=mock, tier=FrontendTier.JUNIOR)

        result = bap.call(
            system_prompt="sys",
            user_prompt="user",
            model="gpt-4o",
        )

        assert result is expected
