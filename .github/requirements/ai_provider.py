from __future__ import annotations

import json
import os
from urllib import request

# ---------------------------------------------------------------------------
# Provider resolution (priority order):
#   1. GitHub Copilot via Models API  (GITHUB_TOKEN — always available in CI)
#   2. External OpenAI-compatible key (OPENAI_API_KEY / AI_PROVIDER_API_KEY)
#   3. Deterministic local fallback   (no LLM inference)
# ---------------------------------------------------------------------------

_COPILOT_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions"
_COPILOT_MODEL    = "gpt-4o"

_SYSTEM_PROMPT = "Você é um analista de requisitos de software focado em precisão."


def _resolve_provider() -> str:
    """Return the active provider identifier."""
    explicit = os.getenv("AI_PROVIDER", "").lower()
    if explicit:
        return explicit
    if os.getenv("GITHUB_TOKEN"):
        return "copilot"
    if os.getenv("OPENAI_API_KEY") or os.getenv("AI_PROVIDER_API_KEY"):
        return "openai"
    return "none"


def _call_copilot(prompt: str) -> str:
    token = os.getenv("GITHUB_TOKEN", "")
    if not token:
        raise RuntimeError("GITHUB_TOKEN ausente")

    model = os.getenv("AI_PROVIDER_MODEL", _COPILOT_MODEL)
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        "temperature": 0.1,
    }).encode("utf-8")

    req = request.Request(_COPILOT_ENDPOINT, method="POST", data=payload)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {token}")

    with request.urlopen(req, timeout=60) as resp:
        response = json.loads(resp.read().decode("utf-8"))
    return response["choices"][0]["message"]["content"]


def _call_openai(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_PROVIDER_API_KEY", "")
    if not api_key:
        raise RuntimeError("Nenhuma chave OpenAI configurada")

    model    = os.getenv("AI_PROVIDER_MODEL", "gpt-4o-mini")
    base_url = os.getenv("AI_PROVIDER_URL", "https://api.openai.com/v1/chat/completions")

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        "temperature": 0.1,
    }).encode("utf-8")

    req = request.Request(base_url, method="POST", data=payload)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")

    with request.urlopen(req, timeout=60) as resp:
        response = json.loads(resp.read().decode("utf-8"))
    return response["choices"][0]["message"]["content"]


def call_llm(prompt: str, fallback: str) -> str:
    """
    Chama o LLM ativo.  Ordem de preferência:
      copilot (GITHUB_TOKEN) → openai (OPENAI/AI_PROVIDER_API_KEY) → fallback determinístico.

    confidence_score < 0.65 deve escalar — nunca infere silenciosamente (Core Design Rule #5).
    """
    provider = _resolve_provider()

    if provider == "copilot":
        try:
            return _call_copilot(prompt)
        except Exception as exc:
            print(f"[ai_provider] Copilot falhou ({exc}), tentando OpenAI.")
            provider = "openai"  # fall through

    if provider == "openai":
        try:
            return _call_openai(prompt)
        except Exception as exc:
            print(f"[ai_provider] OpenAI falhou ({exc}), usando fallback determinístico.")

    return fallback


def load_prompt_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as file_obj:
        return file_obj.read()
