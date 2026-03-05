from __future__ import annotations

from typing import TYPE_CHECKING, Protocol, runtime_checkable

from deep_ion.agents_engine.domain.models import IssueData

if TYPE_CHECKING:
	from deep_ion.agents_engine.audit.decision_record import DecisionRecord


@runtime_checkable
class GitHubPort(Protocol):
	def get_issue(self, issue_number: int) -> IssueData:
		...

	def post_comment(self, issue_number: int, body: str) -> None:
		...

	def add_label(self, issue_number: int, label: str) -> None:
		...

	def remove_label(self, issue_number: int, label: str) -> None:
		...

	def find_comment_by_prefix(self, issue_number: int, prefix: str) -> str | None:
		...


@runtime_checkable
class AuditPort(Protocol):
	def emit(self, record: DecisionRecord) -> None:
		...


__all__ = ["GitHubPort", "AuditPort"]