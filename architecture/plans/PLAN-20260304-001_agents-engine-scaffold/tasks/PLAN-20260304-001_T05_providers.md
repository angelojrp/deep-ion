---
plan_id: PLAN-20260304-001
task_id: T05
title: "Implementar camada providers/ (Protocol + Factory + stubs)"
agent: DOM-04
model: GPT-5.1-Codex
status: PENDENTE
depends_on: [T03]
parallel_with: [T04, T06, T07]
---

## Tarefa T05 — `providers/`

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-5.1-Codex` — padrão Protocol + factory com import dinâmico requer raciocínio avançado  
**Depende de:** T03 (estrutura de pacotes)  
**Paralelo com:** T04, T06, T07

---

### Objetivo

Implementar a camada de abstração de LLM providers: `LLMProvider` Protocol, `ProviderFactory` com seleção dinâmica via env var `AI_PROVIDER`, e stubs dos três providers com retry via `tenacity`.

---

### Especificação Técnica

#### `providers/protocol.py`

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class LLMProvider(Protocol):
    def complete(self, prompt: str, model: str) -> str: ...
```

#### `providers/factory.py`

```python
# Seleção dinâmica por AI_PROVIDER env var
# Ordem de fallback: copilot → openai → anthropic → deterministic
# Import por nome de módulo (importlib.import_module)
# Lança LLMProviderError se provider desconhecido
class ProviderFactory:
    def create(self, settings: Settings) -> LLMProvider: ...
```

#### `providers/copilot_provider.py`

```python
# Endpoint: https://models.inference.ai.azure.com
# SDK: azure-ai-inference (extra opcional)
# Retry: tenacity, 3 tentativas, wait_random_exponential, retry on 429 e 5xx
# Lança LLMProviderError em falha após retries
class CopilotProvider:
    def complete(self, prompt: str, model: str) -> str: ...
```

#### `providers/openai_provider.py` e `providers/anthropic_provider.py`

- Mesma estrutura do `CopilotProvider`
- Cada um usa seu SDK correspondente (extra opcional)
- Mesma política de retry via `tenacity`
- Log via `structlog` em cada retry

---

### Regras Obrigatórias

- Provider SDKs (`anthropic`, `openai`, `azure-ai-inference`) devem ser importados dentro do método/função, não no nível do módulo, para suportar import sem o SDK instalado
- `ProviderFactory` não deve ter dependência direta em nenhum SDK — apenas `LLMProvider` Protocol
- Retry policy centralizada em `providers/_retry.py` (evitar duplicação)

---

### Artefatos de Saída

- `agents-engine/src/deep_ion/agents_engine/providers/protocol.py` — `LLMProvider` Protocol
- `agents-engine/src/deep_ion/agents_engine/providers/factory.py` — `ProviderFactory`
- `agents-engine/src/deep_ion/agents_engine/providers/copilot_provider.py` — `CopilotProvider`
- `agents-engine/src/deep_ion/agents_engine/providers/openai_provider.py` — `OpenAIProvider`
- `agents-engine/src/deep_ion/agents_engine/providers/anthropic_provider.py` — `AnthropicProvider`
- `agents-engine/src/deep_ion/agents_engine/providers/__init__.py` — exporta `LLMProvider`, `ProviderFactory`

---

### Critérios de Aceite

- `uv run mypy src/ --strict` passa (executado de dentro de `agents-engine/`)
- `isinstance(CopilotProvider(...), LLMProvider)` retorna `True` (runtime_checkable)
- `ProviderFactory().create(settings)` retorna o provider correto dado `settings.ai_provider`
- Testes `test_provider_factory.py` cobrem: seleção por env var, fallback order, import dinâmico (T09)
