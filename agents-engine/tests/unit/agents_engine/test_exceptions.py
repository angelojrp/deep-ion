import pytest

from deep_ion.agents_engine.exceptions import AgentsEngineError, ConfidenceError, GitHubAPIError, LLMProviderError


@pytest.mark.unit
class TestExceptions:
	def test_hierarchy(self) -> None:
		assert issubclass(LLMProviderError, AgentsEngineError)
		assert issubclass(GitHubAPIError, AgentsEngineError)
		assert issubclass(ConfidenceError, AgentsEngineError)

	def test_github_api_error_status_code(self) -> None:
		error = GitHubAPIError("boom", status_code=503)
		assert error.status_code == 503
		assert "boom" in str(error)