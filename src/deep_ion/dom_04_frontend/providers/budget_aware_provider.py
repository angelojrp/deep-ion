"""BudgetAwareProvider — Decorator that enforces ModelBudgetPolicy on LLM calls."""

from __future__ import annotations

from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import (
    ModelBudgetPolicy,
    ModelBudgetViolation,
)
from deep_ion.dom_04_frontend.providers.llm_provider import LLMProvider, LLMResponse


class BudgetAwareProvider:
    """Wraps an ``LLMProvider`` and enforces ``ModelBudgetPolicy`` per tier.

    Before forwarding any call to the underlying provider, validates the
    requested model against the tier's policy. Rejects the call if the
    model is not allowed (raises ``ModelBudgetViolation``).
    """

    def __init__(self, provider: LLMProvider, tier: FrontendTier) -> None:
        self._provider = provider
        self._tier = tier

    @property
    def provider_name(self) -> str:
        """Return the underlying provider name."""
        return self._provider.provider_name

    @property
    def tier(self) -> FrontendTier:
        """Return the tier this provider is bound to."""
        return self._tier

    def call(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Validate model budget, then forward to underlying provider.

        If *model* is ``None``, uses the tier's default model.
        Raises ``ModelBudgetViolation`` if the model is not permitted.
        """
        resolved_model = model or ModelBudgetPolicy.default_model(self._tier)

        # Enforce budget policy — raises on violation.
        result = ModelBudgetPolicy.validate(resolved_model, self._tier)
        if not result.allowed:
            raise ModelBudgetViolation(
                model=resolved_model,
                tier=self._tier,
                reason=result.reason,
            )

        return self._provider.call(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=resolved_model,
            temperature=temperature,
        )

    def call_with_fallback(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Try the requested model; on budget violation, fall back to tier default.

        This is a softer alternative to ``call`` — logs a warning instead of
        raising when the primary model is vetoed, and retries with the default.
        """
        resolved_model = model or ModelBudgetPolicy.default_model(self._tier)

        validation = ModelBudgetPolicy.validate(resolved_model, self._tier)
        if not validation.allowed and validation.fallback_model:
            resolved_model = validation.fallback_model

        return self._provider.call(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=resolved_model,
            temperature=temperature,
        )
