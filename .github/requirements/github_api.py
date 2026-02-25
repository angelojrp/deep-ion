from __future__ import annotations

import json
import os
import pathlib
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from urllib import parse, request


def _load_dotenv() -> None:
    """Carrega variáveis de um arquivo .env sem dependências externas.

    Procura o .env subindo a árvore de diretórios a partir deste arquivo
    (útil tanto para execução local quanto durante testes).
    Variáveis já presentes no ambiente nunca são sobrescritas, garantindo
    compatibilidade com GitHub Actions que injeta GITHUB_TOKEN nativamente.
    """
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


@dataclass
class GitHubContext:
    repository: str
    token: str

    @property
    def owner(self) -> str:
        return self.repository.split("/", maxsplit=1)[0]

    @property
    def repo(self) -> str:
        return self.repository.split("/", maxsplit=1)[1]


class GitHubAPI:
    def __init__(self, repository: Optional[str] = None, token: Optional[str] = None) -> None:
        repo = repository or os.getenv("GITHUB_REPOSITORY", "")
        gh_token = token or os.getenv("GITHUB_TOKEN", "")
        if not repo:
            raise ValueError("GITHUB_REPOSITORY não definido")
        if not gh_token:
            raise ValueError("GITHUB_TOKEN não definido")
        self.ctx = GitHubContext(repository=repo, token=gh_token)

    def _request(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
        url = f"https://api.github.com{path}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = request.Request(url, method=method, data=data)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", f"Bearer {self.ctx.token}")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        with request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode("utf-8")
            return json.loads(text) if text else {}

    def get_issue(self, issue_number: int) -> Dict[str, Any]:
        return self._request("GET", f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues/{issue_number}")

    def list_issue_comments(self, issue_number: int, per_page: int = 100) -> List[Dict[str, Any]]:
        path = f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues/{issue_number}/comments?per_page={per_page}&sort=created&direction=asc"
        return self._request("GET", path)

    def post_issue_comment(self, issue_number: int, body: str) -> Dict[str, Any]:
        return self._request(
            "POST",
            f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues/{issue_number}/comments",
            {"body": body},
        )

    def get_labels(self, issue_number: int) -> List[str]:
        data = self._request("GET", f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues/{issue_number}/labels")
        return [label["name"] for label in data]

    def set_labels(self, issue_number: int, labels: List[str]) -> None:
        self._request(
            "PUT",
            f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues/{issue_number}/labels",
            {"labels": labels},
        )

    def add_labels(self, issue_number: int, labels_to_add: List[str]) -> None:
        current = set(self.get_labels(issue_number))
        current.update(labels_to_add)
        self.set_labels(issue_number, sorted(current))

    def remove_labels(self, issue_number: int, labels_to_remove: List[str]) -> None:
        current = set(self.get_labels(issue_number))
        current.difference_update(labels_to_remove)
        self.set_labels(issue_number, sorted(current))

    def list_recent_issues(self, per_page: int = 100, state: str = "all") -> List[Dict[str, Any]]:
        query = parse.urlencode(
            {
                "state": state,
                "per_page": str(per_page),
                "sort": "updated",
                "direction": "desc",
            }
        )
        data = self._request("GET", f"/repos/{self.ctx.owner}/{self.ctx.repo}/issues?{query}")
        return [item for item in data if "pull_request" not in item]
