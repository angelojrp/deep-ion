from typing import cast
from unittest.mock import MagicMock

import pytest

from deep_ion.agents_engine.domain.protocols import AuditPort, GitHubPort
from deep_ion.agents_engine.settings import Settings


@pytest.fixture
def mock_settings() -> Settings:
	return Settings(
		github_token="fake-token",
		github_repo="org/repo",
		ai_provider="deterministic",
	)


@pytest.fixture
def mock_github_port() -> GitHubPort:
	return cast(GitHubPort, MagicMock(spec=GitHubPort))


@pytest.fixture
def mock_audit_port() -> AuditPort:
	return cast(AuditPort, MagicMock(spec=AuditPort))