from importlib import import_module
from importlib.util import find_spec

import structlog

from deep_ion.agents_engine.exceptions import LLMProviderError
from deep_ion.agents_engine.providers.protocol import LLMProvider
from deep_ion.agents_engine.settings import Settings

_ORDER = ("copilot", "openai", "anthropic", "deterministic")
_PROVIDER_SPECS: dict[str, tuple[str, str, str]] = {
	"copilot": ("deep_ion.agents_engine.providers.copilot_provider", "CopilotProvider", "azure.ai.inference"),
	"openai": ("deep_ion.agents_engine.providers.openai_provider", "OpenAIProvider", "openai"),
	"anthropic": ("deep_ion.agents_engine.providers.anthropic_provider", "AnthropicProvider", "anthropic"),
}


class _DeterministicProvider:
	def complete(self, prompt: str, model: str) -> str:
		return f"[deterministic:{model}] {prompt.strip()}"


class ProviderFactory:
	@staticmethod
	def create(settings: Settings) -> LLMProvider:
		logger = structlog.get_logger(__name__)
		provider_name = settings.ai_provider.strip().lower()
		if provider_name not in _ORDER:
			raise LLMProviderError(f"Unknown provider: {settings.ai_provider}")

		if provider_name == "deterministic":
			return _DeterministicProvider()

		fallback_chain = ["copilot", "openai", "anthropic", "deterministic"]
		candidates = [provider_name]
		candidates.extend(name for name in fallback_chain if name not in (provider_name, "deterministic"))

		for candidate in candidates:
			if candidate == "deterministic":
				return _DeterministicProvider()

			module_name, class_name, sdk_module = _PROVIDER_SPECS[candidate]
			if find_spec(sdk_module) is None:
				logger.warning("provider_sdk_unavailable", provider=candidate, sdk=sdk_module)
				continue

			module = import_module(module_name)
			provider_cls = getattr(module, class_name, None)
			if not callable(provider_cls):
				logger.warning("provider_class_unavailable", provider=candidate, class_name=class_name)
				continue

			provider_obj = provider_cls(settings)
			if isinstance(provider_obj, LLMProvider):
				return provider_obj

			logger.warning("provider_protocol_mismatch", provider=candidate)

		logger.warning("provider_fallback_deterministic", requested=provider_name)
		return _DeterministicProvider()


__all__ = ["ProviderFactory"]