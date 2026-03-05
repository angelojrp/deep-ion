import pytest

from deep_ion.agents_engine.exceptions import LLMProviderError
from deep_ion.agents_engine.providers.factory import ProviderFactory
from deep_ion.agents_engine.settings import Settings


def _settings(provider: str) -> Settings:
	return Settings(
		github_token="fake-token",
		github_repo="org/repo",
		ai_provider=provider,
	)


@pytest.mark.unit
class TestProviderFactory:
	def test_create_deterministic(self) -> None:
		provider = ProviderFactory.create(_settings("deterministic"))
		result = provider.complete("hello", "x")
		assert "[deterministic:x]" in result

	def test_unknown_provider_raises(self) -> None:
		with pytest.raises(LLMProviderError):
			ProviderFactory.create(_settings("unknown"))

	def test_fallback_to_deterministic_when_sdks_unavailable(self, monkeypatch: pytest.MonkeyPatch) -> None:
		monkeypatch.setattr("deep_ion.agents_engine.providers.factory.find_spec", lambda _: None)
		provider = ProviderFactory.create(_settings("copilot"))
		assert provider.complete("prompt", "m").startswith("[deterministic:m]")

	def test_candidate_order_starts_with_requested_provider(self, monkeypatch: pytest.MonkeyPatch) -> None:
		calls: list[str] = []

		def fake_find_spec(sdk_module: str) -> None:
			calls.append(sdk_module)
			return None

		monkeypatch.setattr("deep_ion.agents_engine.providers.factory.find_spec", fake_find_spec)
		ProviderFactory.create(_settings("openai"))

		assert calls == ["openai", "azure.ai.inference", "anthropic"]