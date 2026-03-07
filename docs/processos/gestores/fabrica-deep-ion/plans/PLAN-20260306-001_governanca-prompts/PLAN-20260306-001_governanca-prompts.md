---
plan_id: PLAN-20260306-001
title: "Implementação de Governança de Prompts da Fábrica deep-ion"
classification: T2
created_at: "2026-03-06T00:00:00Z"
created_by: "Gestor de Processos"
origin_diag: "DIAG-20260306-002"
status: PENDENTE
approval:
  approved_by: ""
  approved_at: ""
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

## Plano de Execução — Implementação de Governança de Prompts

**Classificação de Impacto:** T2  
**Diagnóstico de origem:** [`DIAG-20260306-002`](../../../../../diretoria/DIAG-20260306-002_gestao-prompts.md)  
**Escopo:** Todos os 40 artefatos de prompt em `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/arquiteto-instructions.md` e prompts Python em `agents-engine/`

---

### Contexto

O diagnóstico estratégico `DIAG-20260306-002` (Diretor de Processos, 2026-03-06) identificou **10 GAPs críticos** na gestão dos 40 artefatos de prompt que sustentam o comportamento operacional da fábrica deep-ion. Os prompts — em especial os 6 system prompts de agentes — são editados sem controle de mudança, sem versionamento semântico, sem registro de execução e sem testes de regressão comportamental. Uma alteração silenciosa em um system prompt muda o comportamento de toda a fábrica sem qualquer rastreabilidade.

Este plano implementa as 7 recomendações estratégicas do diagnóstico em 4 fases sequenciais, do controle imediato de risco (FASE 0) à manutenibilidade contínua (FASE 3).

**GAPs endereçados:** GP-01, GP-02, GP-03, GP-04, GP-05, GP-06, GP-07, GP-08, GP-09, GP-10  
**Recomendações implementadas:** R-01, R-02, R-03, R-04, R-05, R-06, R-07

---

### Tarefas

> **FASE 0** (T01) é independente e deve ser executada imediatamente.  
> **FASE 1** (T02, T03, T04): T02 é pré-requisito de T03 e T04; T03 e T04 são paralelas entre si.  
> **FASE 2** (T05, T06): ambas dependem de T03; são paralelas entre si.  
> **FASE 3** (T07): depende de T03 e T04 concluídas.

| # | Arquivo da tarefa | Fase | Agente | Depende de | Paralelo com | Prioridade |
|---|-------------------|------|--------|------------|--------------|------------|
| T01 | [PLAN-20260306-001_T01_codeowners.md](tasks/PLAN-20260306-001_T01_codeowners.md) | 0 | DOM-04 | — | — | **P0** |
| T02 | [PLAN-20260306-001_T02_taxonomia-prompts.md](tasks/PLAN-20260306-001_T02_taxonomia-prompts.md) | 1 | Arquiteto Corporativo | T01 | — | **P1** |
| T03 | [PLAN-20260306-001_T03_frontmatter-governanca.md](tasks/PLAN-20260306-001_T03_frontmatter-governanca.md) | 1 | Governador de Prompts | T02 | T04 | **P1** |
| T04 | [PLAN-20260306-001_T04_processo-prompt-inception.md](tasks/PLAN-20260306-001_T04_processo-prompt-inception.md) | 1 | Gestor de Processos | T02 | T03 | **P1** |
| T05 | [PLAN-20260306-001_T05_hash-audit-ledger.md](tasks/PLAN-20260306-001_T05_hash-audit-ledger.md) | 2 | DOM-04 | T02, T03 | T06 | **P1** |
| T06 | [PLAN-20260306-001_T06_behavioral-regression-tests.md](tasks/PLAN-20260306-001_T06_behavioral-regression-tests.md) | 2 | QA Comportamental | T03 | T05 | **P1** |
| T07 | [PLAN-20260306-001_T07_owners-sla-task-prompts.md](tasks/PLAN-20260306-001_T07_owners-sla-task-prompts.md) | 3 | Gestor de Processos | T03, T04 | — | **P2** |

> **Nota de reatribuição (PLAN-20260306-002):** As tarefas T03 e T06 foram reatribuídas em
> 2026-03-06 por análise de conformidade de agentes. T03 usava DOM-04 (sem skill de taxonomia
> de prompts); T06 usava DOM-05b (fora de escopo de behavioral LLM testing). Ver
> [PLAN-20260306-002](../../PLAN-20260306-002_novos-agentes-governanca-prompts/PLAN-20260306-002_novos-agentes-governanca-prompts.md).

---

### Riscos e Condições de Bloqueio

- **R1** — T03 envolve edição em lote de 40 arquivos de prompt com frontmatter YAML. Um erro de sintaxe YAML pode corromper o carregamento dos agentes VS Code. Mitigação: validação via `yamllint` em CI antes do merge.
- **R2** — T05 (hash no Audit Ledger) requer modificação no `agents-engine`, que ainda está em scaffold (PLAN-20260304-001). Bloqueio se o scaffold não estiver aprovado/concluído antes do início da FASE 2.
- **R3** — T06 (golden tests comportamentais) depende do modelo LLM disponível em CI. Se o CI não tiver acesso a um LLM real, os testes precisam usar mock — limitando a fidelidade da regressão.
- **R4** — Qualquer alteração em `.github/agents/*.md` durante a execução deste plano (antes de T01 estar concluída) pode invalidar os frontmatter aplicados em T03. Recomendação: freeze de system prompts até T01 ser aprovado.

---

### Gates Necessários

| Gate | Condição de Aceite | Responsável |
|------|-------------------|-------------|
| Gate FASE 0 → FASE 1 | CODEOWNERS aplicado e PR merged com workflow de proteção validado | Tech Lead |
| Gate FASE 1 → FASE 2 | Taxonomia aprovada (T02) + todos os 40 prompts com frontmatter válido (T03) + PROC-010 publicado (T04) | Tech Lead + Gestor de Processos |
| Gate FASE 2 → FASE 3 | Hash registrado no Audit Ledger com teste de integração (T05) + mínimo 3 golden cases por agente na suite (T06) | Tech Lead + DOM-05b |
| Gate de encerramento | Owners designados para todos os 32 task-prompts com SLA documentado (T07) | Gestor de Processos |

---

### Critérios de Sucesso do Plano

| Dimensão | Nível Atual (DIAG) | Nível Alvo |
|----------|-------------------|------------|
| Versionamento de prompts | L1 — Inexistente | L3 — Semver + changelog por artefato |
| Controle de mudança em system prompts | L1 — Inexistente | L3 — Gate com revisor obrigatório via CODEOWNERS |
| Taxonomia de tipos de prompt | L1 — Inexistente | L3 — 4 tipos definidos com políticas diferenciadas |
| Rastreabilidade de execução | L1 — Inexistente | L3 — Hash SHA-256 registrado por execução de agente |
| Testes de regressão comportamental | L1 — Inexistente | L3 — Suite com ≥3 golden cases por agente |
| Processo de Prompt Inception | L1 — Inexistente | L2 — Processo documentado (PROC-010) |
| Owners de task-prompts | L1 — Inexistente | L2 — Owner e SLA designados para todos os 32 |

---

### Dependência com Próximas Iterações

- **DIAG-20260306-003** (Engenharia de Contexto) — O `ContextPacket` formal precisa referenciar versões específicas de prompt para ser reprodutível. Este plano (especialmente T02 e T03) é pré-requisito para a implementação da governança de contexto.
- **PLAN-20260304-001** (agents-engine scaffold) — T05 deste plano depende do scaffold do `agents-engine` estar disponível para modificação da camada de audit.
- **PROC-010** (Prompt Inception) — produzido por T04, será referenciado por todos os agentes que criarem novos prompts a partir deste plano.

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-03-06 | Gestor de Processos | Criação do plano com base em DIAG-20260306-002 |
