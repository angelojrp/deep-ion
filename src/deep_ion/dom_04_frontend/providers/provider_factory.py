"""ProviderFactory — resolves the active LLM provider with budget awareness."""

from __future__ import annotations

import json
import os
from urllib import request

from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import ModelBudgetPolicy
from deep_ion.dom_04_frontend.providers.budget_aware_provider import BudgetAwareProvider
from deep_ion.dom_04_frontend.providers.llm_provider import LLMProvider, LLMResponse

# ── Provider implementations ─────────────────────────────────────────────────

_COPILOT_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions"


class CopilotProvider:
    """GitHub Copilot LLM provider via Azure Models API."""

    def __init__(self, token: str) -> None:
        self._token = token

    @property
    def provider_name(self) -> str:
        return "copilot"

    def call(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Send prompt to Copilot Models API."""
        payload = json.dumps({
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }).encode("utf-8")

        req = request.Request(_COPILOT_ENDPOINT, method="POST", data=payload)
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {self._token}")

        with request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        choice = data["choices"][0]
        usage = data.get("usage", {})

        return LLMResponse(
            content=choice["message"]["content"],
            model=data.get("model", model),
            output_tokens=usage.get("completion_tokens", 0),
            input_tokens=usage.get("prompt_tokens", 0),
            finish_reason=choice.get("finish_reason", "stop"),
        )


class OpenAIProvider:
    """OpenAI-compatible LLM provider."""

    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1") -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")

    @property
    def provider_name(self) -> str:
        return "openai"

    def call(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Send prompt to OpenAI-compatible API."""
        endpoint = f"{self._base_url}/chat/completions"
        payload = json.dumps({
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }).encode("utf-8")

        req = request.Request(endpoint, method="POST", data=payload)
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {self._api_key}")

        with request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        choice = data["choices"][0]
        usage = data.get("usage", {})

        return LLMResponse(
            content=choice["message"]["content"],
            model=data.get("model", model),
            output_tokens=usage.get("completion_tokens", 0),
            input_tokens=usage.get("prompt_tokens", 0),
            finish_reason=choice.get("finish_reason", "stop"),
        )


class DeterministicFallbackProvider:
    """No-op fallback that returns an empty response when no LLM is available."""

    @property
    def provider_name(self) -> str:
        return "none"

    def call(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Return empty response — deterministic fallback."""
        return LLMResponse(
            content="",
            model="none",
            output_tokens=0,
            input_tokens=0,
            finish_reason="fallback",
        )


class ProviderFactory:
    """Resolve the active LLM provider and wrap it with budget enforcement.

    Resolution order:
    1. GitHub Copilot (GITHUB_TOKEN — always available in CI)
    2. OpenAI-compatible (OPENAI_API_KEY / AI_PROVIDER_API_KEY)
    3. Deterministic local fallback (no LLM)
    """

    @staticmethod
    def create(tier: FrontendTier) -> BudgetAwareProvider:
        """Create a budget-aware provider for the given tier."""
        provider = ProviderFactory._resolve_raw_provider()
        return BudgetAwareProvider(provider=provider, tier=tier)

    @staticmethod
    def _resolve_raw_provider() -> LLMProvider:
        """Resolve the raw LLM provider from environment."""
        explicit = os.getenv("AI_PROVIDER", "").lower()

        if explicit == "copilot" or (not explicit and os.getenv("GITHUB_TOKEN")):
            token = os.getenv("GITHUB_TOKEN", "")
            if token:
                return CopilotProvider(token=token)

        if explicit == "openai" or (
            not explicit and (os.getenv("OPENAI_API_KEY") or os.getenv("AI_PROVIDER_API_KEY"))
        ):
            api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_PROVIDER_API_KEY", "")
            if api_key:
                return OpenAIProvider(api_key=api_key)

        return DeterministicFallbackProvider()

    @staticmethod
    def resolve_model(tier: FrontendTier) -> str:
        """Return the default model for the given tier."""
        return ModelBudgetPolicy.default_model(tier)
