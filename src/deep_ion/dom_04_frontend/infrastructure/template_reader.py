"""TemplateReader — reads UX prototype template and extracts design tokens."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any


_DEFAULT_TEMPLATE_PATH = (
    Path(__file__).resolve().parents[4]
    / "docs"
    / "ai"
    / "templates"
    / "prototipo-screen-template.html"
)

# CSS custom property pattern: --property-name: value;
_CSS_VAR_PATTERN = re.compile(
    r"(--[\w-]+)\s*:\s*([^;]+);",
)


class TemplateReader:
    """Reads the UX prototype HTML template and extracts design tokens.

    Provides the base template and parsed tokens for injection into
    UX agent prompts (SKILL-UX-01, SKILL-UX-02).
    """

    def __init__(self, template_path: Path | None = None) -> None:
        self._path = template_path or _DEFAULT_TEMPLATE_PATH
        self._content: str | None = None
        self._tokens: dict[str, str] | None = None

    def read_template(self) -> str:
        """Read the full HTML template content."""
        if self._content is None:
            if not self._path.exists():
                return ""
            self._content = self._path.read_text(encoding="utf-8")
        return self._content

    def extract_design_tokens(self) -> dict[str, str]:
        """Parse CSS custom properties from the :root block of the template.

        Returns a dict mapping CSS variable names to their values.
        Example: {"--color-primary": "#6C5CE7", "--spacing-sm": "0.5rem"}
        """
        if self._tokens is not None:
            return self._tokens

        content = self.read_template()
        if not content:
            self._tokens = {}
            return self._tokens

        # Extract the :root { ... } block
        root_match = re.search(r":root\s*\{([^}]+)\}", content, re.DOTALL)
        if not root_match:
            self._tokens = {}
            return self._tokens

        root_block = root_match.group(1)
        self._tokens = {}
        for match in _CSS_VAR_PATTERN.finditer(root_block):
            prop_name = match.group(1).strip()
            prop_value = match.group(2).strip()
            self._tokens[prop_name] = prop_value

        return self._tokens

    def build_ux_context(
        self,
        blueprint_context: str,
        shared_ux_context: str = "",
    ) -> str:
        """Build the complete UX context for prompt injection.

        Combines:
        1. Shared UX context (ux_context_v1.txt)
        2. Design tokens from the HTML template
        3. Blueprint context from BlueprintReader

        Args:
            blueprint_context: Output of BlueprintReader.build_context_for_tier("SENIOR").
            shared_ux_context: Content of ux_context_v1.txt shared prompt.
        """
        tokens = self.extract_design_tokens()
        sections: list[str] = []

        if shared_ux_context:
            sections.append(shared_ux_context)

        if tokens:
            token_lines = [f"  {name}: {value}" for name, value in sorted(tokens.items())]
            sections.append(f"## Design Tokens (from template)\n\n" + "\n".join(token_lines))

        if blueprint_context:
            sections.append(f"## Blueprint Context\n\n{blueprint_context}")

        return "\n\n---\n\n".join(sections)

    def get_template_components(self) -> list[str]:
        """Extract available component class names from the template.

        Scans for CSS class definitions that represent reusable components.
        """
        content = self.read_template()
        if not content:
            return []

        # Find CSS class definitions (e.g., .card { ... }, .badge { ... })
        class_pattern = re.compile(r"\.([\w-]+)\s*\{")
        classes = class_pattern.findall(content)

        # Filter out utility/state classes, keep component-like names
        component_prefixes = {"card", "badge", "avatar", "btn", "modal", "toast", "form", "nav", "fab", "section", "header"}
        components = sorted(set(
            cls for cls in classes
            if any(cls.startswith(prefix) or cls == prefix for prefix in component_prefixes)
        ))
        return components
