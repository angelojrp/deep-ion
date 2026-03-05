import httpx
import pytest
import respx

from deep_ion.agents_engine.exceptions import GitHubAPIError
from deep_ion.agents_engine.infrastructure.github_client import GitHubClient
from deep_ion.agents_engine.settings import Settings


def _settings() -> Settings:
	return Settings(
		github_token="fake-token",
		github_repo="org/repo",
		ai_provider="deterministic",
	)


@pytest.mark.integration
class TestGitHubClient:
	@respx.mock
	def test_get_issue_success(self, monkeypatch: pytest.MonkeyPatch) -> None:
		monkeypatch.setattr("tenacity.nap.sleep", lambda _: None)
		respx.get("https://api.github.com/repos/org/repo/issues/1").mock(
			return_value=httpx.Response(
				200,
				json={
					"number": 1,
					"title": "x",
					"body": "y",
					"state": "open",
					"user": {"login": "alice"},
					"labels": [{"name": "gate/1-aguardando"}],
				},
			),
		)

		with GitHubClient(_settings()) as client:
			issue = client.get_issue(1)

		assert issue.number == 1
		assert issue.author == "alice"
		assert issue.labels == ("gate/1-aguardando",)

	@respx.mock
	def test_retry_on_429_then_success(self, monkeypatch: pytest.MonkeyPatch) -> None:
		monkeypatch.setattr("tenacity.nap.sleep", lambda _: None)
		route = respx.get("https://api.github.com/repos/org/repo/issues/2").mock(
			side_effect=[
				httpx.Response(429, text="rate limited"),
				httpx.Response(
					200,
					json={
						"number": 2,
						"title": "ok",
						"body": "ok",
						"state": "open",
						"user": {"login": "bob"},
						"labels": [],
					},
				),
			],
		)

		with GitHubClient(_settings()) as client:
			issue = client.get_issue(2)

		assert issue.number == 2
		assert route.call_count == 2

	@respx.mock
	def test_raises_after_retries_exhausted(self, monkeypatch: pytest.MonkeyPatch) -> None:
		monkeypatch.setattr("tenacity.nap.sleep", lambda _: None)
		route = respx.get("https://api.github.com/repos/org/repo/issues/3").mock(
			return_value=httpx.Response(500, text="server error"),
		)

		with GitHubClient(_settings()) as client:
			with pytest.raises(GitHubAPIError) as exc_info:
				client.get_issue(3)

		assert exc_info.value.status_code == 500
		assert route.call_count == 4