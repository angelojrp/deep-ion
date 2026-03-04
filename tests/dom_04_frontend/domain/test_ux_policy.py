"""Unit tests for UX Policy — deterministic validation rules."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.ux_analysis_result import Severity, WcagLevel
from deep_ion.dom_04_frontend.domain.ux_policy import (
    ComponentConventionCheck,
    validate_component_conventions,
    validate_design_token_usage,
    validate_pr_diff_ux,
    validate_wcag_compliance,
)


# ── WCAG Compliance ──────────────────────────────────────────────────────────


class TestValidateWcagCompliance:
    def test_img_without_alt_detected(self) -> None:
        html = '<img src="icon.png">'
        issues = validate_wcag_compliance(html)
        assert len(issues) >= 1
        assert any(i.criterion == "1.1.1" for i in issues)
        assert any(i.severity == Severity.BLOCKER for i in issues)

    def test_img_with_alt_passes(self) -> None:
        html = '<img src="icon.png" alt="Account icon">'
        issues = validate_wcag_compliance(html)
        alt_issues = [i for i in issues if i.criterion == "1.1.1"]
        assert len(alt_issues) == 0

    def test_heading_hierarchy_gap_detected(self) -> None:
        html = "<h1>Title</h1><h3>Subtitle</h3>"
        issues = validate_wcag_compliance(html)
        heading_issues = [i for i in issues if i.criterion == "1.3.1" and "Heading" in i.description]
        assert len(heading_issues) >= 1

    def test_heading_hierarchy_ok(self) -> None:
        html = "<h1>Title</h1><h2>Subtitle</h2><h3>Sub-sub</h3>"
        issues = validate_wcag_compliance(html)
        heading_issues = [i for i in issues if "Heading level jumped" in i.description]
        assert len(heading_issues) == 0

    def test_input_without_label_detected(self) -> None:
        html = '<input type="text" name="name">'
        issues = validate_wcag_compliance(html)
        assert any(i.criterion == "1.3.1" and "Input" in i.description for i in issues)

    def test_input_with_aria_label_passes(self) -> None:
        html = '<input type="text" aria-label="Name input">'
        issues = validate_wcag_compliance(html)
        input_issues = [i for i in issues if "Input" in i.description]
        assert len(input_issues) == 0

    def test_hidden_input_ignored(self) -> None:
        html = '<input type="hidden" name="csrf">'
        issues = validate_wcag_compliance(html)
        input_issues = [i for i in issues if "Input" in i.description]
        assert len(input_issues) == 0

    def test_clean_html_no_issues(self) -> None:
        html = """
        <h1>Page Title</h1>
        <h2>Section</h2>
        <img src="logo.png" alt="Company logo">
        <input type="text" aria-label="Search">
        <button aria-label="Submit">Submit</button>
        """
        issues = validate_wcag_compliance(html)
        # May have minor issues but no blockers
        blockers = [i for i in issues if i.severity == Severity.BLOCKER]
        assert len(blockers) == 0

    def test_multiple_violations(self) -> None:
        html = """
        <h1>Title</h1>
        <h4>Skipped to h4</h4>
        <img src="photo.jpg">
        <input type="email">
        """
        issues = validate_wcag_compliance(html)
        assert len(issues) >= 3  # heading gap + img alt + input label


# ── Design Token Usage ───────────────────────────────────────────────────────


class TestValidateDesignTokenUsage:
    def test_hardcoded_color_detected(self) -> None:
        code = "background: #ff0000;"
        tokens = {"--color-primary": "#6C5CE7"}
        issues = validate_design_token_usage(code, tokens)
        assert len(issues) >= 1
        assert issues[0].category == "design_token"

    def test_hardcoded_rgb_detected(self) -> None:
        code = "color: rgb(255, 0, 0);"
        tokens = {}
        issues = validate_design_token_usage(code, tokens)
        assert len(issues) >= 1

    def test_hardcoded_spacing_detected(self) -> None:
        code = "padding: 16px;"
        tokens = {"--spacing-md": "1rem"}
        issues = validate_design_token_usage(code, tokens)
        assert len(issues) >= 1

    def test_css_var_not_flagged(self) -> None:
        code = "background: var(--color-primary);"
        tokens = {"--color-primary": "#6C5CE7"}
        issues = validate_design_token_usage(code, tokens)
        assert len(issues) == 0

    def test_tailwind_class_not_flagged(self) -> None:
        code = 'className="bg-primary text-white p-4"'
        tokens = {}
        issues = validate_design_token_usage(code, tokens)
        assert len(issues) == 0


# ── Component Conventions ────────────────────────────────────────────────────


class TestValidateComponentConventions:
    def test_fully_compliant_component(self) -> None:
        code = """
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils';

interface BalanceCardProps {
  amount: number;
}

export const BalanceCard = ({ amount }: BalanceCardProps) => {
  const { t } = useTranslation();
  return <div className={cn("p-4")}>{t('balance')}: R$ {amount}</div>;
};
"""
        checks = validate_component_conventions(code)
        assert all(c.passed for c in checks), f"Failed: {[c for c in checks if not c.passed]}"

    def test_missing_i18n(self) -> None:
        code = """
import { cn } from '@shared/utils';
interface CardProps { title: string; }
export const Card = ({ title }: CardProps) => <div className={cn("p-4")}>{title}</div>;
"""
        checks = validate_component_conventions(code)
        i18n_check = next(c for c in checks if c.rule == "i18n_useTranslation")
        assert not i18n_check.passed

    def test_missing_cn_helper(self) -> None:
        code = """
import { useTranslation } from 'react-i18next';
interface BtnProps { label: string; }
export const Btn = ({ label }: BtnProps) => {
  const { t } = useTranslation();
  return <button className="p-4">{t(label)}</button>;
};
"""
        checks = validate_component_conventions(code)
        cn_check = next(c for c in checks if c.rule == "cn_helper")
        assert not cn_check.passed

    def test_missing_props_interface(self) -> None:
        code = """
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils';
export const Icon = () => {
  const { t } = useTranslation();
  return <span className={cn("text-sm")}>{t('icon')}</span>;
};
"""
        checks = validate_component_conventions(code)
        props_check = next(c for c in checks if c.rule == "props_interface")
        assert not props_check.passed

    def test_inline_style_detected(self) -> None:
        code = """
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils';
interface BoxProps { color: string; }
export const Box = ({ color }: BoxProps) => {
  const { t } = useTranslation();
  return <div style={{ background: color }} className={cn("p-4")}>{t('box')}</div>;
};
"""
        checks = validate_component_conventions(code)
        style_check = next(c for c in checks if c.rule == "no_inline_styles")
        assert not style_check.passed


# ── PR Diff UX Checks ────────────────────────────────────────────────────────


class TestValidatePrDiffUx:
    def test_empty_diff_no_findings(self) -> None:
        findings = validate_pr_diff_ux("")
        assert len(findings) == 0

    def test_hardcoded_color_in_diff(self) -> None:
        diff = '+ background: #ff0000;'
        findings = validate_pr_diff_ux(diff)
        assert any(f["check"] == "R2" for f in findings)

    def test_hardcoded_text_in_jsx(self) -> None:
        diff = '+ <p> Saldo disponível </p>'
        findings = validate_pr_diff_ux(diff)
        r3 = [f for f in findings if f["check"] == "R3"]
        assert len(r3) >= 1

    def test_fetch_without_loading(self) -> None:
        diff = """
+ const { data } = useQuery({ queryKey: ['accounts'] });
+ return <div>{data.name}</div>;
"""
        findings = validate_pr_diff_ux(diff)
        assert any(f["check"] == "R6" for f in findings)
        assert any(f["check"] == "R7" for f in findings)

    def test_fetch_with_loading_and_error(self) -> None:
        diff = """
+ const { data, isLoading, isError } = useQuery({ queryKey: ['accounts'] });
+ if (isLoading) return <Skeleton />;
+ if (isError) return <Error />;
"""
        findings = validate_pr_diff_ux(diff)
        assert not any(f["check"] == "R6" for f in findings)
        assert not any(f["check"] == "R7" for f in findings)

    def test_layout_without_responsive(self) -> None:
        diff = '+ <div className="flex w-full gap-4">'
        findings = validate_pr_diff_ux(diff)
        assert any(f["check"] == "R5" for f in findings)

    def test_layout_with_responsive(self) -> None:
        diff = '+ <div className="flex w-full gap-4 md:flex-row sm:flex-col">'
        findings = validate_pr_diff_ux(diff)
        assert not any(f["check"] == "R5" for f in findings)
