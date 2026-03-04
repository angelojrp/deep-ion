"""Unit tests for UxPrototypeResult domain model."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.ux_prototype_result import (
    PrototypeScreen,
    ScreenState,
    UxPrototypeResult,
)


class TestScreenState:
    def test_four_states(self) -> None:
        assert len(ScreenState) == 4
        assert set(ScreenState) == {
            ScreenState.LOADING,
            ScreenState.EMPTY,
            ScreenState.DATA,
            ScreenState.ERROR,
        }


class TestPrototypeScreen:
    def test_frozen(self) -> None:
        s = PrototypeScreen(
            screen_id="login",
            title="Login Screen",
            html_content="<div>Login</div>",
        )
        with pytest.raises(Exception):
            s.screen_id = "other"  # type: ignore[misc]

    def test_default_fields(self) -> None:
        s = PrototypeScreen(
            screen_id="home",
            title="Home",
            html_content="<main>Home</main>",
        )
        assert s.states == []
        assert s.navigation_flows == []


class TestUxPrototypeResult:
    def test_empty_result(self) -> None:
        result = UxPrototypeResult(issue_number=42)
        assert result.screen_count == 0
        assert result.all_states_covered is True  # vacuously true

    def test_screen_count(self) -> None:
        result = UxPrototypeResult(
            issue_number=42,
            screens=[
                PrototypeScreen(screen_id="a", title="A", html_content="<div>A</div>"),
                PrototypeScreen(screen_id="b", title="B", html_content="<div>B</div>"),
            ],
        )
        assert result.screen_count == 2

    def test_all_states_covered_true(self) -> None:
        result = UxPrototypeResult(
            issue_number=42,
            screens=[
                PrototypeScreen(
                    screen_id="home",
                    title="Home",
                    html_content="<div>Home</div>",
                    states=list(ScreenState),
                ),
            ],
        )
        assert result.all_states_covered is True

    def test_all_states_covered_false(self) -> None:
        result = UxPrototypeResult(
            issue_number=42,
            screens=[
                PrototypeScreen(
                    screen_id="home",
                    title="Home",
                    html_content="<div>Home</div>",
                    states=[ScreenState.DATA, ScreenState.LOADING],  # missing empty and error
                ),
            ],
        )
        assert result.all_states_covered is False

    def test_frozen(self) -> None:
        result = UxPrototypeResult(issue_number=42)
        with pytest.raises(Exception):
            result.issue_number = 99  # type: ignore[misc]
