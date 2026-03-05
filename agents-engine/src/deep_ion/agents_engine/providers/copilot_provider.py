from importlib import import_module

from deep_ion.agents_engine.exceptions import LLMProviderError
from deep_ion.agents_engine.providers._retry import with_provider_retry
from deep_ion.agents_engine.settings import Settings


class CopilotProvider:
	def __init__(self, settings: Settings) -> None:
		self._api_key = settings.ai_provider_api_key.get_secret_value()

	@with_provider_retry("copilot.complete")
	def complete(self, prompt: str, model: str) -> str:
		try:
			inference_module = import_module("azure.ai.inference")
			credentials_module = import_module("azure.core.credentials")
		except ModuleNotFoundError as exc:
			raise LLMProviderError(
				"Copilot SDK is not installed. Install optional dependency: azure-ai-inference"
			) from exc

		client_cls = getattr(inference_module, "ChatCompletionsClient", None)
		credential_cls = getattr(credentials_module, "AzureKeyCredential", None)
		if not callable(client_cls) or not callable(credential_cls):
			raise LLMProviderError("Azure inference SDK classes are unavailable")

		client = client_cls(
			endpoint="https://models.inference.ai.azure.com",
			credential=credential_cls(self._api_key),
		)
		complete_call = getattr(client, "complete", None)
		if not callable(complete_call):
			raise LLMProviderError("Azure inference SDK does not expose complete")

		response = complete_call(
			messages=[{"role": "user", "content": prompt}],
			model=model,
		)

		choices = getattr(response, "choices", None)
		if isinstance(choices, list) and choices:
			message = getattr(choices[0], "message", None)
			content = getattr(message, "content", None)
			if isinstance(content, str) and content:
				return content

		return str(response)


__all__ = ["CopilotProvider"]