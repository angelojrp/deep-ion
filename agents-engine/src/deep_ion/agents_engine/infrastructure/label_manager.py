from urllib.parse import quote

import structlog

from deep_ion.agents_engine.infrastructure.github_client import GitHubClient


class LabelManager:
	def __init__(self, client: GitHubClient, repo: str) -> None:
		self._client = client
		self._repo = repo
		self._logger = structlog.get_logger(__name__)

	def add(self, issue_number: int, label: str) -> None:
		self._logger.info("label_add", issue_number=issue_number, label=label)
		path = f"/repos/{self._repo}/issues/{issue_number}/labels"
		self._client.post(path, {"labels": [label]})

	def remove(self, issue_number: int, label: str) -> None:
		self._logger.info("label_remove", issue_number=issue_number, label=label)
		encoded_label = quote(label, safe="")
		path = f"/repos/{self._repo}/issues/{issue_number}/labels/{encoded_label}"
		self._client.delete(path)


__all__ = ["LabelManager"]