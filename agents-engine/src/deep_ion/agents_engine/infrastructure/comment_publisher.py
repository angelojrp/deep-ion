from __future__ import annotations

from typing import TYPE_CHECKING

import structlog

from deep_ion.agents_engine.infrastructure.github_client import GitHubClient

if TYPE_CHECKING:
	from deep_ion.agents_engine.audit.decision_record import DecisionRecord


AUDIT_COMMENT_PREFIX = "## AUDIT-LEDGER\n"


class CommentPublisher:
	def __init__(self, client: GitHubClient, repo: str) -> None:
		self._client = client
		self._repo = repo
		self._logger = structlog.get_logger(__name__)

	def publish(self, issue_number: int, body: str) -> None:
		self._logger.info("comment_publish", issue_number=issue_number)
		path = f"/repos/{self._repo}/issues/{issue_number}/comments"
		self._client.post(path, {"body": body})

	def emit(self, record: DecisionRecord) -> None:
		if record.issue_number is None:
			raise ValueError("DecisionRecord must provide issue_number to publish audit comment")

		body = (
			f"{AUDIT_COMMENT_PREFIX}"
			f"```json\n{record.model_dump_json(indent=2)}\n```"
		)
		self.publish(record.issue_number, body)

	def find_comment_by_prefix(self, issue_number: int, prefix: str) -> str | None:
		self._logger.info("comment_find_by_prefix", issue_number=issue_number, prefix=prefix)
		path = f"/repos/{self._repo}/issues/{issue_number}/comments"
		payload = self._client.get(path)
		items_raw = payload.get("items")
		if not isinstance(items_raw, list):
			return None

		for item in items_raw:
			if not isinstance(item, dict):
				continue
			body = item.get("body")
			if isinstance(body, str) and body.startswith(prefix):
				return body

		return None


__all__ = ["CommentPublisher"]