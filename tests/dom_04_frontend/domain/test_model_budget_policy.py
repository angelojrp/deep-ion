"""Unit tests for ModelBudgetPolicy — hard-coded model restrictions per tier."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import (
    ModelBudgetPolicy,
    ModelBudgetViolation,
    ValidationResult,
)


# ── Junior Tier ──────────────────────────────────────────────────────────────


class TestJuniorTier:
    """Junior tier allows only gpt-4o."""

    def test_gpt_4o_allowed(self) -> None:
        result = ModelBudgetPolicy.validate("gpt-4o", FrontendTier.JUNIOR)
        assert result.allowed
        assert result.reason == "ok"

    def test_gpt_4o_case_insensitive(self) -> None:
        """Validation normalizes to lowercase."""
        result = ModelBudgetPolicy.validate("GPT-4o", FrontendTier.JUNIOR)
        # Uppercase input — validate normalizes to lowercase for comparison
        assert result.allowed

    @pytest.mark.parametrize(
        "model",
        ["gpt-5.1-codex", "claude-opus-4.6", "gpt-4.1", "random-model"],
    )
    def test_non_gpt4o_rejected(self, model: str) -> None:
        result = ModelBudgetPolicy.validate(model, FrontendTier.JUNIOR)
        assert not result.allowed
        assert result.fallback_model == "gpt-4o"

    def test_default_model(self) -> None:
        assert ModelBudgetPolicy.default_model(FrontendTier.JUNIOR) == "gpt-4o"

    def test_allowed_models(self) -> None:
        models = ModelBudgetPolicy.allowed_models(FrontendTier.JUNIOR)
        assert models is not None
        assert models == frozenset({"gpt-4o"})


# ── Pleno Tier ───────────────────────────────────────────────────────────────


class TestPlenoTier:
    """Pleno tier allows gpt-4o, gpt-4.1, gpt-5.1-codex; blocks Claude variants."""

    @pytest.mark.parametrize(
        "model",
        ["gpt-4o", "gpt-4.1", "gpt-5.1-codex"],
    )
    def test_allowed_models(self, model: str) -> None:
        result = ModelBudgetPolicy.validate(model, FrontendTier.PLENO)
        assert result.allowed

    @pytest.mark.parametrize(
        "model",
        ["claude-opus-4-6", "claude-opus-4.6", "anthropic/claude-opus-4.6"],
    )
    def test_claude_blocked(self, model: str) -> None:
        result = ModelBudgetPolicy.validate(model, FrontendTier.PLENO)
        assert not result.allowed
        assert result.fallback_model == "gpt-5.1-codex"
        assert "blocks high-cost" in result.reason.lower() or "block" in result.reason.lower()

    def test_unknown_model_rejected(self) -> None:
        result = ModelBudgetPolicy.validate("random-model-v99", FrontendTier.PLENO)
        assert not result.allowed
        assert "allowlist" in result.reason.lower() or "allows only" in result.reason.lower()

    def test_default_model(self) -> None:
        assert ModelBudgetPolicy.default_model(FrontendTier.PLENO) == "gpt-5.1-codex"

    def test_allowed_models_frozenset(self) -> None:
        models = ModelBudgetPolicy.allowed_models(FrontendTier.PLENO)
        assert models is not None
        assert "gpt-4o" in models
        assert "gpt-4.1" in models
        assert "gpt-5.1-codex" in models
        assert len(models) == 3


# ── Senior Tier ──────────────────────────────────────────────────────────────


class TestSeniorTier:
    """Senior tier has no model restrictions."""

    @pytest.mark.parametrize(
        "model",
        ["gpt-4o", "claude-opus-4.6", "gpt-5.1-codex", "unknown-model", "whatever"],
    )
    def test_any_model_allowed(self, model: str) -> None:
        result = ModelBudgetPolicy.validate(model, FrontendTier.SENIOR)
        assert result.allowed
        assert result.reason == "ok"

    def test_default_model(self) -> None:
        assert ModelBudgetPolicy.default_model(FrontendTier.SENIOR) == "claude-opus-4.6"

    def test_allowed_models_none(self) -> None:
        """Senior returns None — unrestricted."""
        assert ModelBudgetPolicy.allowed_models(FrontendTier.SENIOR) is None


# ── validate_or_raise ────────────────────────────────────────────────────────


class TestValidateOrRaise:
    """Test validate_or_raise raises ModelBudgetViolation on rejection."""

    def test_allowed_does_not_raise(self) -> None:
        # Should not raise
        ModelBudgetPolicy.validate_or_raise("gpt-4o", FrontendTier.JUNIOR)

    def test_rejected_raises_violation(self) -> None:
        with pytest.raises(ModelBudgetViolation) as exc_info:
            ModelBudgetPolicy.validate_or_raise("claude-opus-4.6", FrontendTier.JUNIOR)
        assert exc_info.value.model == "claude-opus-4.6"
        assert exc_info.value.tier == FrontendTier.JUNIOR

    def test_violation_exception_attributes(self) -> None:
        with pytest.raises(ModelBudgetViolation) as exc_info:
            ModelBudgetPolicy.validate_or_raise("gpt-5.1-codex", FrontendTier.JUNIOR)
        err = exc_info.value
        assert err.model == "gpt-5.1-codex"
        assert err.tier == FrontendTier.JUNIOR
        assert "reason" in dir(err)
        assert len(err.reason) > 0

    def test_violation_str_representation(self) -> None:
        with pytest.raises(ModelBudgetViolation, match=r"rejected"):
            ModelBudgetPolicy.validate_or_raise("random", FrontendTier.JUNIOR)

    def test_senior_never_raises(self) -> None:
        # Senior should accept any model without raising
        ModelBudgetPolicy.validate_or_raise("literally-anything", FrontendTier.SENIOR)


# ── ValidationResult frozen ──────────────────────────────────────────────────


class TestValidationResult:
    """Ensure ValidationResult is immutable."""

    def test_frozen_dataclass(self) -> None:
        result = ValidationResult(
            allowed=True,
            model="gpt-4o",
            tier=FrontendTier.JUNIOR,
            reason="ok",
        )
        with pytest.raises(AttributeError):
            result.allowed = False  # type: ignore[misc]

    def test_fallback_model_default_none(self) -> None:
        result = ValidationResult(
            allowed=True,
            model="gpt-4o",
            tier=FrontendTier.JUNIOR,
            reason="ok",
        )
        assert result.fallback_model is None


# ── Edge Cases ───────────────────────────────────────────────────────────────


class TestEdgeCases:
    """Whitespace, empty strings, and boundary conditions."""

    def test_whitespace_stripped(self) -> None:
        result = ModelBudgetPolicy.validate("  gpt-4o  ", FrontendTier.JUNIOR)
        assert result.allowed

    def test_empty_model_rejected_junior(self) -> None:
        result = ModelBudgetPolicy.validate("", FrontendTier.JUNIOR)
        assert not result.allowed

    def test_empty_model_allowed_senior(self) -> None:
        result = ModelBudgetPolicy.validate("", FrontendTier.SENIOR)
        assert result.allowed
