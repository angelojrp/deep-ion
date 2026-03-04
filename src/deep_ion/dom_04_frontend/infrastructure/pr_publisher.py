"""PrPublisher — opens or updates PRs with generated frontend code."""

from __future__ import annotations

import json
from typing import Any
from urllib import request

from deep_ion.dom_04_frontend.domain.code_generation_result import CodeGenerationResult
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.infrastructure.github_client import GitHubClient, GitHubContext

# ── Static PR body template (NV-04: no LLM-generated body) ──────────────────

_PR_BODY_TEMPLATE = """\
## DOM-04 Frontend Agent — {tier}

**Issue:** #{issue_number}
**Tier:** {tier}
**Model:** {model_used}
**Prompt Version:** {prompt_version}
**Blueprint Hash:** {blueprint_hash}

### Checklist

- [ ] Layer isolation verified
- [ ] Tests included
- [ ] i18n keys used for user-facing text
- [ ] No explanatory comments in generated code
- [ ] OutputPolicy.strip_prose() applied
{lgpd_section}
"""

_LGPD_SECTION = """\

### LGPD Scope

> This PR touches LGPD-sensitive data. Human review is **mandatory** before merge.
"""


class PrPublisher:
    """Publishes PRs with generated frontend code.

    PR body uses a static template (NV-04) — no LLM-generated content.
    """

    def __init__(self, client: GitHubClient, context: GitHubContext) -> None:
        self._client = client
        self._ctx = context

    def build_pr_body(
        self,
        *,
        issue_number: int,
        tier: FrontendTier,
        result: CodeGenerationResult,
        lgpd_scope: bool = False,
    ) -> str:
        """Build the static PR body from template."""
        lgpd_section = _LGPD_SECTION if lgpd_scope else ""
        return _PR_BODY_TEMPLATE.format(
            tier=tier.value,
            issue_number=issue_number,
            model_used=result.model_used,
            prompt_version=result.prompt_version,
            blueprint_hash=result.blueprint_hash[:12],
            lgpd_section=lgpd_section,
        )

    def create_pr(
        self,
        *,
        issue_number: int,
        tier: FrontendTier,
        result: CodeGenerationResult,
        branch_name: str,
        base_branch: str = "main",
        lgpd_scope: bool = False,
    ) -> dict[str, Any]:
        """Create a pull request with the generated code.

        Returns the GitHub API response for the created PR.
        """
        title = f"feat(fe-{tier.value.lower()}): DOM-04 frontend #{issue_number}"
        body = self.build_pr_body(
            issue_number=issue_number,
            tier=tier,
            result=result,
            lgpd_scope=lgpd_scope,
        )

        url = f"https://api.github.com/repos/{self._ctx.repository}/pulls"
        payload = json.dumps({
            "title": title,
            "head": branch_name,
            "base": base_branch,
            "body": body,
        }).encode("utf-8")

        req = request.Request(url, method="POST", data=payload)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", f"Bearer {self._ctx.token}")
        req.add_header("Content-Type", "application/json")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")

        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
