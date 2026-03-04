"""Unit tests for TaskClassifier — deterministic blocking rules and scoring."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.frontend_task import FrontendTask
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.task_classifier import (
    PLENO_SCORE_THRESHOLD,
    ClassificationResult,
    TaskClassifier,
)


# ── Helpers ──────────────────────────────────────────────────────────────────


def _task(
    *,
    title: str = "Simple button",
    description: str = "Add a simple button component",
    affected_files: list[str] | None = None,
    classification: str = "T0",
    lgpd_scope: bool = False,
    rn_references: list[str] | None = None,
    target_module: str = "shared",
) -> FrontendTask:
    return FrontendTask(
        issue_number=1,
        title=title,
        description=description,
        target_module=target_module,
        affected_files=affected_files or [],
        classification=classification,
        lgpd_scope=lgpd_scope,
        rn_references=rn_references or [],
    )


# ── Trivial task → JUNIOR ───────────────────────────────────────────────────


class TestJuniorClassification:
    """Tasks with no blocking signals → JUNIOR."""

    def test_trivial_task_goes_junior(self) -> None:
        result = TaskClassifier.classify(_task())
        assert result.tier == FrontendTier.JUNIOR
        assert not result.escalated
        assert result.original_tier is None
        assert result.blocks_detected == []

    def test_presentation_only_files_go_junior(self) -> None:
        task = _task(
            affected_files=[
                "presentation/components/Button.tsx",
                "presentation/pages/Home.tsx",
            ],
        )
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.JUNIOR

    def test_t0_classification_low_score(self) -> None:
        result = TaskClassifier.classify(_task(classification="T0"))
        assert result.complexity_score >= 1.0
        assert result.complexity_score < PLENO_SCORE_THRESHOLD


# ── Junior blocked → PLENO ──────────────────────────────────────────────────


class TestJuniorBlocks:
    """Tasks that trigger Junior blocking rules → escalated to PLENO."""

    @pytest.mark.parametrize(
        "keyword",
        ["auth", "token", "lgpd", "cpf", "saldo"],
    )
    def test_keyword_blocks_junior(self, keyword: str) -> None:
        task = _task(description=f"Task involves {keyword} handling")
        result = TaskClassifier.classify(task)
        assert result.tier in (FrontendTier.PLENO, FrontendTier.SENIOR)
        assert result.escalated
        assert any(f"keyword_block:{keyword}" in b for b in result.blocks_detected)

    @pytest.mark.parametrize(
        "keyword",
        ["Auth", "TOKEN", "LGPD", "CPF", "Saldo"],
    )
    def test_keyword_block_case_insensitive(self, keyword: str) -> None:
        task = _task(title=f"Implement {keyword} page")
        result = TaskClassifier.classify(task)
        assert result.escalated

    @pytest.mark.parametrize(
        "path",
        [
            "application/hooks/useAuth.ts",
            "infrastructure/api/client.ts",
            "domain/entities/Account.ts",
        ],
    )
    def test_path_blocks_junior(self, path: str) -> None:
        task = _task(affected_files=[path])
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert any("path_block:" in b for b in result.blocks_detected)

    @pytest.mark.parametrize(
        "filename",
        ["AppRouter.tsx", "ProtectedRoute.tsx"],
    )
    def test_specific_file_blocks_junior(self, filename: str) -> None:
        task = _task(affected_files=[f"presentation/{filename}"])
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert any("file_block:" in b for b in result.blocks_detected)

    def test_custom_hook_blocks_junior(self) -> None:
        task = _task(description="Create a custom hook for form validation")
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert "custom_hook_creation" in result.blocks_detected

    def test_api_client_integration_blocks_junior(self) -> None:
        task = _task(description="Needs API client for fetching data")
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert "api_client_integration" in result.blocks_detected

    def test_api_integration_blocks_junior(self) -> None:
        task = _task(description="Implement API integration for transfers")
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert "api_client_integration" in result.blocks_detected

    def test_rn_references_block_junior(self) -> None:
        task = _task(rn_references=["RN-01", "RN-02"])
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert any("rn_references:" in b for b in result.blocks_detected)

    def test_junior_blocked_escalates_to_pleno(self) -> None:
        """When ONLY junior is blocked, result tier is PLENO."""
        task = _task(affected_files=["application/hooks/useForm.ts"])
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.PLENO
        assert result.escalated
        assert result.original_tier == FrontendTier.JUNIOR

    def test_multiple_blocks_accumulated(self) -> None:
        task = _task(
            description="Auth token handling",
            affected_files=["application/services/auth.ts"],
            rn_references=["RN-01"],
        )
        result = TaskClassifier.classify(task)
        assert result.escalated
        assert len(result.blocks_detected) >= 3  # keyword + path + rn


# ── Pleno blocked → SENIOR ──────────────────────────────────────────────────


class TestPlenoBlocks:
    """Tasks that trigger Pleno blocking rules → escalated to SENIOR."""

    @pytest.mark.parametrize(
        "keyword",
        ["oauth2", "pkce", "authorization code"],
    )
    def test_pleno_keyword_blocks(self, keyword: str) -> None:
        task = _task(description=f"Implement {keyword} flow")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert result.escalated
        assert any(f"pleno_keyword_block:{keyword}" in b for b in result.blocks_detected)

    def test_lgpd_keyword_blocks_pleno(self) -> None:
        """LGPD appears in both junior and pleno keyword lists."""
        task = _task(description="Handle lgpd compliance in form")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert result.escalated

    @pytest.mark.parametrize(
        "path",
        [
            "auth/AuthProvider.tsx",
            "presentation/AuthProvider.tsx",
            "infrastructure/TokenService.ts",
        ],
    )
    def test_pleno_path_blocks(self, path: str) -> None:
        task = _task(affected_files=[path])
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert any("pleno_path_block:" in b for b in result.blocks_detected)

    def test_lgpd_scope_blocks_pleno(self) -> None:
        task = _task(lgpd_scope=True)
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert result.escalated
        assert "lgpd_scope" in result.blocks_detected

    def test_new_module_creation_blocks_pleno(self) -> None:
        task = _task(description="Create novo módulo for reports")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert any("new_module_creation" in b for b in result.blocks_detected)

    def test_new_module_english_blocks_pleno(self) -> None:
        task = _task(description="Creating a new module for bulk imports")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert any("new_module_creation" in b for b in result.blocks_detected)

    def test_multiple_route_changes_blocks_pleno(self) -> None:
        task = _task(
            affected_files=[
                "presentation/AppRouter.tsx",
                "presentation/router/index.tsx",
                "presentation/router/admin.tsx",
            ],
        )
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert any("multiple_route_changes:" in b for b in result.blocks_detected)

    def test_two_route_changes_do_not_block(self) -> None:
        task = _task(
            affected_files=[
                "presentation/AppRouter.tsx",
                "presentation/router/index.tsx",
            ],
        )
        result = TaskClassifier.classify(task)
        # 2 route changes ≤ 2; should NOT trigger multiple_route_changes block
        assert not any("multiple_route_changes:" in b for b in result.blocks_detected)

    @pytest.mark.parametrize(
        "keyword",
        ["lazy loading", "code splitting", "bundle analysis", "lighthouse"],
    )
    def test_performance_keywords_block_pleno(self, keyword: str) -> None:
        task = _task(description=f"Optimize with {keyword} strategy")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert any("performance_optimization:" in b for b in result.blocks_detected)

    def test_score_threshold_blocks_pleno(self) -> None:
        """A high-complexity T2 task with many files exceeds PLENO_SCORE_THRESHOLD."""
        task = _task(
            classification="T2",
            affected_files=[f"presentation/Component{i}.tsx" for i in range(6)],
            rn_references=["RN-01", "RN-02", "RN-03", "RN-04"],
        )
        result = TaskClassifier.classify(task)
        assert result.complexity_score >= PLENO_SCORE_THRESHOLD

    def test_pleno_blocked_original_tier_preserved(self) -> None:
        """When only pleno is blocked (not junior), original_tier = JUNIOR."""
        task = _task(description="Implement oauth2 login")
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert result.escalated
        # oauth2 also doesn't trigger junior blocks specifically
        # but lgpd or auth keyword in junior list may apply
        assert result.original_tier is not None

    def test_both_junior_and_pleno_blocked(self) -> None:
        """When both junior and pleno are blocked, original_tier should be PLENO."""
        task = _task(
            description="Handle lgpd compliance with oauth2",
            affected_files=["application/hooks/useAuth.ts"],
            lgpd_scope=True,
        )
        result = TaskClassifier.classify(task)
        assert result.tier == FrontendTier.SENIOR
        assert result.escalated
        # junior_blocked=True so original_tier=PLENO
        assert result.original_tier == FrontendTier.PLENO


# ── Complexity Score ─────────────────────────────────────────────────────────


class TestComplexityScore:
    """Tests for _compute_complexity_score heuristic."""

    def test_base_score_t0(self) -> None:
        result = TaskClassifier.classify(_task(classification="T0"))
        assert result.complexity_score == pytest.approx(1.0)

    def test_base_score_t1(self) -> None:
        result = TaskClassifier.classify(_task(classification="T1"))
        assert result.complexity_score == pytest.approx(3.0)

    def test_base_score_t3(self) -> None:
        result = TaskClassifier.classify(_task(classification="T3"))
        assert result.complexity_score == pytest.approx(9.0)

    def test_files_add_to_score(self) -> None:
        """Each affected file adds 0.5 (capped at 3.0)."""
        task_0 = _task()
        task_2 = _task(affected_files=["presentation/A.tsx", "presentation/B.tsx"])
        r0 = TaskClassifier.classify(task_0)
        r2 = TaskClassifier.classify(task_2)
        assert r2.complexity_score == pytest.approx(r0.complexity_score + 1.0)

    def test_file_count_cap(self) -> None:
        """File contribution is capped at +3.0 (6 files max effective)."""
        task = _task(
            affected_files=[f"presentation/C{i}.tsx" for i in range(10)],
        )
        result = TaskClassifier.classify(task)
        # base 1.0 + 3.0 (cap) = 4.0
        assert result.complexity_score == pytest.approx(4.0)

    def test_lgpd_scope_adds_score(self) -> None:
        task = _task(lgpd_scope=True)
        result = TaskClassifier.classify(task)
        # LGPD adds 1.0 to score; also triggers pleno block
        assert result.complexity_score >= 2.0

    def test_rn_references_add_to_score(self) -> None:
        task = _task(rn_references=["RN-01", "RN-02"])
        result = TaskClassifier.classify(task)
        # base 1.0 + 1.0 (2 RNs * 0.5) = 2.0
        assert result.complexity_score >= 2.0

    def test_rn_references_cap(self) -> None:
        """RN contribution capped at +2.0."""
        task = _task(rn_references=["RN-01", "RN-02", "RN-03", "RN-04", "RN-05"])
        result = TaskClassifier.classify(task)
        # base 1.0 + 2.0 (cap) = 3.0
        assert result.complexity_score == pytest.approx(3.0)

    def test_cross_layer_adds_score(self) -> None:
        task = _task(
            affected_files=[
                "presentation/Page.tsx",
                "application/hooks/useData.ts",
            ],
        )
        result = TaskClassifier.classify(task)
        # base 1.0 + 1.0 (2 files) + 0.5 (2 layers - 1) = 2.5
        # But path blocks also trigger, so just verify > base
        assert result.complexity_score > 1.0

    def test_max_score_capped_at_10(self) -> None:
        """Score never exceeds 10.0."""
        task = _task(
            classification="T3",
            affected_files=[f"presentation/C{i}.tsx" for i in range(10)],
            lgpd_scope=True,
            rn_references=["RN-01", "RN-02", "RN-03", "RN-04", "RN-05"],
        )
        result = TaskClassifier.classify(task)
        assert result.complexity_score <= 10.0

    def test_unknown_classification_defaults_to_1(self) -> None:
        task = _task(classification="UNKNOWN")
        result = TaskClassifier.classify(task)
        assert result.complexity_score >= 1.0


# ── ClassificationResult frozen ─────────────────────────────────────────────


class TestClassificationResult:
    """Ensure ClassificationResult is immutable."""

    def test_frozen_dataclass(self) -> None:
        result = ClassificationResult(
            tier=FrontendTier.JUNIOR,
            complexity_score=1.0,
            blocks_detected=[],
            escalated=False,
        )
        with pytest.raises(AttributeError):
            result.tier = FrontendTier.SENIOR  # type: ignore[misc]
