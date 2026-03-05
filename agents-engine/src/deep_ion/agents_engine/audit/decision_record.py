from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DecisionType = Literal["approve", "block", "escalar", "alert"]


class DecisionRecord(BaseModel):
	model_config = ConfigDict(frozen=True)

	skill_id: str
	timestamp_utc: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
	decision: DecisionType
	confidence_score: float = Field(ge=0.0, le=1.0)
	justification: str
	rn_triggered: tuple[str, ...] = ()
	model_used: str
	issue_number: int | None = None


__all__ = ["DecisionRecord", "DecisionType"]