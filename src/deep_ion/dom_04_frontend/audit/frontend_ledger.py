"""FrontendDecisionRecord — audit ledger for DOM-04 Frontend agent decisions."""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def _utc_now_iso() -> str:
    """Return current UTC time in ISO-8601 format."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class FrontendDecisionRecord:
    """Append-only decision record for frontend tasks.

    Every decision emits a structured JSON record that includes
    all required fields per the DOM-04 specification.
    """

    skill: str
    issue_id: int
    decision_type: str
    decision: str
    confidence_score: float
    tier: str
    model_used: str = ""
    output_tokens_used: int = 0
    rn_triggered: list[str] = field(default_factory=list)
    justification: str = ""
    lgpd_scope: bool = False
    blueprint_hash: str = ""
    prompt_version: str = ""
    blocks_detected: list[str] = field(default_factory=list)
    complexity_score: float = 0.0
    ux_score: float | None = None
    wcag_violations_count: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary for JSON output."""
        return {
            "record_id": f"DR-FE-{uuid.uuid4()}",
            "agent": "DOM-04",
            "skill": self.skill,
            "issue_id": str(self.issue_id),
            "timestamp": _utc_now_iso(),
            "decision_type": self.decision_type,
            "decision": self.decision,
            "confidence_score": round(float(self.confidence_score), 2),
            "tier": self.tier,
            "model_used": self.model_used,
            "output_tokens_used": self.output_tokens_used,
            "rn_triggered": sorted(set(self.rn_triggered)),
            "justification": self.justification,
            "lgpd_scope": self.lgpd_scope,
            "blueprint_hash": self.blueprint_hash,
            "prompt_version": self.prompt_version,
            "blocks_detected": self.blocks_detected,
            "complexity_score": round(float(self.complexity_score), 2),
            "ux_score": round(float(self.ux_score), 2) if self.ux_score is not None else None,
            "wcag_violations_count": self.wcag_violations_count,
        }

    def to_json(self) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)

    def to_github_comment(self) -> str:
        """Format as GitHub comment with JSON block (NV-05: no prose)."""
        data = self.to_dict()
        prefix = f"## DecisionRecord-FE-{data['issue_id']}"
        json_block = json.dumps(data, indent=2, ensure_ascii=False)
        return f"{prefix}\n\n```json\n{json_block}\n```"
