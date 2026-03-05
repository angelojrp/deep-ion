---
plan_id: PLAN-20260304-001
title: "Scaffold do módulo agents-engine conforme blueprint python-agent-first"
classification: T1
created_at: "2026-03-04T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: "APROVADO"
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-04T00:00:00Z"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

> **Este é o índice do plano.** Cada tarefa tem seu próprio arquivo para execução independente.
> Ao executar uma tarefa, o agente deve ler APENAS o arquivo da tarefa + este índice (seções Riscos e Gates).

## Plano de Execução — Scaffold do módulo `agents-engine`

**Classificação de Impacto:** T1  
**Blueprint de referência:** `architecture/blueprints/python-agent-first.yaml` v1.1.0  
**Diretório raiz:** `agents-engine/`  
**Pacote base:** `deep_ion` | **Módulo alvo:** `deep_ion.agents_engine`

---

### Contexto

Criação do **scaffold completo do módulo `agents-engine`** dentro do diretório `agents-engine/` — biblioteca compartilhada consumida por todos os agentes (DOM-01 a DOM-05b), provendo abstração de AI providers, adaptador GitHub, `DecisionRecord`/`AuditLedger`, exceções, configuração de projeto e CI. Todo o conteúdo (código-fonte, testes, configuração) reside sob `agents-engine/`; o workflow de CI referencia esse diretório explicitamente.

Pré-requisito zero para a Iteração 2 (DOM-02 + DOM-05a).

---

### Tarefas

> As tarefas **T01, T02, T03** são independentes e paralelas. As tarefas **T04, T05, T06, T07** são independentes entre si (dependem apenas de T03). Executar em paralelo sempre que possível.

| # | Arquivo da tarefa | Agente | Depende de | Paralelo com | Modelo |
|---|-------------------|--------|------------|--------------|--------|
| T01 | [PLAN-20260304-001_T01_pyproject-toml.md](tasks/PLAN-20260304-001_T01_pyproject-toml.md) | DOM-04 | — | T02, T03 | `GPT-5.1-Codex` |
| T02 | [PLAN-20260304-001_T02_config-raiz.md](tasks/PLAN-20260304-001_T02_config-raiz.md) | DOM-04 | — | T01, T03 | `GPT-4o` |
| T03 | [PLAN-20260304-001_T03_estrutura-pacotes.md](tasks/PLAN-20260304-001_T03_estrutura-pacotes.md) | DOM-04 | — | T01, T02 | `GPT-4o` |
| T04 | [PLAN-20260304-001_T04_exceptions-settings.md](tasks/PLAN-20260304-001_T04_exceptions-settings.md) | DOM-04 | T03 | T05, T06, T07 | `GPT-5.1-Codex` |
| T05 | [PLAN-20260304-001_T05_providers.md](tasks/PLAN-20260304-001_T05_providers.md) | DOM-04 | T03 | T04, T06, T07 | `GPT-5.1-Codex` |
| T06 | [PLAN-20260304-001_T06_infrastructure.md](tasks/PLAN-20260304-001_T06_infrastructure.md) | DOM-04 | T03 | T04, T05, T07 | `GPT-5.1-Codex` |
| T07 | [PLAN-20260304-001_T07_domain.md](tasks/PLAN-20260304-001_T07_domain.md) | DOM-04 | T03 | T04, T05, T06 | `GPT-5.1-Codex` |
| T08 | [PLAN-20260304-001_T08_audit.md](tasks/PLAN-20260304-001_T08_audit.md) | DOM-04 | T04, T07 | T09 | `GPT-5.1-Codex` |
| T09 | [PLAN-20260304-001_T09_testes.md](tasks/PLAN-20260304-001_T09_testes.md) | DOM-04 | T05, T06, T08 | T10 | `GPT-5.1-Codex` |
| T10 | [PLAN-20260304-001_T10_ci-workflow.md](tasks/PLAN-20260304-001_T10_ci-workflow.md) | DOM-04 | T01 | T09 | `GPT-4o` |

---

### Riscos e Condições de Bloqueio

- **R0** — Criar o diretório `agents-engine/` na raiz do workspace antes de iniciar qualquer tarefa. Verificar se já existe para evitar sobrescrever conteúdo.
- **R1** — Verificar se há `pyproject.toml` dentro de `agents-engine/` antes de criar. Não confundir com `pyproject.toml` de outros módulos na raiz do workspace.
- **R2** — `.python-version` deve conter patch version completa (ex: `3.12.9`). Consultar `uv python list`.
- **R3** — Actions `astral-sh/setup-uv` e `actions/checkout` devem ser pinadas com SHA de commit, não por tag.
- **R4** — SDKs `anthropic`, `openai`, `azure-ai-inference` devem ser `[project.optional-dependencies]`, nunca dependências obrigatórias.
- **R5** — Executar `uv lock` após criar `pyproject.toml` e commitar o `uv.lock` gerado.

---

### Gates Necessários

| Gate | Condição | Responsável |
|---|---|---|
| Revisão do `pyproject.toml` (T01) | Versões de dependências corretas e sem conflitos | Tech Lead |
| Revisão dos Protocols `GitHubPort`, `AuditPort`, `LLMProvider` (T05, T06, T07) | Contratos suficientes para DOM-02 e DOM-05a | Arquiteto / Tech Lead |
| Aprovação do schema `DecisionRecord` (T08) | Schema imutável após primeiro uso em produção | Tech Lead + Arquiteto |

---

### Dependência com Próximas Iterações

- **PLAN-20260302-001** (DOM-02) — importará `agents_engine.providers`, `infrastructure` e `audit`
- **DOM-05a** — depende de `DecisionRecord` e `AuditLedger`
- **DOM-01 (refactor)** — migrar para consumir `agents_engine.providers`

> O schema `DecisionRecord` é contrato compartilhado — após primeiro uso em produção, apenas adicionar campos com `default`. Nunca remover.


