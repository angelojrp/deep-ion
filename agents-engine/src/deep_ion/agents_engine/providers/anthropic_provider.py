from importlib import import_module

from deep_ion.agents_engine.exceptions import LLMProviderError
from deep_ion.agents_engine.providers._retry import with_provider_retry
from deep_ion.agents_engine.settings import Settings


class AnthropicProvider:
	def __init__(self, settings: Settings) -> None:
		self._api_key = settings.ai_provider_api_key.get_secret_value()

	@with_provider_retry("anthropic.complete")
	def complete(self, prompt: str, model: str) -> str:
		try:
			anthropic_module = import_module("anthropic")
		except ModuleNotFoundError as exc:
			raise LLMProviderError("Anthropic SDK is not installed. Install optional dependency: anthropic") from exc

		client_cls = getattr(anthropic_module, "Anthropic", None)
		if not callable(client_cls):
			raise LLMProviderError("Anthropic SDK does not expose Anthropic client")

		client = client_cls(api_key=self._api_key)
		messages_api = getattr(client, "messages", None)
		create_call = getattr(messages_api, "create", None)
		if not callable(create_call):
			raise LLMProviderError("Anthropic SDK does not expose messages.create")

		response = create_call(
			model=model,
			max_tokens=1024,
			messages=[{"role": "user", "content": prompt}],
		)
		content = getattr(response, "content", None)
		if isinstance(content, list):
			for block in content:
				text = getattr(block, "text", None)
				if isinstance(text, str) and text:
					return text

		return str(response)


__all__ = ["AnthropicProvider"]