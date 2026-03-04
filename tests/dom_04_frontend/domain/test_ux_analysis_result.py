"""Unit tests for UxAnalysisResult domain model."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.ux_analysis_result import (
    ConsistencyIssue,
    HeuristicViolation,
    NielsenHeuristic,
    Severity,
    UxAnalysisResult,
    WcagIssue,
    WcagLevel,
)


class TestNielsenHeuristic:
    """Verify all 10 Nielsen heuristics are defined."""

    def test_has_10_heuristics(self) -> None:
        assert len(NielsenHeuristic) == 10

    def test_heuristic_values_start_with_h(self) -> None:
        for h in NielsenHeuristic:
            assert h.value.startswith("H"), f"{h.name} does not start with H"

    def test_all_heuristics_enumerable(self) -> None:
        names = {h.name for h in NielsenHeuristic}
        expected = {
            "VISIBILITY", "MATCH", "CONTROL", "CONSISTENCY", "PREVENTION",
            "RECOGNITION", "FLEXIBILITY", "AESTHETIC", "ERRORS", "HELP",
        }
        assert names == expected


class TestSeverity:
    def test_three_levels(self) -> None:
        assert set(Severity) == {Severity.BLOCKER, Severity.WARNING, Severity.INFO}


class TestHeuristicViolation:
    def test_frozen(self) -> None:
        v = HeuristicViolation(
            heuristic=NielsenHeuristic.VISIBILITY,
            severity=Severity.WARNING,
            element="submit button",
            description="No loading feedback",
            suggestion="Add spinner on submit",
        )
        with pytest.raises(Exception):
            v.element = "other"  # type: ignore[misc]

    def test_fields(self) -> None:
        v = HeuristicViolation(
            heuristic=NielsenHeuristic.PREVENTION,
            severity=Severity.BLOCKER,
            element="delete button",
            description="No confirmation dialog",
            suggestion="Add confirmation modal",
        )
        assert v.heuristic == NielsenHeuristic.PREVENTION
        assert v.severity == Severity.BLOCKER


class TestWcagIssue:
    def test_frozen(self) -> None:
        w = WcagIssue(
            criterion="1.1.1",
            level=WcagLevel.A,
            severity=Severity.BLOCKER,
            element="<img>",
            description="Missing alt",
            suggestion="Add alt text",
        )
        with pytest.raises(Exception):
            w.criterion = "2.1.1"  # type: ignore[misc]


class TestConsistencyIssue:
    def test_all_fields(self) -> None:
        c = ConsistencyIssue(
            category="design_token",
            expected="var(--color-primary)",
            found="#6C5CE7",
            element="header background",
            description="Hardcoded color",
        )
        assert c.category == "design_token"
        assert c.expected == "var(--color-primary)"


class TestUxAnalysisResult:
    def test_frozen(self) -> None:
        result = UxAnalysisResult(issue_number=42)
        with pytest.raises(Exception):
            result.issue_number = 99  # type: ignore[misc]

    def test_empty_result(self) -> None:
        result = UxAnalysisResult(issue_number=42)
        assert result.total_findings == 0
        assert result.blocker_count == 0
        assert result.overall_score == 0.0
        assert result.confidence_score == 0.0

    def test_blocker_count(self) -> None:
        result = UxAnalysisResult(
            issue_number=42,
            heuristic_violations=[
                HeuristicViolation(
                    heuristic=NielsenHeuristic.PREVENTION,
                    severity=Severity.BLOCKER,
                    element="btn", description="d", suggestion="s",
                ),
                HeuristicViolation(
                    heuristic=NielsenHeuristic.VISIBILITY,
                    severity=Severity.WARNING,
                    element="spinner", description="d", suggestion="s",
                ),
            ],
            wcag_issues=[
                WcagIssue(
                    criterion="1.1.1", level=WcagLevel.A,
                    severity=Severity.BLOCKER,
                    element="img", description="d", suggestion="s",
                ),
            ],
        )
        assert result.blocker_count == 2
        assert result.total_findings == 3

    def test_score_bounds(self) -> None:
        result = UxAnalysisResult(
            issue_number=1,
            overall_score=10.0,
            confidence_score=1.0,
        )
        assert result.overall_score == 10.0
        assert result.confidence_score == 1.0

    def test_score_validation(self) -> None:
        with pytest.raises(Exception):
            UxAnalysisResult(issue_number=1, overall_score=11.0)

        with pytest.raises(Exception):
            UxAnalysisResult(issue_number=1, confidence_score=1.5)

        with pytest.raises(Exception):
            UxAnalysisResult(issue_number=1, overall_score=-1.0)
