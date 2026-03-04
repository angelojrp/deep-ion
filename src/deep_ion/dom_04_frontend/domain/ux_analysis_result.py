"""UxAnalysisResult — immutable domain model for UX heuristic analysis output."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class NielsenHeuristic(str, Enum):
    """The 10 Nielsen usability heuristics."""

    VISIBILITY = "H1_visibility_of_system_status"
    MATCH = "H2_match_between_system_and_real_world"
    CONTROL = "H3_user_control_and_freedom"
    CONSISTENCY = "H4_consistency_and_standards"
    PREVENTION = "H5_error_prevention"
    RECOGNITION = "H6_recognition_rather_than_recall"
    FLEXIBILITY = "H7_flexibility_and_efficiency_of_use"
    AESTHETIC = "H8_aesthetic_and_minimalist_design"
    ERRORS = "H9_help_users_recognize_diagnose_recover_errors"
    HELP = "H10_help_and_documentation"


class Severity(str, Enum):
    """Severity level for UX findings."""

    BLOCKER = "blocker"
    WARNING = "warning"
    INFO = "info"


class WcagLevel(str, Enum):
    """WCAG conformance level."""

    A = "A"
    AA = "AA"
    AAA = "AAA"


class HeuristicViolation(BaseModel, frozen=True):
    """A single Nielsen heuristic violation found during UX analysis."""

    heuristic: NielsenHeuristic = Field(description="Which of the 10 Nielsen heuristics was violated.")
    severity: Severity = Field(description="Severity: blocker, warning, or info.")
    element: str = Field(description="UI element or screen area where the violation was found.")
    description: str = Field(description="Description of the violation.")
    suggestion: str = Field(description="Suggested fix or improvement.")


class WcagIssue(BaseModel, frozen=True):
    """A single WCAG accessibility issue found during UX analysis."""

    criterion: str = Field(description="WCAG criterion reference (e.g. '1.1.1', '1.4.3').")
    level: WcagLevel = Field(description="WCAG conformance level (A, AA, AAA).")
    severity: Severity = Field(description="Severity based on impact.")
    element: str = Field(description="Affected UI element or component.")
    description: str = Field(description="Description of the accessibility issue.")
    suggestion: str = Field(description="Recommended fix.")


class ConsistencyIssue(BaseModel, frozen=True):
    """A design system consistency issue found during UX analysis."""

    category: str = Field(description="Category: 'design_token' | 'component_pattern' | 'i18n'.")
    expected: str = Field(description="Expected pattern or token.")
    found: str = Field(description="Actual pattern or value found.")
    element: str = Field(description="Affected element or file.")
    description: str = Field(description="Explanation of the inconsistency.")


class UxAnalysisResult(BaseModel, frozen=True):
    """Immutable result of a UX heuristic analysis.

    Populated by SKILL-UX-00 after combining LLM analysis with
    deterministic WCAG checks from ``ux_policy``.
    """

    issue_number: int = Field(description="GitHub Issue number.")
    screens_analyzed: list[str] = Field(
        default_factory=list,
        description="List of screens/flows that were analyzed.",
    )
    heuristic_violations: list[HeuristicViolation] = Field(
        default_factory=list,
        description="Nielsen heuristic violations found.",
    )
    wcag_issues: list[WcagIssue] = Field(
        default_factory=list,
        description="WCAG accessibility issues found.",
    )
    consistency_issues: list[ConsistencyIssue] = Field(
        default_factory=list,
        description="Design system consistency issues found.",
    )
    overall_score: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Overall UX quality score (0.0 = worst, 10.0 = best).",
    )
    confidence_score: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="LLM confidence in its analysis (< 0.65 triggers escalation).",
    )

    @property
    def blocker_count(self) -> int:
        """Count how many blocker-severity findings exist."""
        h_blockers = sum(1 for v in self.heuristic_violations if v.severity == Severity.BLOCKER)
        w_blockers = sum(1 for w in self.wcag_issues if w.severity == Severity.BLOCKER)
        return h_blockers + w_blockers

    @property
    def total_findings(self) -> int:
        """Total number of findings across all categories."""
        return len(self.heuristic_violations) + len(self.wcag_issues) + len(self.consistency_issues)
