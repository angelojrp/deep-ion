---
plan_id: PLAN-20260304-001
task_id: T03
title: "Criar estrutura de diretórios e __init__.py de todos os pacotes"
agent: DOM-04
model: GPT-4o
status: PENDENTE
depends_on: []
parallel_with: [T01, T02]
---

## Tarefa T03 — Estrutura de diretórios e pacotes

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-4o` — tarefa repetitiva e determinística, sem lógica de negócio  
**Depende de:** —  
**Paralelo com:** T01, T02

---

### Objetivo

Criar o diretório `agents-engine/` na raiz do workspace e toda a estrutura de subdiretórios e arquivos `__init__.py` com `__all__` declarados para os pacotes `agents-engine/src/deep_ion/`, `agents-engine/src/deep_ion/agents_engine/` e todos os sub-pacotes, espelhando em `agents-engine/tests/`.

---

### Estrutura Completa a Criar

```
agents-engine/
  src/
    deep_ion/
      __init__.py           ← __all__ = ["agents_engine"]
      agents_engine/
        __init__.py         ← exporta os símbolos públicos do módulo
        exceptions.py       ← stub vazio (implementado em T04)
        settings.py         ← stub vazio (implementado em T04)
        providers/
          __init__.py
          protocol.py       ← stub vazio (implementado em T05)
          factory.py        ← stub vazio (implementado em T05)
          copilot_provider.py
          openai_provider.py
          anthropic_provider.py
        domain/
          __init__.py
          models.py         ← stub vazio (implementado em T07)
          protocols.py      ← stub vazio (implementado em T07)
        infrastructure/
          __init__.py
          github_client.py  ← stub vazio (implementado em T06)
          issue_reader.py
          comment_publisher.py
          label_manager.py
        audit/
          __init__.py
          decision_record.py ← stub vazio (implementado em T08)
          audit_ledger.py    ← stub vazio (implementado em T08)
  tests/
    __init__.py
    conftest.py             ← stub vazio (implementado em T09)
    unit/
      __init__.py
      agents_engine/
        __init__.py
        test_decision_record.py   ← stub vazio
        test_audit_ledger.py      ← stub vazio
        test_provider_factory.py  ← stub vazio
        test_exceptions.py        ← stub vazio
    integration/
      __init__.py
      agents_engine/
        __init__.py
        test_github_client.py     ← stub vazio
        test_comment_publisher.py ← stub vazio
```

---

### Regras para `__init__.py`

- Todos os `__init__.py` de pacote **devem** declarar `__all__`
- `src/deep_ion/__init__.py`: `__all__ = ["agents_engine"]`
- `src/deep_ion/agents_engine/__init__.py`: exportar `exceptions`, `settings`, `providers`, `domain`, `infrastructure`, `audit`
- Sub-pacotes: exportar os símbolos públicos relevantes (ex: `providers/__init__.py` → `LLMProvider`, `ProviderFactory`)
- Stubs de implementação podem ter apenas `# TODO: implementar em T0X`

---

### Artefatos de Saída

- Toda a árvore de diretórios criada
- Todos os `__init__.py` com `__all__` corretos
- Arquivos `.py` stub com comentário indicando a tarefa de implementação

---

### Critérios de Aceite

- `python -c "import deep_ion.agents_engine"` executa sem erros (executado de dentro de `agents-engine/`)
- Todos os `__init__.py` possuem `__all__`
- `uv run mypy src/ --strict` passa de dentro de `agents-engine/` (arquivos stub podem ser vazios mas não podem ter erros de tipo)
