"""OutputPolicy — Non-Verbose output enforcement (NV-01..NV-06).

Strips all prose from LLM responses, keeping only fenced code blocks.
Tracks ``output_tokens_used`` for cost auditability.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class OutputMode(str, Enum):
    """LLM output mode — only execution_only is permitted for frontend agents."""

    EXECUTION_ONLY = "execution_only"


class OutputPolicyViolation(Exception):
    """Raised when LLM output contains no valid code blocks after stripping prose."""

    def __init__(self, reason: str) -> None:
        self.reason = reason
        super().__init__(f"OutputPolicy violation: {reason}")


# Regex that captures fenced code blocks: ```<optional lang>\n<content>\n```
_CODE_FENCE_PATTERN = re.compile(
    r"```[^\n]*\n(.*?)```",
    re.DOTALL,
)


@dataclass(frozen=True)
class StrippedOutput:
    """Result of ``strip_prose`` — contains only extracted code blocks."""

    code_blocks: list[CodeBlock]
    original_length: int
    stripped_length: int
    prose_removed: bool


@dataclass(frozen=True)
class CodeBlock:
    """A single code block extracted from LLM response."""

    language: str
    content: str
    file_path: str


# Pattern to extract language and optional file path from fence opener.
# Supports: ```typescript path/to/File.tsx  or  ```tsx  or  ```
# Uses [ \t]* instead of \s* to avoid matching across newlines.
_FENCE_OPENER_PATTERN = re.compile(
    r"```(\w+)?[ \t]*([\w./-]+)?",
)

# Full fenced-block pattern: matches opening ```, optional lang + path on the
# same line, a newline, then lazily captures content until the closing ```.
_CODE_BLOCK_PATTERN = re.compile(
    r"```(\w+)?[ \t]*([\w./-]*)?\n(.*?)```",
    re.DOTALL,
)


class OutputPolicy:
    """Enforces Non-Verbose output rules NV-01 through NV-06.

    All frontend agents must call ``strip_prose`` on every LLM response
    before committing any code. If the result contains zero code blocks,
    the skill must abort with a ``decision = "block"`` in the DecisionRecord.
    """

    MODE: OutputMode = OutputMode.EXECUTION_ONLY

    SYSTEM_INSTRUCTION: str = (
        "Respond with code blocks only. "
        "No explanations. No prose. No markdown outside of code fences."
    )

    @staticmethod
    def strip_prose(llm_response: str) -> StrippedOutput:
        """Remove all text outside fenced code blocks.

        Returns a ``StrippedOutput`` with the extracted code blocks.
        Raises ``OutputPolicyViolation`` if zero code blocks remain.
        """
        original_length = len(llm_response)

        blocks: list[CodeBlock] = []
        for match in _CODE_BLOCK_PATTERN.finditer(llm_response):
            language = match.group(1) or ""
            file_path = match.group(2) or ""
            content = match.group(3).strip("\n")

            if content:
                blocks.append(
                    CodeBlock(
                        language=language,
                        content=content,
                        file_path=file_path,
                    ),
                )

        stripped_content = "\n".join(block.content for block in blocks)
        stripped_length = len(stripped_content)
        prose_removed = stripped_length < original_length

        if not blocks:
            raise OutputPolicyViolation(
                reason=(
                    "LLM response contained zero code blocks after strip_prose. "
                    "Raw response length: {original_length} chars. "
                    "The skill must abort and record decision='block' in the DecisionRecord."
                ),
            )

        return StrippedOutput(
            code_blocks=blocks,
            original_length=original_length,
            stripped_length=stripped_length,
            prose_removed=prose_removed,
        )

    @staticmethod
    def validate_no_prose_comments(code: str) -> list[str]:
        """Check for explanatory comments that violate NV-03.

        Returns a list of violation descriptions (empty if clean).
        NV-03 allows only semantically necessary comments (e.g. ``// RN-01``).
        """
        violations: list[str] = []
        explanatory_patterns = [
            re.compile(r"//\s*This (function|component|hook|method)", re.IGNORECASE),
            re.compile(r"//\s*Here we", re.IGNORECASE),
            re.compile(r"//\s*The following", re.IGNORECASE),
            re.compile(r"//\s*We need to", re.IGNORECASE),
            re.compile(r"//\s*This is (a|the|used)", re.IGNORECASE),
            re.compile(r"/\*\*?\s*This (function|component|hook|method)", re.IGNORECASE),
        ]

        for i, line in enumerate(code.splitlines(), start=1):
            stripped = line.strip()
            for pattern in explanatory_patterns:
                if pattern.search(stripped):
                    violations.append(
                        f"Line {i}: Explanatory comment violates NV-03: '{stripped[:80]}'",
                    )
                    break

        return violations

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Rough token count estimate (4 chars ≈ 1 token)."""
        return max(1, len(text) // 4)
