import structlog

from deep_ion.agents_engine.domain.models import IssueData
from deep_ion.agents_engine.infrastructure.github_client import GitHubClient


class IssueReader:
	def __init__(self, client: GitHubClient) -> None:
		self._client = client
		self._logger = structlog.get_logger(__name__)

	def read(self, issue_number: int) -> IssueData:
		self._logger.info("issue_read", issue_number=issue_number)
		path = f"/repos/{self._client.repo}/issues/{issue_number}"
		payload = self._client.get(path)

		number_raw = payload.get("number")
		title_raw = payload.get("title")
		body_raw = payload.get("body")
		state_raw = payload.get("state")
		user_raw = payload.get("user")
		labels_raw = payload.get("labels")

		author = ""
		if isinstance(user_raw, dict):
			login_raw = user_raw.get("login")
			if isinstance(login_raw, str):
				author = login_raw

		labels: list[str] = []
		if isinstance(labels_raw, list):
			for label in labels_raw:
				if isinstance(label, dict):
					name = label.get("name")
					if isinstance(name, str):
						labels.append(name)

		return IssueData(
			number=int(number_raw) if isinstance(number_raw, int) else issue_number,
			title=title_raw if isinstance(title_raw, str) else "",
			body=body_raw if isinstance(body_raw, str) else "",
			labels=tuple(labels),
			author=author,
			state=state_raw if isinstance(state_raw, str) else "",
		)


__all__ = ["IssueReader"]