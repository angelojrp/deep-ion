from unittest.mock import MagicMock

import pytest

from deep_ion.agents_engine.audit.decision_record import DecisionRecord
from deep_ion.agents_engine.infrastructure.comment_publisher import AUDIT_COMMENT_PREFIX, CommentPublisher
from deep_ion.agents_engine.infrastructure.github_client import GitHubClient


@pytest.mark.integration
class TestCommentPublisher:
	def test_publish_posts_correct_payload(self) -> None:
		client = MagicMock(spec=GitHubClient)
		publisher = CommentPublisher(client=client, repo="org/repo")

		publisher.publish(42, "hello")

		client.post.assert_called_once_with("/repos/org/repo/issues/42/comments", {"body": "hello"})

	def test_emit_serializes_decision_record(self) -> None:
		client = MagicMock(spec=GitHubClient)
		publisher = CommentPublisher(client=client, repo="org/repo")
		record = DecisionRecord(
			skill_id="SKILL-QAT-00",
			decision="approve",
			confidence_score=0.95,
			justification="ok",
			model_used="deterministic",
			issue_number=7,
		)

		publisher.emit(record)

		client.post.assert_called_once()
		path_arg = client.post.call_args.args[0]
		body_arg = client.post.call_args.args[1]["body"]
		assert path_arg == "/repos/org/repo/issues/7/comments"
		assert body_arg.startswith(AUDIT_COMMENT_PREFIX)
		assert "```json" in body_arg
		assert '"skill_id": "SKILL-QAT-00"' in body_arg

	def test_find_comment_by_prefix_returns_first_match(self) -> None:
		client = MagicMock(spec=GitHubClient)
		publisher = CommentPublisher(client=client, repo="org/repo")
		client.get.return_value = {
			"items": [
				{"body": "other"},
				{"body": "## AUDIT-LEDGER\nabc"},
			],
		}

		result = publisher.find_comment_by_prefix(8, "## AUDIT-LEDGER")

		assert result == "## AUDIT-LEDGER\nabc"