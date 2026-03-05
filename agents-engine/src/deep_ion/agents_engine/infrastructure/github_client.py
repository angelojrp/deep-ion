from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import quote

import httpx
import structlog
from tenacity import RetryCallState, retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from deep_ion.agents_engine.domain.models import IssueData
from deep_ion.agents_engine.exceptions import GitHubAPIError
from deep_ion.agents_engine.settings import Settings


@dataclass(frozen=True)
class _RetryableGitHubError(Exception):
	message: str
	status_code: int

	def __str__(self) -> str:
		return self.message


class _RetryLogger:
	def __init__(self, operation: str) -> None:
		self._operation = operation
		self._logger = structlog.get_logger(__name__)

	def __call__(self, state: RetryCallState) -> None:
		error = state.outcome.exception() if state.outcome is not None else None
		status_code = getattr(error, "status_code", None)
		self._logger.warning(
			"github_retry",
			operation=self._operation,
			attempt=state.attempt_number,
			status_code=status_code,
			error=str(error) if error is not None else "unknown",
		)


class GitHubClient:
	def __init__(self, settings: Settings) -> None:
		token = settings.github_token.get_secret_value()
		self.repo = settings.github_repo
		self._logger = structlog.get_logger(__name__)
		self._client = httpx.Client(
			base_url="https://api.github.com",
			timeout=30.0,
			headers={
				"Authorization": f"Bearer {token}",
				"Accept": "application/vnd.github+json",
			},
		)

	def __enter__(self) -> GitHubClient:
		return self

	def __exit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
		self.close()

	def close(self) -> None:
		self._client.close()

	@retry(
		retry=retry_if_exception_type(_RetryableGitHubError),
		wait=wait_exponential(multiplier=1, min=1, max=8),
		stop=stop_after_attempt(4),
		before_sleep=_RetryLogger("github.request"),
		reraise=True,
	)
	def _request(self, method: str, path: str, body: dict[str, object] | None = None) -> dict[str, object]:
		self._logger.info("github_request", method=method, path=path)
		response = self._client.request(method=method, url=path, json=body)

		if response.status_code in (429, 500, 502, 503, 504):
			message = f"GitHub API temporary failure ({response.status_code})"
			raise _RetryableGitHubError(message=message, status_code=response.status_code)

		if response.status_code >= 400:
			raise GitHubAPIError(
				message=f"GitHub API request failed ({response.status_code}): {response.text}",
				status_code=response.status_code,
			)

		payload = response.json()
		if isinstance(payload, dict):
			return payload
		if isinstance(payload, list):
			return {"items": payload}
		return {"value": payload}

	def get(self, path: str) -> dict[str, object]:
		try:
			return self._request("GET", path)
		except _RetryableGitHubError as exc:
			raise GitHubAPIError(message=exc.message, status_code=exc.status_code) from exc

	def post(self, path: str, body: dict[str, object]) -> dict[str, object]:
		try:
			return self._request("POST", path, body)
		except _RetryableGitHubError as exc:
			raise GitHubAPIError(message=exc.message, status_code=exc.status_code) from exc

	def delete(self, path: str) -> dict[str, object]:
		try:
			return self._request("DELETE", path)
		except _RetryableGitHubError as exc:
			raise GitHubAPIError(message=exc.message, status_code=exc.status_code) from exc

	def get_issue(self, issue_number: int) -> IssueData:
		path = f"/repos/{self.repo}/issues/{issue_number}"
		payload = self.get(path)

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

	def post_comment(self, issue_number: int, body: str) -> None:
		path = f"/repos/{self.repo}/issues/{issue_number}/comments"
		self.post(path, {"body": body})

	def add_label(self, issue_number: int, label: str) -> None:
		path = f"/repos/{self.repo}/issues/{issue_number}/labels"
		self.post(path, {"labels": [label]})

	def remove_label(self, issue_number: int, label: str) -> None:
		encoded_label = quote(label, safe="")
		path = f"/repos/{self.repo}/issues/{issue_number}/labels/{encoded_label}"
		self.delete(path)

	def find_comment_by_prefix(self, issue_number: int, prefix: str) -> str | None:
		path = f"/repos/{self.repo}/issues/{issue_number}/comments"
		payload = self.get(path)
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


__all__ = ["GitHubClient"]