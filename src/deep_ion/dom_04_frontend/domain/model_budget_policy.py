"""ModelBudgetPolicy — hard-coded LLM model restrictions per tier."""

from __future__ import annotations

from dataclasses import dataclass

from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier

# ── Hard-coded allowlists and blocklists per tier ────────────────────────────

_JUNIOR_ALLOWED_MODELS: frozenset[str] = frozenset({"gpt-4o"})

_PLENO_ALLOWED_MODELS: frozenset[str] = frozenset({
    "gpt-4o",
    "gpt-4.1",
    "gpt-5.1-codex",
})

_PLENO_BLOCKED_MODELS: frozenset[str] = frozenset({
    "claude-opus-4-6",
    "claude-opus-4.6",
    "anthropic/claude-opus-4.6",
})

# Senior has no model restrictions.

_TIER_DEFAULTS: dict[FrontendTier, str] = {
    FrontendTier.JUNIOR: "gpt-4o",
    FrontendTier.PLENO: "gpt-5.1-codex",
    FrontendTier.SENIOR: "claude-opus-4.6",
}


class ModelBudgetViolation(Exception):
    """Raised when a model is not allowed for the given tier."""

    def __init__(self, model: str, tier: FrontendTier, reason: str) -> None:
        self.model = model
        self.tier = tier
        self.reason = reason
        super().__init__(f"Model '{model}' rejected for tier {tier.value}: {reason}")


@dataclass(frozen=True)
class ValidationResult:
    """Result of a model budget validation."""

    allowed: bool
    model: str
    tier: FrontendTier
    reason: str
    fallback_model: str | None = None


class ModelBudgetPolicy:
    """Deterministic, immutable model budget enforcement per tier.

    The allowlists are hard-coded and cannot be overridden at runtime.
    A change requires code modification + T2 review.
    """

    @staticmethod
    def validate(model: str, tier: FrontendTier) -> ValidationResult:
        """Validate whether *model* is permitted for *tier*.

        Returns a ``ValidationResult`` with ``allowed=True`` if the model passes,
        or ``allowed=False`` with a ``fallback_model`` suggestion otherwise.
        """
        normalized = model.strip().lower()

        if tier == FrontendTier.JUNIOR:
            if normalized not in _JUNIOR_ALLOWED_MODELS:
                return ValidationResult(
                    allowed=False,
                    model=model,
                    tier=tier,
                    reason=(
                        f"Junior tier allows only {sorted(_JUNIOR_ALLOWED_MODELS)}; "
                        f"got '{model}'."
                    ),
                    fallback_model=_TIER_DEFAULTS[FrontendTier.JUNIOR],
                )

        elif tier == FrontendTier.PLENO:
            if normalized in _PLENO_BLOCKED_MODELS:
                return ValidationResult(
                    allowed=False,
                    model=model,
                    tier=tier,
                    reason=(
                        f"Pleno tier blocks high-cost models "
                        f"{sorted(_PLENO_BLOCKED_MODELS)}; got '{model}'."
                    ),
                    fallback_model=_TIER_DEFAULTS[FrontendTier.PLENO],
                )
            if normalized not in _PLENO_ALLOWED_MODELS:
                return ValidationResult(
                    allowed=False,
                    model=model,
                    tier=tier,
                    reason=(
                        f"Pleno tier allows only {sorted(_PLENO_ALLOWED_MODELS)}; "
                        f"got '{model}'. Model not in allowlist."
                    ),
                    fallback_model=_TIER_DEFAULTS[FrontendTier.PLENO],
                )

        # Senior: no restrictions — all models allowed.

        return ValidationResult(allowed=True, model=model, tier=tier, reason="ok")

    @staticmethod
    def validate_or_raise(model: str, tier: FrontendTier) -> None:
        """Validate and raise ``ModelBudgetViolation`` if model is not allowed."""
        result = ModelBudgetPolicy.validate(model, tier)
        if not result.allowed:
            raise ModelBudgetViolation(model=model, tier=tier, reason=result.reason)

    @staticmethod
    def default_model(tier: FrontendTier) -> str:
        """Return the default model for the given tier."""
        return _TIER_DEFAULTS[tier]

    @staticmethod
    def allowed_models(tier: FrontendTier) -> frozenset[str] | None:
        """Return the allowlist for a tier, or ``None`` if unrestricted (Senior)."""
        if tier == FrontendTier.JUNIOR:
            return _JUNIOR_ALLOWED_MODELS
        if tier == FrontendTier.PLENO:
            return _PLENO_ALLOWED_MODELS
        return None
