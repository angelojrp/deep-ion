---
plan_id: PLAN-20260304-001
task_id: T01
title: "Criar pyproject.toml com todas as seções obrigatórias"
agent: DOM-04
model: GPT-5.1-Codex
status: PENDENTE
depends_on: []
parallel_with: [T02, T03]
---

## Tarefa T01 — `pyproject.toml`

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-5.1-Codex` — geração de config multi-seção com regras precisas de versão e flags  
**Depende de:** —  
**Paralelo com:** T02, T03

---

### Objetivo

Criar o arquivo `agents-engine/pyproject.toml` como **única fonte de verdade** de configuração do projeto Python, cobrindo gerenciamento de dependências (`uv`), lint (`ruff`), typecheck (`mypy --strict`), testes (`pytest`) e análise de segurança (`bandit`). Todos os caminhos relativos dentro do arquivo (`src/`, `tests/`) são relativos a `agents-engine/`.

---

### Contexto de Blueprint

Blueprint de referência: `architecture/blueprints/python-agent-first.yaml` v1.1.0  
Pacote base: `deep_ion` | Módulo alvo: `deep_ion.agents_engine`

---

### Especificação Técnica

```toml
[project]
name = "deep-ion-agents"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "pydantic>=2.0",
  "pydantic-settings",
  "structlog",
  "httpx",
  "typer",
  "tenacity",
]

[project.optional-dependencies]
# Provider SDKs são OPCIONAIS — não forçar instalação em ambientes single-provider
anthropic = ["anthropic"]
openai    = ["openai"]
copilot   = ["azure-ai-inference"]

[dependency-groups.dev]
# pytest, pytest-cov, pytest-mock, pytest-httpx, respx, anyio
# mypy, ruff, pre-commit, bandit[toml]
# types-requests

[project.scripts]
# Stubs para futuros agentes — vazio no scaffold inicial
# skill-disc-00 = "deep_ion.discovery.skill_disc_00:main"

[tool.ruff]
line-length = 120
select = ["E","F","I","N","B","UP","PTH","T20","TID252","SIM","C90","ANN","S"]

[tool.mypy]
strict = true
warn_return_any = true
disallow_any_explicit = true

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
markers = [
  "unit: Fast unit tests, no I/O",
  "integration: Integration tests with mocked external services",
  "e2e: End-to-end tests requiring live GitHub token",
]
addopts = "--cov=src --cov-branch --cov-fail-under=80 --cov-report=term-missing"

[tool.bandit]
targets = ["src"]
severity = "medium"
```

---

### Riscos Específicos

- **R0** — O diretório `agents-engine/` deve existir antes de criar o arquivo. Criá-lo se necessário (ver T03 ou pré-condição do plano).
- **R1** — Verificar se já há `agents-engine/pyproject.toml` antes de criar. Não confundir com `pyproject.toml` de outros módulos na raiz do workspace.
- **R4** — Provider SDKs (`anthropic`, `openai`, `azure-ai-inference`) **devem** ser `[project.optional-dependencies]`, nunca `dependencies` obrigatórias.
- **R5** — Após criar o arquivo, executar `uv lock` de dentro de `agents-engine/` e commitar o `uv.lock` gerado.

---

### Artefatos de Saída

- `agents-engine/pyproject.toml` — configuração completa do projeto
- `agents-engine/uv.lock` — gerado via `uv lock` após criar `pyproject.toml` (executar de dentro de `agents-engine/`)

- `pyproject.toml` na raiz do workspace
- `uv.lock` gerado por `uv lock` (commitar junto)

---

### Critérios de Aceite

- `uv sync` executa sem erros
- `uv run ruff check src/` passa sem erros
- `uv run mypy src/ --strict` passa
- Todas as seções obrigatórias presentes: `[project]`, `[dependency-groups.dev]`, `[tool.ruff]`, `[tool.mypy]`, `[tool.pytest.ini_options]`, `[tool.bandit]`
