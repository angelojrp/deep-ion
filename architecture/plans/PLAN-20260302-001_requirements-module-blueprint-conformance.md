---
plan_id: PLAN-20260302-001
title: "Adequação do módulo .github/requirements ao blueprint python-agent-first v1.1"
classification: T1
created_at: "2026-03-02T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: PENDENTE
approval:
  approved_by: ""
  approved_at: ""
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

## Plano de Execução — Adequação do módulo `.github/requirements` ao blueprint python-agent-first v1.1

**Classificação de Impacto:** T1

---

### Contexto

O módulo `.github/requirements` é a implementação MVP do agente DOM-02 (Requirements Agent).
Ele contém 7 arquivos Python (`skill_req_00..02`, `github_api`, `ai_provider`, `audit_ledger`,
`rn_catalog`, `uc_repository`) que funcionam como scripts planos sem estrutura de pacote formal.

A auditoria de conformidade realizada (2026-03-02) identificou **27 não-conformidades** em relação
ao blueprint `python-agent-first v1.1`. O módulo é um MVP funcional — o objetivo deste plano NÃO
é reescrever a lógica de negócio, mas rearquitetar o invólucro para que o código MVP existente
fique encapsulado nas camadas corretas, tipado, testável e seguro.

---

### Diagnóstico de Não-Conformidades

#### Estrutura e Empacotamento (crítico)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-01 | Código em `.github/requirements/` flat — sem src-layout | todos | `project_structure.src_layout` |
| NC-02 | `sys.path.insert(0, CURRENT_DIR)` em todos os skills | `skill_req_00..02` | `project_structure.src_layout` |
| NC-03 | Sem `pyproject.toml` com entry points | — | `project_structure.entry_points` |
| NC-04 | Sem `.python-version` | — | `project_structure.layout` |
| NC-05 | Sem `justfile` ou `Makefile` | — | `tooling.task_runner` |
| NC-06 | Sem `.pre-commit-config.yaml` | — | `tooling.pre_commit` |
| NC-07 | Skills invocados como `python skill_req_NN.py` em vez de `uv run skill-req-NN` | workflows | `github_actions.skill_invocation` |

#### Linguagem e Tipagem (alto)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-08 | Annotations legadas: `Optional[X]`, `Dict[K,V]`, `List[X]` em vez de `X \| None`, `dict`, `list` | todos | `conventions.type_annotations` |
| NC-09 | `Any` importado e usado em múltiplos arquivos não-adapter | `github_api`, `uc_repository` | `conventions.type_annotations` — `Any` proibido fora de adapters |
| NC-10 | Sem `mypy` configurado; nenhum type check em CI | — | `conventions.type_checker` |
| NC-11 | Sem `__all__` em nenhum módulo público | todos | `conventions.style` — exportar superfície pública |

#### Camadas e Responsabilidades (alto)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-12 | Sem subdivisão em camadas (domain/, infrastructure/, providers/, audit/, cli/) | todos | `modules.layers` |
| NC-13 | `uc_repository.GitHubIssueClient` duplica HTTP client de `github_api.GitHubAPI` com urllib | `uc_repository.py` | `infrastructure` — "one HTTP layer per boundary" |
| NC-14 | Lógica de negócio (`sys.path` munging, extração de RN) no entry point skill | `skill_req_00..02` | `modules.layers.skill` — skill não deve conter lógica de negócio |
| NC-15 | `_load_dotenv()` executado como side-effect no import de `github_api.py` | `github_api.py` | Settings via pydantic-settings, não efeito colateral de import |

#### HTTP e Retry (alto)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-16 | `urllib.request` em vez de `httpx` | `github_api.py`, `ai_provider.py`, `uc_repository.py` | `dependency_management` — httpx é preferido |
| NC-17 | Sem retry com backoff exponencial em chamadas HTTP | `github_api.py`, `ai_provider.py` | `infrastructure` + `ai_provider.rules` — tenacity obrigatório |

#### Modelos de Dados (alto)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-18 | `DecisionRecord` é `@dataclass` em vez de Pydantic v2 `BaseModel(frozen=True)` | `audit_ledger.py` | `modules.layers.audit` |
| NC-19 | `BusinessRule` é `@dataclass(frozen=True)` em vez de Pydantic v2 | `rn_catalog.py` | `modules.layers.domain` |
| NC-20 | `decision` é string livre (PT-BR: "bloquear", "avançar") em vez de `Literal["approve","block","escalar","alert"]` | `audit_ledger.py`, skills | `modules.layers.audit` |
| NC-21 | Credenciais carregadas com `os.getenv()` espalhado; sem `pydantic-settings BaseSettings` | `github_api.py`, `ai_provider.py`, `uc_repository.py` | `ai_provider.settings` |

#### CLI (médio)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-22 | `argparse` em vez de `typer` para parsing de argumentos | `skill_req_00..02` | `modules.layers.cli` |

#### Observabilidade e Segurança (médio)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-23 | `print()` em código de produção (ex: `ai_provider.py`) | `ai_provider.py` | `style.rules` — T201 proibido |
| NC-24 | Sem `structlog`; sem logging estruturado JSON | todos | `observability.logging` |
| NC-25 | Sem `bandit` em CI | — | `tooling.security_scanning` |
| NC-26 | `pathlib.Path.open()` e `open()` misturados; `load_prompt_file` usa `open()` | `ai_provider.py` | `style.rules` — PTH obrigatório |

#### Testes (médio)

| # | Não-conformidade | Arquivo(s) | Regra Blueprint Violada |
|---|---|---|---|
| NC-27 | Sem suite de testes; sem `tests/` | — | `testing` — cobertura mínima 80%, domain 100% |

---

### Estratégia de Abordagem

> **Premissa:** a lógica de negócio existente (RN catalog, detecção de duplicatas, geração de BAR/UC,
> rastreabilidade) está correta e é preservada. O trabalho é mover o código para a estrutura correta,
> trocar as dependências técnicas e adicionar a infraestrutura de qualidade em torno dele.

A refatoração é organizada em **4 ondas sequenciais**, com tarefas paralelas dentro de cada onda.
O código existente em `.github/requirements/` permanece intocado até a onda 4 (migração), quando
é substituído de forma atômica pelo novo pacote.

```
Onda 1: Scaffolding (sem tocar código atual)
  → pyproject.toml + src-layout + .python-version + justfile + pre-commit

Onda 2: Camadas base (implementadas em paralelo)
  → Settings (pydantic-settings) + Domain (Pydantic v2) + Infrastructure (httpx+tenacity)

Onda 3: Camadas superiores (implementadas em paralelo)
  → Providers (httpx+tenacity+Protocol) + Audit (Pydantic DecisionRecord) + Observability (structlog)

Onda 4: Entry points + migração + testes + hardening
  → Skills (typer) + Tests + mypy + bandit + CI update
```

---

### Tarefas

#### Onda 1 — Scaffolding do Pacote

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa |
|---|--------|--------|------------|--------------|-----------------|---------------|
| 1 | Criar `pyproject.toml` com `[project]`, `[project.scripts]` (3 entry points `skill-req-00..02`), `[dependency-groups.dev]`, `[tool.ruff]`, `[tool.mypy]`, `[tool.pytest.ini_options]`, `[tool.bandit]` | DOM-04 | — | #2, #3, #4 | `GPT-5.1-Codex` | Geração de arquivo de configuração multi-seção; Codex superior para pyproject |
| 2 | Criar skeleton `src/deep_ion/dom02/__init__.py` com `__all__` + subdirs `domain/`, `infrastructure/`, `providers/`, `audit/`, `cli/` com `__init__.py` vazios | DOM-04 | — | #1, #3, #4 | `GPT-4o` | Tarefa estrutural simples |
| 3 | Criar `.python-version` com `3.12.9` | DOM-04 | — | #1, #2, #4 | `GPT-4o` | Tarefa trivial |
| 4 | Criar `justfile` com receitas: `lint`, `format`, `typecheck`, `test`, `security`, `ci`, `install` | DOM-04 | — | #1, #2, #3 | `GPT-4o` | Receitas já definidas no blueprint; geração direta |
| 5 | Criar `.pre-commit-config.yaml` com hooks: `ruff`, `ruff-format`, `mypy`, `bandit`, `check-yaml`, `end-of-file-fixer`, `trailing-whitespace` | DOM-04 | — | #1, #2, #3 | `GPT-4o` | Config declarativa; modelo simples suficiente |

#### Onda 2 — Camadas Base (paralelas entre si, dependem de #1 e #2)

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa |
|---|--------|--------|------------|--------------|-----------------|---------------|
| 6 | Criar `src/deep_ion/dom02/infrastructure/settings.py`: Pydantic BaseSettings com `github_token: SecretStr`, `github_repository: str`, `ai_provider: str`, `ai_provider_api_key: SecretStr`, `ai_provider_model: str`, `log_level: str` | DOM-04 | #1, #2 | #7, #8 | `GPT-5.1-Codex` | Pydantic v2 + pydantic-settings requer precisão nos validators e env_prefix |
| 7 | Mover `rn_catalog.py` para `src/deep_ion/dom02/domain/rn_catalog.py`: converter `BusinessRule` de `@dataclass` para Pydantic v2 `BaseModel(frozen=True)`; modernizar annotations (`list[str]` em vez de `List[str]`, `str \| None` em vez de `Optional[str]`); adicionar `__all__`; preservar toda lógica existente | DOM-04 | #1, #2 | #6, #8 | `GPT-5.1-Codex` | Refatoração de tipo com preservação de semântica; Codex para precisão |
| 8 | Criar `src/deep_ion/dom02/infrastructure/github_client.py`: refatorar `github_api.py` usando `httpx.Client` (sync) em vez de `urllib.request`; adicionar retry com `tenacity.retry(wait=wait_random_exponential, stop=stop_after_attempt(3))` em 429/5xx; mover `_load_dotenv()` para responsabilidade de Settings; eliminar `uc_repository.GitHubIssueClient` (duplicata); manter toda API pública existente; adicionar `typing.Protocol` `GitHubClientProtocol` em `domain/` para desacoplar testes | DOM-04 | #1, #2 | #6, #7 | `GPT-5.1-Codex` | Maior complexidade técnica da onda: httpx + tenacity + consolidação de cliente duplicado |

#### Onda 3 — Camadas Superiores (paralelas entre si, dependem de onda 2)

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa |
|---|--------|--------|------------|--------------|-----------------|---------------|
| 9 | Criar `src/deep_ion/dom02/providers/llm_provider.py`: definir `LLMProvider` como `typing.Protocol` com `complete(prompt: str, model: str \| None) -> str`; refatorar `ai_provider.py` em `CopilotProvider`, `OpenAIProvider` implementando o Protocol com `httpx` (substituir `urllib.request`); adicionar `tenacity` retry; `ProviderFactory` com seleção via Settings; eliminar `print()` (→ structlog); manter fallback determinístico | DOM-04 | #6, #7, #8 | #10, #11 | `GPT-5.1-Codex` | Refatoração com Protocol + httpx + tenacity; maior complexidade desta onda |
| 10 | Criar `src/deep_ion/dom02/audit/decision_record.py`: converter `DecisionRecord` de `@dataclass` para Pydantic v2 `BaseModel(model_config=ConfigDict(frozen=True))`; `decision` field como `Literal["approve","block","escalar","alert"]` (inglês canônico conforme blueprint); serialização via `model_dump_json()`; manter `format_decision_record_markdown()` e `extract_last_decision_record()`; atualizar `record_id` para `uuid.uuid4()` com type annotation correta | DOM-04 | #6, #7, #8 | #9, #11 | `GPT-5.1-Codex` | Pydantic v2 strict + Literal; impacto downstream nos 3 skills |
| 11 | Criar `src/deep_ion/dom02/infrastructure/logging.py`: configurar `structlog` com `TimeStamper(fmt="iso", utc=True)`, `add_log_level`, `JSONRenderer`; expor `get_logger()` wrapper; configuração única chamada no entry point | DOM-04 | #6, #7, #8 | #9, #10 | `GPT-4o` | Configuração de structlog é bem documentada; modelo simples suficiente |

#### Onda 4 — Entry Points, Migração, Testes e Hardening

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa |
|---|--------|--------|------------|--------------|-----------------|---------------|
| 12 | Migrar `uc_repository.py` → `src/deep_ion/dom02/domain/uc_repository.py`: remover `GitHubIssueClient` (usa `GitHubClientProtocol`); modernizar annotations; manter `find_similar_ucs()`, `_cosine_similarity()`, `UcRecord` (→ Pydantic v2) | DOM-04 | #8, #10 | #13 | `GPT-5.1-Codex` | Refatoração + substituição de dependência (Protocol injection) |
| 13 | Migrar `skill_req_00..02` → `src/deep_ion/dom02/cli/skill_req_00..02.py`: substituir `argparse` por `typer`; remover `sys.path.insert`; substituir imports diretos por imports de pacote (`from deep_ion.dom02.infrastructure...`); substituir `print()` por `structlog`; atualizar `DecisionRecord.decision` para valores canônicos em inglês; adicionar `if __name__ == "__main__": app()` | DOM-04 | #9, #10, #11, #12 | — | `GPT-5.1-Codex` | Refatoração de 3 skills com múltiplas dependências; máxima precisão necessária |
| 14 | Criar suite de testes `tests/unit/` para `domain/` (rn_catalog, uc_repository): cobertura 100% branch; usar `pytest` + `pytest-mock`; testar `BusinessRule` com inputs válidos e inválidos (Pydantic v2 validation); testar cada função de `rn_catalog` com RN-01..RN-07; testar `find_similar_ucs()` com mock de `GitHubClientProtocol` | DOM-04 | #7, #12 | #15 | `GPT-5.1-Codex` | Geração de testes com semântica de negócio RN-01..RN-07; Codex para precisão |
| 15 | Criar suite de testes `tests/unit/` para `audit/` e `providers/`: testar `DecisionRecord` serialização e validação do campo `Literal`; testar `ProviderFactory` com mock de env vars; testar retry logic de providers com `respx` (httpx mock) | DOM-04 | #9, #10 | #14 | `GPT-5.1-Codex` | Testes de infra com interceptação httpx via respx |
| 16 | Criar suite de testes `tests/integration/` para `infrastructure/github_client.py`: mockar API GitHub com `respx`; cobrir retry em 429/5xx; verificar que `SecretStr` não vaza em logs | DOM-04 | #8, #11 | #14, #15 | `GPT-5.1-Codex` | Testes de integração com mock httpx |
| 17 | Atualizar workflows GitHub Actions: substituir invocação `python .github/requirements/skill_req_NN.py` por `uv run skill-req-NN`; adicionar step `pre-commit run --all-files`; adicionar step `mypy src/`; adicionar step `bandit -r src/ -ll`; adicionar step `uv audit`; usar `astral-sh/setup-uv` com `python-version-file: .python-version` e `enable-cache: true` | DOM-04 | #1, #13 | — | `GPT-4o` | Atualização de workflow; lógica simples mas impacto crítico em CI |

---

### Decisões Arquiteturais e Orientações de Implementação

#### DA-01 — Localização física vs. localização lógica

O módulo usa `.github/requirements/` como pasta de trabalho por constraint do GitHub Actions.
A abordagem recomendada é manter o `pyproject.toml` na raiz do repositório `deep-ion-agents` e
configurar `packages = [{include = "deep_ion", from = "src"}]` no `[tool.uv]`. Os skills são
then invocados via entry points registrados — o GitHub Actions não precisa saber o caminho físico.

**Alternativa rejeitada:** mover o pacote para `src/` e criar symlinks em `.github/` — cria
complexidade desnecessária e pode quebrar o isolamento de processo.

#### DA-02 — `decision` field: migração para inglês canônico

O blueprint define `Literal["approve", "block", "escalar", "alert"]`. O código atual usa
`"bloquear"`, `"avançar"` (PT-BR). A migração deve ser feita atomicamente na tarefa #10 junto
com a conversão para Pydantic v2 — não ao longo das skills individualmente.

Mapeamento de migração:
- `"bloquear"` → `"block"`
- `"avançar"` → `"approve"`
- `"escalar"` → `"escalar"` (mantém — é termo de domínio da fábrica)
- `"alert"` → novo valor, usado em situações de warning sem bloqueio

#### DA-03 — `uc_repository.GitHubIssueClient` (NC-13: duplicata)

`GitHubIssueClient` em `uc_repository.py` reimplementa chamadas HTTP que já existem em
`GitHubAPI`. Na nova estrutura, `find_similar_ucs()` recebe um `GitHubClientProtocol` como
dependência injetada — eliminando a duplicação sem alterar a lógica de similaridade cossenoidal.

#### DA-04 — `_load_dotenv()` side-effect no import (NC-15)

Esta função carrega `.env` no momento do import de `github_api.py`. Na nova estrutura, o
carregamento de variáveis de ambiente é responsabilidade exclusiva do `pydantic-settings`
`AppSettings`. O `pydantic-settings` suporta `model_config = SettingsConfigDict(env_file=".env")`
nativamente — elimina a necessidade de `_load_dotenv()`.

#### DA-05 — Compatibilidade retroativa dos prompts

Os arquivos `prompts/bar_generation.md` e `prompts/uc_generation.md` são preservados sem
alteração. O caminho de acesso deve ser resolvido via `importlib.resources` ou
`pathlib.Path(__file__).parent / "prompts"` na nova estrutura de pacote.

---

### Riscos e Condições de Bloqueio

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **R-01** Migração de `decision` para inglês quebra parsing de DecisionRecords históricos em issues existentes | Médio | Alto | `extract_last_decision_record()` deve aceitar tanto PT-BR quanto inglês durante período de transição |
| **R-02** `uv run skill-req-NN` exige que o pacote esteja instalado no ambiente CI; setup-uv sem `uv sync` antes do skill step causaria ImportError | Alto | Crítico | O step CI de setup DEVE rodar `uv sync` antes de qualquer `uv run`; validar no PR de task #17 |
| **R-03** `httpx` tem diferenças sutis em tratamento de encoding vs `urllib.request` em payloads UTF-8 | Baixo | Médio | Testes de integração em #16 cobrem headers e encoding explicitamente |
| **R-04** `pydantic-settings` com `SecretStr` pode causar falha silenciosa se campo obrigatório não for fornecido no ambiente (ValidationError não capturado) | Médio | Alto | Skill entry point deve capturar `ValidationError` e publicar comentário de erro estruturado na Issue antes de exit(1) |
| **R-05** Parallel tasks da onda 2 (#6, #7, #8) com contratos de interface ainda não finalizados | Médio | Médio | Definir `GitHubClientProtocol` e `LLMProvider Protocol` ANTES de iniciar #8 e #9 — incluídos na tarefa #7 e #9 respectivamente |

---

### Gates Necessários

| Gate | Condição | Responsável |
|---|---|---|
| Gate de Scaffolding | `uv sync` executa sem erro; `just install` funciona; entry points aparecem em `uv run --list` | Tech Lead |
| Gate de Camadas Base | `mypy src/` em strict sem erros nas camadas domain/ e infrastructure/; `rn_catalog` e `github_client` cobertos | Tech Lead |
| Gate de Testes (T1) | `pytest -m 'not e2e'` passa; coverage domain = 100%; coverage geral ≥ 80% | QA + Tech Lead |
| Gate de CI | Workflow atualizado executa sem falha em branch de staging; `skill-req-00 --issue <test>` invocado via `uv run` no Actions | Tech Lead |

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-03-02 | Arquiteto Corporativo | Criação do plano — 27 NC identificadas, 17 tarefas em 4 ondas |
