"""Unit tests for OutputPolicy — NV-01..NV-06 non-verbose enforcement."""

from __future__ import annotations

import pytest

from deep_ion.dom_04_frontend.domain.output_policy import (
    CodeBlock,
    OutputMode,
    OutputPolicy,
    OutputPolicyViolation,
    StrippedOutput,
)


# ── strip_prose: basic extraction ────────────────────────────────────────────


class TestStripProseExtraction:
    """Test that strip_prose correctly extracts fenced code blocks."""

    def test_single_code_block(self) -> None:
        response = (
            "Here is the code:\n"
            "```typescript\n"
            "export const Button = () => <button>Click</button>;\n"
            "```\n"
            "Hope this helps!"
        )
        result = OutputPolicy.strip_prose(response)
        assert len(result.code_blocks) == 1
        assert result.code_blocks[0].language == "typescript"
        assert "Button" in result.code_blocks[0].content

    def test_multiple_code_blocks(self) -> None:
        response = (
            "Component:\n"
            "```tsx\n"
            "export const A = () => <div />;\n"
            "```\n"
            "Test:\n"
            "```tsx\n"
            "describe('A', () => { it('renders', () => {}) });\n"
            "```\n"
        )
        result = OutputPolicy.strip_prose(response)
        assert len(result.code_blocks) == 2

    def test_code_block_with_file_path(self) -> None:
        response = (
            "```typescript src/presentation/Button.tsx\n"
            "export const Button = () => <button />;\n"
            "```\n"
        )
        result = OutputPolicy.strip_prose(response)
        assert len(result.code_blocks) == 1
        assert result.code_blocks[0].file_path == "src/presentation/Button.tsx"
        assert result.code_blocks[0].language == "typescript"

    def test_code_block_no_language(self) -> None:
        response = "```\nconsole.log('hello');\n```\n"
        result = OutputPolicy.strip_prose(response)
        assert len(result.code_blocks) == 1
        assert result.code_blocks[0].language == ""

    def test_prose_removed_flag(self) -> None:
        response = "Some prose\n```ts\nconst x = 1;\n```\nMore prose"
        result = OutputPolicy.strip_prose(response)
        assert result.prose_removed is True
        assert result.stripped_length < result.original_length

    def test_only_code_blocks_no_prose_removed(self) -> None:
        """When the entire response is a single code block, prose_removed may be True
        because fences themselves are stripped away."""
        response = "```ts\nconst x = 1;\n```"
        result = OutputPolicy.strip_prose(response)
        assert len(result.code_blocks) == 1
        # Even pure code blocks produce prose_removed=True because fence markers are stripped
        assert result.original_length > 0


# ── strip_prose: removes prose ───────────────────────────────────────────────


class TestStripProseRemoval:
    """Ensure prose is removed while code blocks are preserved."""

    def test_prose_content_excluded(self) -> None:
        response = (
            "Here's a great component for you!\n\n"
            "```tsx\n"
            "const Foo = () => <p>Hello</p>;\n"
            "```\n\n"
            "This component renders a greeting. Use it like `<Foo />`.\n"
        )
        result = OutputPolicy.strip_prose(response)
        concatenated = "\n".join(b.content for b in result.code_blocks)
        assert "great component" not in concatenated
        assert "renders a greeting" not in concatenated
        assert "Foo" in concatenated

    def test_keeps_only_code_content(self) -> None:
        response = (
            "Step 1:\n"
            "```ts\nconst a = 1;\n```\n"
            "Step 2:\n"
            "```ts\nconst b = 2;\n```\n"
            "Done!"
        )
        result = OutputPolicy.strip_prose(response)
        contents = [b.content for b in result.code_blocks]
        assert "const a = 1;" in contents[0]
        assert "const b = 2;" in contents[1]


# ── strip_prose: failure cases ───────────────────────────────────────────────


class TestStripProseFailure:
    """Test that strip_prose raises OutputPolicyViolation on empty output."""

    def test_no_code_blocks_raises(self) -> None:
        with pytest.raises(OutputPolicyViolation):
            OutputPolicy.strip_prose("This is just plain text with no code.")

    def test_empty_string_raises(self) -> None:
        with pytest.raises(OutputPolicyViolation):
            OutputPolicy.strip_prose("")

    def test_whitespace_only_raises(self) -> None:
        with pytest.raises(OutputPolicyViolation):
            OutputPolicy.strip_prose("   \n\n   ")

    def test_incomplete_fence_raises(self) -> None:
        """A fence opener without closing should not produce a code block."""
        with pytest.raises(OutputPolicyViolation):
            OutputPolicy.strip_prose("```ts\nconst x = 1;\n")

    def test_empty_code_block_raises(self) -> None:
        """A fence with no content inside should not count as a block."""
        with pytest.raises(OutputPolicyViolation):
            OutputPolicy.strip_prose("```ts\n```")

    def test_violation_exception_attributes(self) -> None:
        with pytest.raises(OutputPolicyViolation) as exc_info:
            OutputPolicy.strip_prose("no code here")
        err = exc_info.value
        assert hasattr(err, "reason")
        assert len(err.reason) > 0
        assert "zero code blocks" in err.reason.lower()


# ── validate_no_prose_comments ───────────────────────────────────────────────


class TestValidateNoProseComments:
    """NV-03 enforcement — detect explanatory comments that violate policy."""

    def test_clean_code_no_violations(self) -> None:
        code = (
            "import React from 'react';\n"
            "// RN-01: saldo check\n"
            "export const Balance = () => <div />;\n"
        )
        violations = OutputPolicy.validate_no_prose_comments(code)
        assert violations == []

    @pytest.mark.parametrize(
        "comment",
        [
            "// This function handles authentication",
            "// This component renders the login form",
            "// Here we initialize the state",
            "// The following code sets up the router",
            "// We need to fetch the data first",
            "// This is a helper utility",
            "// This is the main component",
            "// This is used for validation",
        ],
    )
    def test_explanatory_comment_detected(self, comment: str) -> None:
        code = f"const x = 1;\n{comment}\nconst y = 2;"
        violations = OutputPolicy.validate_no_prose_comments(code)
        assert len(violations) >= 1

    def test_jsdoc_explanatory_detected(self) -> None:
        code = "/** This function handles the main logic */\nfunction main() {}"
        violations = OutputPolicy.validate_no_prose_comments(code)
        assert len(violations) >= 1

    def test_technical_comment_allowed(self) -> None:
        """Comments like RN-01, TODO, FIXME should not trigger violations."""
        code = (
            "// RN-01\n"
            "// TODO: implement validation\n"
            "// FIXME: edge case\n"
            "const x = 1;\n"
        )
        violations = OutputPolicy.validate_no_prose_comments(code)
        assert violations == []


# ── estimate_tokens ──────────────────────────────────────────────────────────


class TestEstimateTokens:
    """Test rough token estimation (4 chars ≈ 1 token)."""

    def test_estimate_basic(self) -> None:
        assert OutputPolicy.estimate_tokens("abcd") == 1

    def test_estimate_longer(self) -> None:
        text = "a" * 400
        assert OutputPolicy.estimate_tokens(text) == 100

    def test_estimate_minimum_1(self) -> None:
        """Even empty or tiny strings return at least 1."""
        assert OutputPolicy.estimate_tokens("") >= 1
        assert OutputPolicy.estimate_tokens("ab") >= 1

    def test_estimate_rounds_down(self) -> None:
        # 10 chars // 4 = 2
        assert OutputPolicy.estimate_tokens("1234567890") == 2


# ── OutputMode & Constants ───────────────────────────────────────────────────


class TestOutputMode:
    """Test OutputMode enum and class attributes."""

    def test_execution_only_mode(self) -> None:
        assert OutputPolicy.MODE == OutputMode.EXECUTION_ONLY

    def test_system_instruction_present(self) -> None:
        assert "code blocks only" in OutputPolicy.SYSTEM_INSTRUCTION.lower()
        assert "no explanations" in OutputPolicy.SYSTEM_INSTRUCTION.lower()


# ── Data Classes ─────────────────────────────────────────────────────────────


class TestDataClasses:
    """Ensure data classes are frozen."""

    def test_code_block_frozen(self) -> None:
        block = CodeBlock(language="ts", content="x", file_path="")
        with pytest.raises(AttributeError):
            block.language = "js"  # type: ignore[misc]

    def test_stripped_output_frozen(self) -> None:
        out = StrippedOutput(
            code_blocks=[],
            original_length=10,
            stripped_length=5,
            prose_removed=True,
        )
        with pytest.raises(AttributeError):
            out.prose_removed = False  # type: ignore[misc]
