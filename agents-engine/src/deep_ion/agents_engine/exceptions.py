class AgentsEngineError(Exception):
	pass


class LLMProviderError(AgentsEngineError):
	pass


class GitHubAPIError(AgentsEngineError):
	def __init__(self, message: str, status_code: int) -> None:
		super().__init__(message)
		self.status_code = status_code


class ConfidenceError(AgentsEngineError):
	pass


__all__ = [
	"AgentsEngineError",
	"LLMProviderError",
	"GitHubAPIError",
	"ConfidenceError",
]