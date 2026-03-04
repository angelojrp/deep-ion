"""LLMProvider — Protocol for LLM provider abstraction."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class LLMResponse:
    """Structured response from an LLM call."""

    content: str
    model: str
    output_tokens: int
    input_tokens: int
    finish_reason: str = "stop"


class LLMProvider(Protocol):
    """Protocol for LLM provider implementations.

    Uses ``typing.Protocol`` instead of ABC per blueprint convention.
    """

    def call(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float = 0.1,
    ) -> LLMResponse:
        """Send a prompt to the LLM and return the response."""
        ...

    @property
    def provider_name(self) -> str:
        """Return the provider identifier (e.g. 'copilot', 'openai')."""
        ...
