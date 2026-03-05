---
plan_id: PLAN-20260304-001
task_id: T04
title: "Implementar exceptions.py e settings.py"
agent: DOM-04
model: GPT-5.1-Codex
status: PENDENTE
depends_on: [T03]
parallel_with: [T05, T06, T07]
---

## Tarefa T04 — `exceptions.py` + `settings.py`

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-5.1-Codex` — requer anotações de tipo precisas e conformidade Pydantic v2  
**Depende de:** T03 (estrutura de pacotes)  
**Paralelo com:** T05, T06, T07

---

### Objetivo

Implementar as exceções base do pacote e o modelo de configuração via `pydantic-settings`, com `SecretStr` para credenciais.

---

### Especificação Técnica

#### `src/deep_ion/agents_engine/exceptions.py`

```python
# Hierarquia de exceções
class AgentsEngineError(Exception):
    """Base para todos os erros do pacote agents_engine."""

class LLMProviderError(AgentsEngineError):
    """Falha ao chamar o provider LLM (timeout, 5xx, auth)."""

class GitHubAPIError(AgentsEngineError):
    """Falha na API do GitHub. Inclui status_code."""
    def __init__(self, message: str, status_code: int) -> None: ...

class ConfidenceError(AgentsEngineError):
    """Score de confiança abaixo do threshold sem mecanismo de escalação."""
```

#### `src/deep_ion/agents_engine/settings.py`

```python
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ai_provider: str = "copilot"          # copilot | openai | anthropic
    ai_provider_api_key: SecretStr = SecretStr("")
    github_token: SecretStr               # obrigatório
    log_level: str = "INFO"
    github_repo: str                      # ex: "org/repo"
```

**Regras obrigatórias:**
- Toda credencial como `pydantic.SecretStr` — nunca `str` puro
- `extra="ignore"` para não quebrar se o ambiente tiver variáveis extras
- `Settings` deve ser instânciável sem argumentos em ambiente de teste (via `.env` mock)
- Logging via `structlog` — nunca `logging` da stdlib

---

### Artefatos de Saída

- `agents-engine/src/deep_ion/agents_engine/exceptions.py` — implementado
- `agents-engine/src/deep_ion/agents_engine/settings.py` — implementado

---

### Critérios de Aceite

- `uv run mypy src/ --strict` passa (executado de dentro de `agents-engine/`)
- `from deep_ion.agents_engine import AgentsEngineError, Settings` funciona
- `Settings(github_token="x", github_repo="a/b")` instância sem error
- Testes cobrindo hierarquia de exceções criados em T09
