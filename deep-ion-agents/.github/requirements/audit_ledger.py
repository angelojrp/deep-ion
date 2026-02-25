from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class DecisionRecord:
    skill: str
    issue_id: int
    decision_type: str
    decision: str
    confidence_score: float
    rn_triggered: List[str] = field(default_factory=list)
    modules_affected: List[str] = field(default_factory=list)
    approval_weight: float = 0.0
    human_reviewer: Optional[str] = None
    human_decision: Optional[str] = None
    justification: str = ""
    artifacts_produced: List[str] = field(default_factory=list)
    lgpd_scope: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "record_id": f"DR-REQ-{uuid.uuid4()}",
            "agent": "DOM-02",
            "skill": self.skill,
            "issue_id": str(self.issue_id),
            "timestamp": utc_now_iso(),
            "decision_type": self.decision_type,
            "decision": self.decision,
            "confidence_score": round(float(self.confidence_score), 2),
            "rn_triggered": sorted(set(self.rn_triggered)),
            "modules_affected": sorted(set(self.modules_affected)),
            "approval_weight": self.approval_weight,
            "human_reviewer": self.human_reviewer,
            "human_decision": self.human_decision,
            "justification": self.justification,
            "artifacts_produced": self.artifacts_produced,
            "lgpd_scope": self.lgpd_scope,
        }


def format_decision_record_markdown(record: DecisionRecord) -> str:
    payload = record.to_dict()
    return "## DecisionRecord\n```json\n" + json.dumps(payload, ensure_ascii=False, indent=2) + "\n```"


def extract_last_decision_record(comments: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    for comment in reversed(comments):
        body = comment.get("body", "") or ""
        marker = "## DecisionRecord"
        if marker not in body:
            continue
        start = body.find("```json")
        end = body.find("```", start + 7) if start != -1 else -1
        if start == -1 or end == -1:
            continue
        raw_json = body[start + 7 : end].strip()
        try:
            return json.loads(raw_json)
        except json.JSONDecodeError:
            continue
    return None
