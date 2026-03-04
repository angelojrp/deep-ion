"""FrontendTask — immutable domain model for a frontend task."""

from __future__ import annotations

from pydantic import BaseModel, Field


class FrontendTask(BaseModel, frozen=True):
    """Immutable representation of a frontend development task.

    Populated from GitHub Issue comment with prefix ``## ADR-FE-``.
    """

    issue_number: int = Field(description="GitHub Issue number.")
    title: str = Field(description="Task title extracted from issue.")
    description: str = Field(description="Full textual description of the frontend task.")
    target_module: str = Field(
        description=(
            "Target frontend module "
            "(conta | transacao | categoria | orcamento | meta | relatorio | shared)."
        ),
    )
    affected_files: list[str] = Field(
        default_factory=list,
        description="List of file paths expected to be affected.",
    )
    classification: str = Field(
        default="T0",
        description="Task complexity classification (T0 | T1 | T2 | T3).",
    )
    lgpd_scope: bool = Field(
        default=False,
        description="Whether the task involves LGPD-sensitive data.",
    )
    rn_references: list[str] = Field(
        default_factory=list,
        description="Business rule references found (e.g. RN-01).",
    )
