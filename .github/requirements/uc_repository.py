from __future__ import annotations

import json
import math
import os
import re
from collections import Counter
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional
from urllib import request


@dataclass
class UcRecord:
    issue_number: int
    issue_title: str
    uc_id: str
    name: str
    body_excerpt: str


class GitHubIssueClient:
    def __init__(self, repo: Optional[str] = None, token: Optional[str] = None) -> None:
        self.repo = repo or os.getenv("GITHUB_REPOSITORY", "")
        self.token = token or os.getenv("GITHUB_TOKEN", "")
        if not self.repo:
            raise ValueError("GITHUB_REPOSITORY não definido")
        if not self.token:
            raise ValueError("GITHUB_TOKEN não definido")

    def _api_get(self, path: str) -> Any:
        url = f"https://api.github.com{path}"
        req = request.Request(url)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def list_recent_issues(self, per_page: int = 100, state: str = "all") -> List[Dict[str, Any]]:
        owner, name = self.repo.split("/", maxsplit=1)
        path = f"/repos/{owner}/{name}/issues?state={state}&per_page={per_page}&sort=updated&direction=desc"
        data = self._api_get(path)
        return [item for item in data if "pull_request" not in item]


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-ZÀ-ÿ0-9_-]{3,}", text.lower())


def _cosine_similarity(vec_a: Counter, vec_b: Counter) -> float:
    common = set(vec_a.keys()) & set(vec_b.keys())
    dot = sum(vec_a[t] * vec_b[t] for t in common)
    norm_a = math.sqrt(sum(v * v for v in vec_a.values()))
    norm_b = math.sqrt(sum(v * v for v in vec_b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _extract_ucs_from_markdown(body: str, issue_number: int, issue_title: str) -> List[UcRecord]:
    if not body:
        return []

    pattern = re.compile(r"^##\s+(UC-[A-Za-z0-9._-]+):\s*(.+)$", re.MULTILINE)
    matches = list(pattern.finditer(body))
    records: List[UcRecord] = []
    for idx, match in enumerate(matches):
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        uc_id = match.group(1).strip()
        name = match.group(2).strip()
        records.append(
            UcRecord(
                issue_number=issue_number,
                issue_title=issue_title,
                uc_id=uc_id,
                name=name,
                body_excerpt=chunk[:1200],
            )
        )
    return records


def list_existing_ucs(client: Optional[GitHubIssueClient] = None) -> List[UcRecord]:
    gh = client or GitHubIssueClient()
    issues = gh.list_recent_issues(per_page=100, state="all")
    all_ucs: List[UcRecord] = []

    for issue in issues:
        issue_number = int(issue.get("number", 0))
        issue_title = issue.get("title", "")
        issue_body = issue.get("body", "") or ""

        all_ucs.extend(_extract_ucs_from_markdown(issue_body, issue_number, issue_title))

    return all_ucs


def find_similar_ucs(text: str, threshold: float = 0.8, client: Optional[GitHubIssueClient] = None) -> List[Dict[str, Any]]:
    target_tokens = Counter(_tokenize(text))
    if not target_tokens:
        return []

    matches: List[Dict[str, Any]] = []
    for uc in list_existing_ucs(client=client):
        similarity = _cosine_similarity(target_tokens, Counter(_tokenize(uc.body_excerpt)))
        if similarity >= threshold:
            matches.append(
                {
                    "issue_number": uc.issue_number,
                    "issue_title": uc.issue_title,
                    "uc_id": uc.uc_id,
                    "uc_name": uc.name,
                    "similarity": round(similarity, 4),
                }
            )

    matches.sort(key=lambda item: item["similarity"], reverse=True)
    return matches
