"""CodeGenerationResult — immutable domain model for LLM code generation output."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GeneratedFile(BaseModel, frozen=True):
    """A single file produced by code generation."""

    path: str = Field(description="Relative file path within the frontend project.")
    content: str = Field(description="Full file content (TypeScript / test / config).")
    is_test: bool = Field(default=False, description="Whether this is a test file.")


class CodeGenerationResult(BaseModel, frozen=True):
    """Immutable result of an LLM code generation call.

    Contains generated files and metadata for the audit ledger.
    """

    files: list[GeneratedFile] = Field(
        default_factory=list,
        description="List of generated files.",
    )
    model_used: str = Field(description="LLM model identifier actually used.")
    output_tokens_used: int = Field(
        default=0,
        description="Number of output tokens consumed by the LLM call.",
    )
    prompt_version: str = Field(
        default="v1",
        description="Version tag of the prompt template used.",
    )
    blueprint_hash: str = Field(
        default="",
        description="SHA-256 hash of the blueprint file injected as context.",
    )
    raw_response: str = Field(
        default="",
        description="Raw LLM response before strip_prose processing.",
    )
