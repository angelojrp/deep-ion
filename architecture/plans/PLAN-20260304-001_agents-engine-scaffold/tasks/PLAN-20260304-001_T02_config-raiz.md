---
plan_id: PLAN-20260304-001
task_id: T02
title: "Criar arquivos de configuração raiz"
agent: DOM-04
model: GPT-4o
status: PENDENTE
depends_on: []
parallel_with: [T01, T03]
---

## Tarefa T02 — Arquivos de configuração raiz

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-4o` — geração de texto estruturado simples, sem lógica complexa  
**Depende de:** —  
**Paralelo com:** T01, T03

---

### Objetivo

Criar os três arquivos de tooling do projeto no diretório `agents-engine/`: `agents-engine/.python-version`, `agents-engine/justfile` e `agents-engine/.pre-commit-config.yaml`.

---

### Artefatos de Saída

| Arquivo | Descrição |
|---|---|
| `agents-engine/.python-version` | Versão exata do Python para `uv` e `pyenv` |
| `agents-engine/justfile` | Receitas de automação local (lint, test, ci) |
| `agents-engine/.pre-commit-config.yaml` | Hooks de qualidade com SHAs pinados |

---

### Especificação Técnica

#### `.python-version`
```
3.12.x   ← substituir pela patch version disponível no ambiente (ex: 3.12.9)
```
> **Atenção:** especificar a patch version completa, não apenas `3.12`. Consultar `uv python list` para identificar a versão disponível.

#### `justfile`
Receitas obrigatórias:
```makefile
# justfile
lint:
    uv run ruff check src/ tests/
    uv run mypy src/ --strict

format:
    uv run ruff format src/ tests/

security:
    uv run bandit -r src/ -ll

test:
    uv run pytest -m 'not e2e'

test-all:
    uv run pytest

ci: lint security test

pre-commit:
    uv run pre-commit run --all-files
```

#### `.pre-commit-config.yaml`
```yaml
# Todos os hooks devem ser pinados por commit SHA (não por tag)
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: <SHA>  # buscar SHA atual na página de releases
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: <SHA>
    hooks:
      - id: mypy
        args: [--strict]
        additional_dependencies: [pydantic, pydantic-settings]
  - repo: https://github.com/PyCQA/bandit
    rev: <SHA>
    hooks:
      - id: bandit
        args: ["-r", "src/", "-ll"]
```

---

### Riscos Específicos

- **R2** — `.python-version` deve conter a patch version exata (ex: `3.12.9`). O executor deve verificar com `uv python list`.
- **R3** — Todos os hooks do `.pre-commit-config.yaml` devem ser pinados com SHA de commit, não por tag semântica.

---

### Critérios de Aceite

- `just lint` executa sem erros após T01 (pyproject.toml) estar presente
- `pre-commit run --all-files` passa (requer T01 + T03 concluídos para ter arquivos `.py` a validar)
- `.python-version` contém patch version completa
