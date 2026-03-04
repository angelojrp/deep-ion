"""TaskClassifier — deterministic complexity classification for frontend tasks.

Deterministic checks run BEFORE any LLM analysis and are inviolable (ground truth).
LLM inference is used only for ambiguous cases after deterministic rules pass.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from deep_ion.dom_04_frontend.domain.frontend_task import FrontendTask
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier

# ── Deterministic blocking patterns ─────────────────────────────────────────

# Keywords in task description that force escalation out of Junior.
_JUNIOR_BLOCKED_KEYWORDS: frozenset[str] = frozenset({
    "auth",
    "token",
    "lgpd",
    "cpf",
    "saldo",
})

# Path patterns that block Junior (any file in these directories).
_JUNIOR_BLOCKED_PATH_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"application/", re.IGNORECASE),
    re.compile(r"infrastructure/", re.IGNORECASE),
    re.compile(r"domain/", re.IGNORECASE),
]

# Specific files that block Junior.
_JUNIOR_BLOCKED_FILES: frozenset[str] = frozenset({
    "approuter.tsx",
    "protectedroute.tsx",
})

# Keywords/patterns that block Pleno → escalate to Senior.
_PLENO_BLOCKED_KEYWORDS: frozenset[str] = frozenset({
    "oauth2",
    "pkce",
    "authorization code",
    "lgpd",
})

# Path patterns that block Pleno.
_PLENO_BLOCKED_PATH_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"auth/", re.IGNORECASE),
    re.compile(r"authprovider", re.IGNORECASE),
    re.compile(r"tokenservice", re.IGNORECASE),
]

# Complexity score threshold for Pleno escalation to Senior.
PLENO_SCORE_THRESHOLD: float = 4.6


@dataclass(frozen=True)
class ClassificationResult:
    """Result of deterministic task classification."""

    tier: FrontendTier
    complexity_score: float
    blocks_detected: list[str]
    escalated: bool
    original_tier: FrontendTier | None = None


class TaskClassifier:
    """Deterministic task classifier for frontend tasks.

    Evaluates blocking rules in order:
    1. Check if task is blocked from Junior → escalate to Pleno or Senior.
    2. Check if task is blocked from Pleno → escalate to Senior.
    3. Compute complexity score based on heuristics.
    4. Return the appropriate tier.

    LLM-based analysis is NOT performed here — the skill entry point
    may run a supervised LLM call after deterministic classification.
    """

    @staticmethod
    def classify(task: FrontendTask) -> ClassificationResult:
        """Classify a frontend task and return the recommended tier."""
        blocks: list[str] = []
        description_lower = task.description.lower()
        title_lower = task.title.lower()
        combined_text = f"{title_lower} {description_lower}"

        # ── Phase 1: Check Junior blocks ─────────────────────────────────
        junior_blocked = False

        # Keyword blocks.
        for keyword in _JUNIOR_BLOCKED_KEYWORDS:
            if keyword in combined_text:
                blocks.append(f"keyword_block:{keyword}")
                junior_blocked = True

        # Path blocks.
        for path in task.affected_files:
            path_lower = path.lower()
            for pattern in _JUNIOR_BLOCKED_PATH_PATTERNS:
                if pattern.search(path_lower):
                    blocks.append(f"path_block:{path}")
                    junior_blocked = True
                    break
            # Specific file blocks.
            filename = path_lower.rsplit("/", maxsplit=1)[-1]
            if filename in _JUNIOR_BLOCKED_FILES:
                blocks.append(f"file_block:{path}")
                junior_blocked = True

        # Custom hook creation blocks Junior.
        if re.search(r"\bcustom\s+hook\b", combined_text):
            blocks.append("custom_hook_creation")
            junior_blocked = True

        # API client integration blocks Junior.
        if re.search(r"\b(api\s+client|api\s+integration)\b", combined_text):
            blocks.append("api_client_integration")
            junior_blocked = True

        # RN references block Junior.
        if task.rn_references:
            blocks.append(f"rn_references:{','.join(task.rn_references)}")
            junior_blocked = True

        # ── Phase 2: Check Pleno blocks ──────────────────────────────────
        pleno_blocked = False

        for keyword in _PLENO_BLOCKED_KEYWORDS:
            if keyword in combined_text:
                blocks.append(f"pleno_keyword_block:{keyword}")
                pleno_blocked = True

        for path in task.affected_files:
            path_lower = path.lower()
            for pattern in _PLENO_BLOCKED_PATH_PATTERNS:
                if pattern.search(path_lower):
                    blocks.append(f"pleno_path_block:{path}")
                    pleno_blocked = True
                    break

        # LGPD scope always escalates to Senior.
        if task.lgpd_scope:
            blocks.append("lgpd_scope")
            pleno_blocked = True

        # New domain module creation escalates to Senior.
        if re.search(r"\b(novo\s+m[oó]dulo|new\s+module)\b", combined_text):
            blocks.append("new_module_creation")
            pleno_blocked = True

        # Multiple route changes escalate to Senior.
        router_changes = sum(
            1
            for f in task.affected_files
            if "approuter" in f.lower() or "router" in f.lower()
        )
        if router_changes > 2:
            blocks.append(f"multiple_route_changes:{router_changes}")
            pleno_blocked = True

        # Performance optimization keywords escalate to Senior.
        perf_keywords = {"lazy loading", "code splitting", "bundle analysis", "lighthouse"}
        for kw in perf_keywords:
            if kw in combined_text:
                blocks.append(f"performance_optimization:{kw}")
                pleno_blocked = True

        # ── Phase 3: Compute complexity score ────────────────────────────
        score = TaskClassifier._compute_complexity_score(task)

        # Score threshold escalates Pleno to Senior.
        if score >= PLENO_SCORE_THRESHOLD:
            blocks.append(f"score_threshold:{score:.1f}>={PLENO_SCORE_THRESHOLD}")
            pleno_blocked = True

        # ── Phase 4: Determine tier ──────────────────────────────────────
        if pleno_blocked:
            return ClassificationResult(
                tier=FrontendTier.SENIOR,
                complexity_score=score,
                blocks_detected=blocks,
                escalated=True,
                original_tier=FrontendTier.PLENO if junior_blocked else FrontendTier.JUNIOR,
            )

        if junior_blocked:
            return ClassificationResult(
                tier=FrontendTier.PLENO,
                complexity_score=score,
                blocks_detected=blocks,
                escalated=True,
                original_tier=FrontendTier.JUNIOR,
            )

        return ClassificationResult(
            tier=FrontendTier.JUNIOR,
            complexity_score=score,
            blocks_detected=blocks,
            escalated=False,
        )

    @staticmethod
    def _compute_complexity_score(task: FrontendTask) -> float:
        """Compute a heuristic complexity score (0.0–10.0) for a frontend task.

        Scoring heuristics:
        - Base score from classification (T0=1.0, T1=3.0, T2=6.0, T3=9.0)
        - +0.5 per affected file (capped at +3.0)
        - +1.0 for LGPD scope
        - +0.5 per RN reference (capped at +2.0)
        - +0.5 for cross-layer file distribution
        """
        base_scores: dict[str, float] = {
            "T0": 1.0,
            "T1": 3.0,
            "T2": 6.0,
            "T3": 9.0,
        }
        score = base_scores.get(task.classification, 1.0)

        # File count contribution.
        file_count = len(task.affected_files)
        score += min(file_count * 0.5, 3.0)

        # LGPD contribution.
        if task.lgpd_scope:
            score += 1.0

        # RN reference contribution.
        rn_count = len(task.rn_references)
        score += min(rn_count * 0.5, 2.0)

        # Cross-layer distribution.
        layers_touched: set[str] = set()
        layer_prefixes = ("presentation/", "application/", "domain/", "infrastructure/")
        for path in task.affected_files:
            path_lower = path.lower()
            for prefix in layer_prefixes:
                if prefix in path_lower:
                    layers_touched.add(prefix)
                    break
        if len(layers_touched) > 1:
            score += 0.5 * (len(layers_touched) - 1)

        return min(score, 10.0)
