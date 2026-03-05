from datetime import timezone

import pytest
from pydantic import ValidationError

from deep_ion.agents_engine.audit.decision_record import DecisionRecord


@pytest.mark.unit
class TestDecisionRecord:
	def test_valid_record(self) -> None:
		record = DecisionRecord(
			skill_id="SKILL-DISC-00",
			decision="approve",
			confidence_score=0.9,
			justification="ok",
			model_used="deterministic",
			issue_number=42,
		)

		assert record.skill_id == "SKILL-DISC-00"
		assert record.decision == "approve"
		assert record.confidence_score == 0.9
		assert record.issue_number == 42
		assert record.timestamp_utc.tzinfo == timezone.utc

	def test_frozen_immutability(self) -> None:
		record = DecisionRecord(
			skill_id="SKILL-DISC-00",
			decision="alert",
			confidence_score=0.3,
			justification="x",
			model_used="deterministic",
		)

		with pytest.raises((ValidationError, AttributeError, TypeError)):
			record.skill_id = "CHANGED"  # type: ignore[misc]

	def test_invalid_literal_decision(self) -> None:
		with pytest.raises(ValidationError):
			DecisionRecord(
				skill_id="SKILL-DISC-00",
				decision="invalid",  # type: ignore[arg-type]
				confidence_score=0.8,
				justification="x",
				model_used="deterministic",
			)

	@pytest.mark.parametrize("score", [-0.01, 1.01])
	def test_confidence_score_out_of_range(self, score: float) -> None:
		with pytest.raises(ValidationError):
			DecisionRecord(
				skill_id="SKILL-DISC-00",
				decision="block",
				confidence_score=score,
				justification="x",
				model_used="deterministic",
			)

	def test_rn_triggered_is_tuple(self) -> None:
		record = DecisionRecord(
			skill_id="SKILL-DISC-00",
			decision="approve",
			confidence_score=1.0,
			justification="x",
			rn_triggered=["RN-01", "RN-02"],
			model_used="deterministic",
		)
		assert isinstance(record.rn_triggered, tuple)
		assert record.rn_triggered == ("RN-01", "RN-02")