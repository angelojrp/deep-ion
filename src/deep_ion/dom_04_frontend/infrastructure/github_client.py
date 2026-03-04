"""GitHubClient — GitHub API adapter for DOM-04 Frontend agents."""

from __future__ import annotations

import json
import os
import pathlib
import re
from dataclasses import dataclass
from typing import Any
from urllib import request


def _load_dotenv() -> None:
    """Load .env file from project root without external dependencies."""
    start = pathlib.Path(__file__).resolve().parent
    for directory in [start, *start.parents]:
        env_file = directory / ".env"
        if env_file.is_file():
            with env_file.open(encoding="utf-8") as fh:
                for raw_line in fh:
                    line = raw_line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = value
            break


_load_dotenv()


@dataclass(frozen=True)
class GitHubContext:
    """GitHub repository context."""

    repository: str
    token: str

    @property
    def owner(self) -> str:
        return self.repository.split("/", maxsplit=1)[0]

    @property
    def repo(self) -> str:
        return self.repository.split("/", maxsplit=1)[1]


class GitHubClient:
    """GitHub API client for reading/writing Issue comments and labels."""

    def __init__(self, context: GitHubContext | None = None) -> None:
        if context is None:
            context = GitHubContext(
                repository=os.getenv("GITHUB_REPOSITORY", ""),
                token=os.getenv("GITHUB_TOKEN", ""),
            )
        self._ctx = context
        if not self._ctx.repository:
            raise ValueError("GITHUB_REPOSITORY not set")
        if not self._ctx.token:
            raise ValueError("GITHUB_TOKEN not set")

    def _api_get(self, path: str) -> Any:
        """GET request to GitHub API."""
        url = f"https://api.github.com{path}"
        req = request.Request(url)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", f"Bearer {self._ctx.token}")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def _api_post(self, path: str, body: dict[str, Any]) -> Any:
        """POST request to GitHub API."""
        url = f"https://api.github.com{path}"
        data = json.dumps(body).encode("utf-8")
        req = request.Request(url, method="POST", data=data)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", f"Bearer {self._ctx.token}")
        req.add_header("Content-Type", "application/json")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def get_issue_comments(self, issue_number: int) -> list[dict[str, Any]]:
        """Fetch all comments for an issue."""
        path = f"/repos/{self._ctx.repository}/issues/{issue_number}/comments?per_page=100"
        return self._api_get(path)

    def find_comment_by_prefix(self, issue_number: int, prefix: str) -> str | None:
        """Find the latest comment starting with the given prefix."""
        comments = self.get_issue_comments(issue_number)
        for comment in reversed(comments):
            body = comment.get("body", "") or ""
            if body.startswith(prefix):
                return body
        return None

    def post_comment(self, issue_number: int, body: str) -> dict[str, Any]:
        """Post a comment on an issue."""
        path = f"/repos/{self._ctx.repository}/issues/{issue_number}/comments"
        return self._api_post(path, {"body": body})

    def add_label(self, issue_number: int, label: str) -> Any:
        """Add a label to an issue."""
        path = f"/repos/{self._ctx.repository}/issues/{issue_number}/labels"
        return self._api_post(path, {"labels": [label]})

    def get_issue(self, issue_number: int) -> dict[str, Any]:
        """Fetch issue details."""
        path = f"/repos/{self._ctx.repository}/issues/{issue_number}"
        return self._api_get(path)

    def parse_adr_fe_comment(self, comment_body: str) -> dict[str, Any]:
        """Parse an ``## ADR-FE-`` prefixed comment into structured data."""
        result: dict[str, Any] = {
            "description": "",
            "target_module": "",
            "affected_files": [],
        }

        lines = comment_body.splitlines()
        current_section = ""

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("## ADR-FE-"):
                continue
            if stripped.lower().startswith("### descrição") or stripped.lower().startswith("### description"):
                current_section = "description"
                continue
            if stripped.lower().startswith("### módulo") or stripped.lower().startswith("### module"):
                current_section = "module"
                continue
            if stripped.lower().startswith("### arquivos") or stripped.lower().startswith("### files"):
                current_section = "files"
                continue

            if current_section == "description" and stripped:
                result["description"] += stripped + "\n"
            elif current_section == "module" and stripped:
                result["target_module"] = stripped.lower()
            elif current_section == "files" and stripped.startswith("- "):
                result["affected_files"].append(stripped[2:].strip())

        result["description"] = result["description"].strip()
        return result

    def parse_fe_tier_comment(self, comment_body: str) -> dict[str, Any] | None:
        """Parse a ``## FE-TIER-`` prefixed comment into structured data."""
        if not comment_body.startswith("## FE-TIER-"):
            return None

        # Extract JSON block from comment.
        json_match = re.search(r"```json\s*\n(.*?)\n```", comment_body, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        # Try parsing the body directly as JSON after the header line.
        lines = comment_body.splitlines()
        json_lines = [l for l in lines[1:] if l.strip() and not l.startswith("##")]
        if json_lines:
            try:
                return json.loads("\n".join(json_lines))
            except json.JSONDecodeError:
                pass

        return None

    # ── PR-related methods (used by UX skills) ──────────────────────────────

    def get_pr_diff(self, pr_number: int) -> str:
        """Fetch the raw diff for a pull request.

        Uses the ``application/vnd.github.v3.diff`` media type.
        """
        url = f"https://api.github.com/repos/{self._ctx.repository}/pulls/{pr_number}"
        req = request.Request(url)
        req.add_header("Accept", "application/vnd.github.v3.diff")
        req.add_header("Authorization", f"Bearer {self._ctx.token}")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        with request.urlopen(req, timeout=60) as resp:
            return resp.read().decode("utf-8")

    def get_pr_files(self, pr_number: int) -> list[dict[str, Any]]:
        """Fetch the list of files changed in a pull request."""
        path = f"/repos/{self._ctx.repository}/pulls/{pr_number}/files?per_page=100"
        return self._api_get(path)

    def post_pr_comment(self, pr_number: int, body: str) -> dict[str, Any]:
        """Post a comment on a pull request (uses the issues API endpoint)."""
        return self.post_comment(pr_number, body)
