from typing import Protocol, runtime_checkable


@runtime_checkable
class LLMProvider(Protocol):
	def complete(self, prompt: str, model: str) -> str:
		...


__all__ = ["LLMProvider"]