---
plan_id: PLAN-20260304-001
task_id: T06
title: "Implementar infrastructure/ (GitHubClient, IssueReader, CommentPublisher, LabelManager)"
agent: DOM-04
model: GPT-5.1-Codex
status: PENDENTE
depends_on: [T03]
parallel_with: [T04, T05, T07]
---

## Tarefa T06 — `infrastructure/`

**Plano pai:** [PLAN-20260304-001](PLAN-20260304-001_agents-engine-scaffold.md)  
**Agente executor:** DOM-04  
**Modelo sugerido:** `GPT-5.1-Codex` — adapter pattern + retry + DI por Protocol; múltiplos arquivos interdependentes  
**Depende de:** T03 (estrutura de pacotes)  
**Paralelo com:** T04, T05, T07

---

### Objetivo

Implementar os adaptadores de infraestrutura para a API do GitHub usando `httpx` (sync), com retry via `tenacity` e `Settings` injetado no construtor. Todos os adaptadores devem implementar os Protocols definidos em T07 (`GitHubPort`).

---

### Especificação Técnica

#### `infrastructure/github_client.py`

```python
# Wraps httpx.Client (sync)
# Settings injetado no construtor — nunca os.getenv() diretamente
# Retry: tenacity, exponential backoff, retry em 5xx e 429
# Implementa GitHubPort (domain.protocols)
# Base URL: https://api.github.com
# Header: Authorization: Bearer {settings.github_token.get_secret_value()}
class GitHubClient:
    def __init__(self, settings: Settings) -> None: ...
    def get(self, path: str) -> dict: ...
    def post(self, path: str, body: dict) -> dict: ...
```

#### `infrastructure/issue_reader.py`

```python
# GET /repos/{owner}/{repo}/issues/{number}
class IssueReader:
    def __init__(self, client: GitHubClient) -> None: ...
    def read(self, issue_number: int) -> IssueData: ...
```

#### `infrastructure/comment_publisher.py`

```python
# POST /repos/{owner}/{repo}/issues/{number}/comments
# Implementa AuditPort (domain.protocols) — método emit()
class CommentPublisher:
    def __init__(self, client: GitHubClient, repo: str) -> None: ...
    def publish(self, issue_number: int, body: str) -> None: ...
    def emit(self, record: DecisionRecord) -> None: ...  # AuditPort
    def find_comment_by_prefix(self, issue_number: int, prefix: str) -> str | None: ...
```

#### `infrastructure/label_manager.py`

```python
# POST /repos/{owner}/{repo}/issues/{number}/labels
# DELETE /repos/{owner}/{repo}/issues/{number}/labels/{name}
class LabelManager:
    def __init__(self, client: GitHubClient, repo: str) -> None: ...
    def add(self, issue_number: int, label: str) -> None: ...
    def remove(self, issue_number: int, label: str) -> None: ...
```

---

### Regras Obrigatórias

- `Settings` sempre injetado — nunca `os.getenv()` direto nas classes de infra
- `httpx.Client` criado com `timeout=30.0` e fechado corretamente (`__enter__`/`__exit__`)
- Log via `structlog` em cada operação e retry
- `GitHubAPIError` lançada com `status_code` em qualquer resposta fora de 2xx após retries esgotados
- Nenhum import de domínio externo (sem circular imports com `audit/`)

---

### Artefatos de Saída

- `agents-engine/src/deep_ion/agents_engine/infrastructure/github_client.py`
- `agents-engine/src/deep_ion/agents_engine/infrastructure/issue_reader.py`
- `agents-engine/src/deep_ion/agents_engine/infrastructure/comment_publisher.py`
- `agents-engine/src/deep_ion/agents_engine/infrastructure/label_manager.py`
- `agents-engine/src/deep_ion/agents_engine/infrastructure/__init__.py` — atualizado com exports

---

### Critérios de Aceite

- `uv run mypy src/ --strict` passa (executado de dentro de `agents-engine/`)
- `CommentPublisher` satisfaz `isinstance(publisher, AuditPort)` (runtime_checkable)
- Testes `test_github_client.py` (integration) cobrem: retry em 429, retry em 500, sucesso em 200 via `respx` (T09)
