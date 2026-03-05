from importlib import import_module

from deep_ion.agents_engine.exceptions import LLMProviderError
from deep_ion.agents_engine.providers._retry import with_provider_retry
from deep_ion.agents_engine.settings import Settings


class OpenAIProvider:
	def __init__(self, settings: Settings) -> None:
		self._api_key = settings.ai_provider_api_key.get_secret_value()

	@with_provider_retry("openai.complete")
	def complete(self, prompt: str, model: str) -> str:
		try:
			openai_module = import_module("openai")
		except ModuleNotFoundError as exc:
			raise LLMProviderError("OpenAI SDK is not installed. Install optional dependency: openai") from exc

		client_cls = getattr(openai_module, "OpenAI", None)
		if not callable(client_cls):
			raise LLMProviderError("OpenAI SDK does not expose OpenAI client")

		client = client_cls(api_key=self._api_key)
		responses_api = getattr(client, "responses", None)
		create_call = getattr(responses_api, "create", None)
		if not callable(create_call):
			raise LLMProviderError("OpenAI SDK does not expose responses.create")

		response = create_call(model=model, input=prompt)
		output_text = getattr(response, "output_text", None)
		if isinstance(output_text, str) and output_text:
			return output_text

		return str(response)


__all__ = ["OpenAIProvider"]