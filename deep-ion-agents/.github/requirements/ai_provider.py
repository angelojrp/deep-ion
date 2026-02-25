from __future__ import annotations

import json
import os
from typing import Optional
from urllib import request


def call_llm(prompt: str, fallback: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_PROVIDER_API_KEY")
    model = os.getenv("AI_PROVIDER_MODEL", "gpt-4o-mini")
    base_url = os.getenv("AI_PROVIDER_URL", "https://api.openai.com/v1/chat/completions")

    if not api_key:
        return fallback

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Você é um analista de requisitos de software focado em precisão."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
    }

    data = json.dumps(payload).encode("utf-8")
    req = request.Request(base_url, method="POST", data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")

    try:
        with request.urlopen(req, timeout=60) as resp:
            response = json.loads(resp.read().decode("utf-8"))
            return response["choices"][0]["message"]["content"]
    except Exception:
        return fallback


def load_prompt_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as file_obj:
        return file_obj.read()
