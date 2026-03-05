from unittest.mock import MagicMock

import pytest

from deep_ion.agents_engine.audit.audit_ledger import AuditLedger
from deep_ion.agents_engine.audit.decision_record import DecisionRecord
from deep_ion.agents_engine.domain.protocols import AuditPort


@pytest.mark.unit
class TestAuditLedger:
	def test_emit_delegates_to_publisher(self) -> None:
		publisher = MagicMock(spec=AuditPort)
		ledger = AuditLedger(publisher=publisher, issue_number=99)
		record = DecisionRecord(
			skill_id="SKILL-QA-00",
			decision="alert",
			confidence_score=0.7,
			justification="review",
			model_used="deterministic",
		)

		ledger.emit(record)

		publisher.emit.assert_called_once()
		emitted_record = publisher.emit.call_args.args[0]
		assert emitted_record.issue_number == 99

	def test_mismatched_issue_number_raises(self) -> None:
		publisher = MagicMock(spec=AuditPort)
		ledger = AuditLedger(publisher=publisher, issue_number=7)
		record = DecisionRecord(
			skill_id="SKILL-QA-00",
			decision="block",
			confidence_score=0.4,
			justification="x",
			model_used="deterministic",
			issue_number=8,
		)

		with pytest.raises(ValueError):
			ledger.emit(record)

		publisher.emit.assert_not_called()

	def test_records_are_append_only_snapshot(self) -> None:
		publisher = MagicMock(spec=AuditPort)
		ledger = AuditLedger(publisher=publisher, issue_number=5)

		record = DecisionRecord(
			skill_id="SKILL-QA-00",
			decision="approve",
			confidence_score=1.0,
			justification="ok",
			model_used="deterministic",
		)
		ledger.emit(record)

		records = ledger.records
		assert isinstance(records, tuple)
		assert len(records) == 1
		assert records[0].issue_number == 5