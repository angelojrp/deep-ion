"""UX Policy — deterministic UX validation rules.

Provides WCAG 2.1 AA checks, design token consistency verification,
and component convention enforcement. These are deterministic checks
that augment LLM-based analysis (never replace it).
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from deep_ion.dom_04_frontend.domain.ux_analysis_result import (
    ConsistencyIssue,
    Severity,
    WcagIssue,
    WcagLevel,
)


class UxPolicyViolation(Exception):
    """Raised when a critical UX policy violation is detected."""

    def __init__(self, severity: Severity, description: str) -> None:
        self.severity = severity
        self.description = description
        super().__init__(f"UxPolicy [{severity.value}]: {description}")


@dataclass(frozen=True)
class ComponentConventionCheck:
    """Result of a single component convention check."""

    rule: str
    passed: bool
    detail: str


# ── WCAG Checks (deterministic) ─────────────────────────────────────────────

# Pattern: <img without alt attribute
_IMG_WITHOUT_ALT = re.compile(
    r"<img\b(?![^>]*\balt\s*=)[^>]*>",
    re.IGNORECASE,
)

# Pattern: heading tags to detect hierarchy gaps
_HEADING_TAG = re.compile(r"<h([1-6])\b", re.IGNORECASE)

# Pattern: <input without associated label or aria-label
_INPUT_WITHOUT_LABEL = re.compile(
    r"<input\b(?![^>]*(?:aria-label|aria-labelledby|id\s*=\s*[\"'][^\"']+[\"']))[^>]*>",
    re.IGNORECASE,
)

# Pattern: interactive elements without aria-label
_INTERACTIVE_WITHOUT_ARIA = re.compile(
    r"<(?:button|a|select|textarea)\b(?![^>]*(?:aria-label|aria-labelledby))[^>]*>",
    re.IGNORECASE,
)

# Pattern: hardcoded color values (hex, rgb, hsl) — excludes CSS custom properties
_HARDCODED_COLOR = re.compile(
    r"(?:color|background|border-color|fill|stroke)\s*:\s*(?:#[0-9a-fA-F]{3,8}|rgb[a]?\s*\(|hsl[a]?\s*\()",
    re.IGNORECASE,
)

# Pattern: hardcoded pixel spacing values (common smell for missing tokens)
_HARDCODED_SPACING = re.compile(
    r"(?:margin|padding|gap|top|right|bottom|left)\s*:\s*\d+px",
    re.IGNORECASE,
)

# Pattern: inline style attributes
_INLINE_STYLE = re.compile(r'\bstyle\s*=\s*[{"\']', re.IGNORECASE)

# Pattern: hardcoded strings in JSX (text content between tags, excluding punctuation/numbers)
_HARDCODED_JSX_TEXT = re.compile(
    r">\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{2,})\s*<",
)

# Pattern: useTranslation hook import
_USE_TRANSLATION = re.compile(r"useTranslation\s*\(", re.IGNORECASE)

# Pattern: cn() helper usage
_CN_HELPER = re.compile(r"\bcn\s*\(")

# Pattern: TypeScript interface/type for props
_PROPS_INTERFACE = re.compile(r"(?:interface|type)\s+\w+Props\b")


def validate_wcag_compliance(html: str) -> list[WcagIssue]:
    """Run deterministic WCAG 2.1 AA checks against HTML content.

    Checks:
    - W1: Images without alt text (WCAG 1.1.1)
    - W2: Heading hierarchy gaps (WCAG 1.3.1)
    - W5: Inputs without labels (WCAG 1.3.1)
    - W4/W6: Interactive elements without aria attributes (WCAG 2.1.1)
    """
    issues: list[WcagIssue] = []

    # W1: Images without alt text
    for match in _IMG_WITHOUT_ALT.finditer(html):
        issues.append(
            WcagIssue(
                criterion="1.1.1",
                level=WcagLevel.A,
                severity=Severity.BLOCKER,
                element=match.group(0)[:80],
                description="Image element missing alt attribute.",
                suggestion="Add descriptive alt text or alt='' for decorative images.",
            ),
        )

    # W2: Heading hierarchy gaps
    headings = [int(m.group(1)) for m in _HEADING_TAG.finditer(html)]
    for i in range(1, len(headings)):
        if headings[i] > headings[i - 1] + 1:
            issues.append(
                WcagIssue(
                    criterion="1.3.1",
                    level=WcagLevel.A,
                    severity=Severity.WARNING,
                    element=f"h{headings[i - 1]} → h{headings[i]}",
                    description=f"Heading level jumped from h{headings[i - 1]} to h{headings[i]}.",
                    suggestion=f"Use h{headings[i - 1] + 1} instead of h{headings[i]}.",
                ),
            )

    # W5: Inputs without label or aria-label
    for match in _INPUT_WITHOUT_LABEL.finditer(html):
        # Skip hidden inputs
        if 'type="hidden"' in match.group(0) or "type='hidden'" in match.group(0):
            continue
        issues.append(
            WcagIssue(
                criterion="1.3.1",
                level=WcagLevel.A,
                severity=Severity.BLOCKER,
                element=match.group(0)[:80],
                description="Input element missing associated label or aria-label.",
                suggestion="Add a <label for='id'> element or aria-label attribute.",
            ),
        )

    # W4: Interactive elements without aria-label
    for match in _INTERACTIVE_WITHOUT_ARIA.finditer(html):
        tag_content = match.group(0)
        # Skip if element has visible text content (not self-closing)
        if ">" in tag_content and not tag_content.endswith("/>"):
            continue
        issues.append(
            WcagIssue(
                criterion="2.1.1",
                level=WcagLevel.A,
                severity=Severity.WARNING,
                element=tag_content[:80],
                description="Interactive element missing aria-label or aria-labelledby.",
                suggestion="Add aria-label describing the element's purpose.",
            ),
        )

    return issues


def validate_design_token_usage(code: str, tokens: dict[str, str]) -> list[ConsistencyIssue]:
    """Detect hardcoded colors and spacing where design tokens should be used.

    Args:
        code: CSS, HTML, or TSX source code.
        tokens: Map of CSS custom property names to their values.
    """
    issues: list[ConsistencyIssue] = []

    # Hardcoded colors
    for match in _HARDCODED_COLOR.finditer(code):
        issues.append(
            ConsistencyIssue(
                category="design_token",
                expected="var(--color-*) or Tailwind color class",
                found=match.group(0)[:60],
                element=f"line containing: {match.group(0)[:40]}",
                description="Hardcoded color value found. Use design tokens or Tailwind classes.",
            ),
        )

    # Hardcoded spacing
    for match in _HARDCODED_SPACING.finditer(code):
        issues.append(
            ConsistencyIssue(
                category="design_token",
                expected="var(--spacing-*) or Tailwind spacing class",
                found=match.group(0)[:60],
                element=f"line containing: {match.group(0)[:40]}",
                description="Hardcoded pixel spacing found. Use design tokens or Tailwind spacing.",
            ),
        )

    return issues


def validate_component_conventions(component_code: str) -> list[ComponentConventionCheck]:
    """Verify that a React component follows project conventions.

    Checks:
    - useTranslation() is used for i18n
    - cn() helper is used for class merging
    - TypeScript props interface is explicitly defined
    - No inline style attributes
    """
    checks: list[ComponentConventionCheck] = []

    # i18n: useTranslation() present
    has_i18n = bool(_USE_TRANSLATION.search(component_code))
    checks.append(
        ComponentConventionCheck(
            rule="i18n_useTranslation",
            passed=has_i18n,
            detail="useTranslation() hook detected" if has_i18n else "Missing useTranslation() — all user-facing text must be translated.",
        ),
    )

    # cn() helper usage
    has_cn = bool(_CN_HELPER.search(component_code))
    checks.append(
        ComponentConventionCheck(
            rule="cn_helper",
            passed=has_cn,
            detail="cn() helper detected" if has_cn else "Missing cn() helper — use cn() for Tailwind class merging.",
        ),
    )

    # Props interface
    has_props = bool(_PROPS_INTERFACE.search(component_code))
    checks.append(
        ComponentConventionCheck(
            rule="props_interface",
            passed=has_props,
            detail="Props interface/type detected" if has_props else "Missing explicit Props interface — define XxxProps interface.",
        ),
    )

    # No inline styles
    has_inline_style = bool(_INLINE_STYLE.search(component_code))
    checks.append(
        ComponentConventionCheck(
            rule="no_inline_styles",
            passed=not has_inline_style,
            detail="No inline styles detected" if not has_inline_style else "Inline style attribute found — use Tailwind classes instead.",
        ),
    )

    # Hardcoded JSX text
    hardcoded_texts = _HARDCODED_JSX_TEXT.findall(component_code)
    # Filter out common false positives (component names, type annotations)
    meaningful_texts = [t for t in hardcoded_texts if not t.strip().startswith(("{", "}", "(", ")"))]
    has_hardcoded = len(meaningful_texts) > 0
    checks.append(
        ComponentConventionCheck(
            rule="no_hardcoded_text",
            passed=not has_hardcoded,
            detail="No hardcoded text detected" if not has_hardcoded else f"Hardcoded text found: {meaningful_texts[:3]} — use i18n keys.",
        ),
    )

    return checks


def validate_pr_diff_ux(diff_content: str) -> list[dict[str, str]]:
    """Analyze a PR diff for common UX issues.

    Returns a list of findings with 'check', 'severity', 'detail' keys.
    Used by SKILL-UX-03 as deterministic pre-check before LLM analysis.
    """
    findings: list[dict[str, str]] = []

    # R1: Interactive elements without aria
    if _INTERACTIVE_WITHOUT_ARIA.search(diff_content):
        findings.append({
            "check": "R1",
            "severity": "blocker",
            "detail": "Interactive element added without aria-label.",
        })

    # R2: Hardcoded colors
    if _HARDCODED_COLOR.search(diff_content):
        findings.append({
            "check": "R2",
            "severity": "warning",
            "detail": "Hardcoded color value in diff — use design tokens.",
        })

    # R3: Hardcoded text in JSX (missing i18n)
    if _HARDCODED_JSX_TEXT.search(diff_content):
        findings.append({
            "check": "R3",
            "severity": "blocker",
            "detail": "Hardcoded user-facing text in JSX — use useTranslation().",
        })

    # R5: Check for responsive classes
    has_responsive = bool(re.search(r"(?:sm:|md:|lg:|xl:)", diff_content))
    has_layout_component = bool(re.search(r"(?:flex|grid|w-full|max-w-)", diff_content))
    if has_layout_component and not has_responsive:
        findings.append({
            "check": "R5",
            "severity": "warning",
            "detail": "Layout components without responsive breakpoints detected.",
        })

    # R6: Fetch without loading state
    has_fetch = bool(re.search(r"(?:useQuery|useMutation|fetch\(|axios)", diff_content))
    has_loading = bool(re.search(r"(?:isLoading|isPending|loading|Skeleton|Spinner)", diff_content))
    if has_fetch and not has_loading:
        findings.append({
            "check": "R6",
            "severity": "warning",
            "detail": "Data fetching without visible loading state.",
        })

    # R7: Fetch without error handling
    has_error = bool(re.search(r"(?:isError|error|Error|catch\(|onError)", diff_content))
    if has_fetch and not has_error:
        findings.append({
            "check": "R7",
            "severity": "warning",
            "detail": "Data fetching without visible error handling.",
        })

    return findings
