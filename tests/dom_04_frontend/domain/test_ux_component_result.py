"""Unit tests for UxComponentResult domain model."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.ux_component_result import (
    GeneratedUxComponent,
    UxComponentResult,
)


class TestGeneratedUxComponent:
    def test_frozen(self) -> None:
        comp = GeneratedUxComponent(
            name="ConfirmDialog",
            file_path="presentation/components/ConfirmDialog.tsx",
            code="export const ConfirmDialog = () => <div />;",
        )
        with pytest.raises(Exception):
            comp.name = "Other"  # type: ignore[misc]

    def test_defaults(self) -> None:
        comp = GeneratedUxComponent(
            name="Badge",
            file_path="presentation/components/Badge.tsx",
            code="// code",
        )
        assert comp.props_interface == ""
        assert comp.usage_example == ""
        assert comp.design_rationale == ""
        assert comp.test_code == ""


class TestUxComponentResult:
    def test_empty_result(self) -> None:
        result = UxComponentResult(issue_number=42)
        assert result.component_count == 0
        assert result.all_paths_valid is True  # vacuously true

    def test_component_count(self) -> None:
        result = UxComponentResult(
            issue_number=42,
            components=[
                GeneratedUxComponent(
                    name="A",
                    file_path="presentation/components/A.tsx",
                    code="// a",
                ),
                GeneratedUxComponent(
                    name="B",
                    file_path="presentation/components/B.tsx",
                    code="// b",
                ),
            ],
        )
        assert result.component_count == 2

    def test_all_paths_valid_true(self) -> None:
        result = UxComponentResult(
            issue_number=42,
            components=[
                GeneratedUxComponent(
                    name="Card",
                    file_path="presentation/components/Card.tsx",
                    code="// code",
                ),
            ],
        )
        assert result.all_paths_valid is True

    def test_all_paths_valid_false(self) -> None:
        result = UxComponentResult(
            issue_number=42,
            components=[
                GeneratedUxComponent(
                    name="Service",
                    file_path="application/services/Service.ts",
                    code="// code",
                ),
            ],
        )
        assert result.all_paths_valid is False

    def test_frozen(self) -> None:
        result = UxComponentResult(issue_number=42)
        with pytest.raises(Exception):
            result.issue_number = 99  # type: ignore[misc]
