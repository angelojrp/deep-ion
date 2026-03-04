"""BlueprintReader — reads frontend-react-spa.yaml and injects context for LLM."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

import yaml  # type: ignore[import-untyped]


_DEFAULT_BLUEPRINT_PATH = Path(__file__).resolve().parents[4] / "architecture" / "blueprints" / "frontend-react-spa.yaml"


class BlueprintReader:
    """Reads and parses the frontend blueprint YAML for LLM context injection.

    Provides section-level extraction so each skill can inject only the
    relevant portions of the blueprint into the LLM prompt.
    """

    def __init__(self, blueprint_path: Path | None = None) -> None:
        self._path = blueprint_path or _DEFAULT_BLUEPRINT_PATH
        self._data: dict[str, Any] | None = None

    def load(self) -> dict[str, Any]:
        """Load and parse the blueprint YAML file."""
        if self._data is None:
            content = self._path.read_text(encoding="utf-8")
            self._data = yaml.safe_load(content) or {}
        return self._data

    @property
    def hash(self) -> str:
        """Return SHA-256 hash of the blueprint file for version tracking."""
        content = self._path.read_bytes()
        return hashlib.sha256(content).hexdigest()

    def get_conventions(self) -> dict[str, Any]:
        """Extract the architecture.conventions section."""
        data = self.load()
        return data.get("architecture", {}).get("conventions", {})

    def get_layers(self) -> dict[str, Any]:
        """Extract the architecture.layers section."""
        data = self.load()
        return data.get("architecture", {}).get("layers", {})

    def get_project_structure(self) -> dict[str, Any]:
        """Extract the architecture.project_structure section."""
        data = self.load()
        return data.get("architecture", {}).get("project_structure", {})

    def get_llm_behavior(self) -> dict[str, Any]:
        """Extract the llm_behavior section."""
        data = self.load()
        return data.get("llm_behavior", {})

    def get_layer_rules(self, layer_name: str) -> dict[str, Any]:
        """Extract rules for a specific layer (presentation, application, domain, infrastructure)."""
        layers = self.get_layers()
        return layers.get(layer_name, {})

    def build_context_for_tier(self, tier_name: str) -> str:
        """Build a condensed blueprint context string for the given tier.

        - Junior: only presentation layer + conventions
        - Pleno: presentation + application layers + conventions
        - Senior: full blueprint
        """
        data = self.load()
        conventions = self.get_conventions()
        layers = self.get_layers()
        sections: list[str] = []

        sections.append(f"# Blueprint: {data.get('blueprintName', 'unknown')}")
        sections.append(f"## Conventions\n{yaml.dump(conventions, default_flow_style=False)}")

        if tier_name == "JUNIOR":
            if "presentation" in layers:
                sections.append(f"## Layer: presentation\n{yaml.dump(layers['presentation'], default_flow_style=False)}")
        elif tier_name == "PLENO":
            for layer in ("presentation", "application"):
                if layer in layers:
                    sections.append(f"## Layer: {layer}\n{yaml.dump(layers[layer], default_flow_style=False)}")
        else:
            # Senior: full blueprint.
            for layer_name_key, layer_data in layers.items():
                sections.append(f"## Layer: {layer_name_key}\n{yaml.dump(layer_data, default_flow_style=False)}")

            structure = self.get_project_structure()
            if structure:
                sections.append(f"## Project Structure\n{yaml.dump(structure, default_flow_style=False)}")

        return "\n\n".join(sections)
