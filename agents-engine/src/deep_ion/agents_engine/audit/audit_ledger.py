from deep_ion.agents_engine.audit.decision_record import DecisionRecord
from deep_ion.agents_engine.domain.protocols import AuditPort

AUDIT_COMMENT_PREFIX = "## AUDIT-LEDGER\n"


class AuditLedger:
	def __init__(self, publisher: AuditPort, issue_number: int) -> None:
		self._publisher = publisher
		self._issue_number = issue_number
		self._records: list[DecisionRecord] = []

	@property
	def records(self) -> tuple[DecisionRecord, ...]:
		return tuple(self._records)

	def emit(self, record: DecisionRecord) -> None:
		if record.issue_number is not None and record.issue_number != self._issue_number:
			raise ValueError("DecisionRecord issue_number does not match AuditLedger issue_number")

		record_to_emit = record if record.issue_number is not None else record.model_copy(update={"issue_number": self._issue_number})
		self._records.append(record_to_emit)
		self._publisher.emit(record_to_emit)


__all__ = ["AuditLedger", "AUDIT_COMMENT_PREFIX"]