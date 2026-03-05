---
plan_id: PLAN-20260304-001
task_id: T10
title: "Criar .github/workflows/ci.yml"
agent: DOM-04
model: GPT-4o
status: PENDENTE
depends_on: [T01]
parallel_with: [T09]
---

## Tarefa T10 — `.github/workflows/ci.yml`

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-4o` — template de workflow YAML com lógica simples; padrão já definido no blueprint  
**Depende de:** T01 (`pyproject.toml` e `.python-version` devem existir)  
**Paralelo com:** T09

---

### Objetivo

Criar o workflow de CI que executa lint, typecheck, análise de segurança e testes a cada push/PR, usando `astral-sh/setup-uv` com SHA pinado.

---

### Especificação Técnica

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

permissions:
  contents: read        # permissões mínimas — nunca usar permissões mais amplas

jobs:
  ci:
    name: Lint, Typecheck, Security, Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: agents-engine   # todos os steps executam dentro de agents-engine/
    steps:
      - name: Checkout
        uses: actions/checkout@<COMMIT_SHA>       # pinado por SHA, não por tag

      - name: Setup uv
        uses: astral-sh/setup-uv@<COMMIT_SHA>    # pinado por SHA
        with:
          python-version-file: agents-engine/.python-version
          enable-cache: true

      - name: Install dependencies
        run: uv sync --all-extras

      - name: Lint (ruff)
        run: uv run ruff check src/ tests/

      - name: Typecheck (mypy --strict)
        run: uv run mypy src/ --strict

      - name: Security (bandit)
        run: uv run bandit -r src/ -ll

      - name: Test (not e2e)
        run: uv run pytest -m 'not e2e'
```

> **Nota:** `python-version-file` usa caminho relativo à raiz do repositório (sem `working-directory`). Todos os `run:` steps já executam em `agents-engine/` via `defaults.run.working-directory`.

---

### Regras Obrigatórias

- **Toda action deve ser pinada por commit SHA** — nunca por tag semântica (ex: `v4`, `latest`)
- `permissions: contents: read` — princípio do menor privilégio
- `uv sync --all-extras` para garantir que os provider SDKs opcionais sejam instalados no CI
- Testes com `-m 'not e2e'` — testes E2E (que requerem token GitHub real) não rodam no CI padrão
- Não expor `AI_API_KEY` ou `GITHUB_TOKEN` em logs — `structlog` já redacta `SecretStr`

---

### Como Obter os SHAs

O executor deve buscar os SHAs atuais antes de criar o arquivo:
- `actions/checkout`: https://github.com/actions/checkout/releases
- `astral-sh/setup-uv`: https://github.com/astral-sh/setup-uv/releases

Formato do SHA: `uses: actions/checkout@<40-char-sha>`

---

### Artefatos de Saída

- `.github/workflows/ci.yml` — workflow completo com SHAs pinados e `working-directory: agents-engine`

---

### Critérios de Aceite

- Todas as actions pinadas com SHA de 40 caracteres
- `permissions: contents: read` presente no job
- `defaults.run.working-directory: agents-engine` presente no job
- `python-version-file: agents-engine/.python-version` na action `setup-uv`
- Steps na ordem correta: checkout → setup-uv → install → lint → typecheck → security → test
- Workflow disparado por `push` em `main`/`develop` e por `pull_request`
- `uv run pytest -m 'not e2e'` (nunca `pytest` nu sem `uv run`)
