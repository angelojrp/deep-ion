---
plan_id: PLAN-20260306-002
title: "Criação de Agentes Especializados para Governança de Prompts"
classification: T2
created_at: "2026-03-06T00:00:00Z"
created_by: "Gestor de Processos"
origin_analysis: "Análise de conformidade de agentes — PLAN-20260306-001"
status: CONCLUIDO
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-06T00:00:00Z"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
closed_at: "2026-03-06T00:00:00Z"
closed_by: "Copilot"
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

> **Este é o índice do plano.** Cada tarefa tem seu próprio arquivo para execução independente.  
> Ao executar uma tarefa, o agente deve ler APENAS o arquivo da tarefa + este índice (seções Riscos e Gates).

## Plano de Execução — Criação de Agentes Especializados para Governança de Prompts

**Classificação de Impacto:** T2  
**Origem:** Análise de conformidade de agentes do [`PLAN-20260306-001`](../PLAN-20260306-001_governanca-prompts/PLAN-20260306-001_governanca-prompts.md)  
**Escopo:** Criação de 2 novos agentes VS Code + reatribuição de 2 tarefas no PLAN-20260306-001

---

### Contexto

A análise de conformidade dos agentes designados no PLAN-20260306-001 (Implementação de Governança de Prompts) identificou **2 desvios de nível ALTO** nas atribuições de tarefas:

**Desvio 1 — T03 → DOM-04 (Risco Alto):** A tarefa T03 exige aplicar 4 schemas YAML distintos (`system-prompt`, `instruction`, `task-prompt`, `runtime-prompt`) em 40 arquivos de prompt. DOM-04 é um Dev Agent projetado para implementar código de aplicação — ele não possui knowledge da taxonomia de tipos de prompt definida em T02. Aplicar o schema errado por tipo corromperia os metadados de rastreabilidade sobre os quais todo o plano de governança se apoia.

**Desvio 2 — T06 → DOM-05b (Risco Alto):** A tarefa T06 exige criar golden tests de regressão comportamental para LLMs. DOM-05b foi projetado para auditar código de aplicação contra TestPlans (cobertura, Modulith, RNs). Behavioral regression testing de LLMs é um domínio radicalmente diferente: requer design de golden cases que validam schema de output sem fixar texto literal, testes de restrição comportamental baseados em system prompts, e knowledge de como LLMs estruturam respostas. DOM-05b produziria golden tests superficiais ou estruturalmente inconsistentes.

Este plano resolve os desvios criando 2 agentes VS Code especializados antes que PLAN-20260306-001 entre em FASE 1.

**Desvios endereçados:**
- `T03-DESVIO`: DOM-04 sem skill de prompt taxonomy → reassigned para **Governador de Prompts**
- `T06-DESVIO`: DOM-05b fora de escopo de behavioral LLM testing → reassigned para **QA Comportamental**

---

### Tarefas

> **FASE A** (T01, T02): independentes e paralelas — criação dos 2 novos agentes.  
> **FASE B** (T03): depende de T01 e T02 concluídas — reatribuição de tarefas no PLAN-20260306-001.

| # | Arquivo da tarefa | Fase | Agente Executor | Depende de | Paralelo com | Prioridade |
|---|-------------------|------|-----------------|------------|--------------|------------|
| T01 | [PLAN-20260306-002_T01_governador-prompts-agent.md](tasks/PLAN-20260306-002_T01_governador-prompts-agent.md) | A | Arquiteto Corporativo | — | T02 | **P0** |
| T02 | [PLAN-20260306-002_T02_qa-comportamental-agent.md](tasks/PLAN-20260306-002_T02_qa-comportamental-agent.md) | A | Arquiteto Corporativo | — | T01 | **P0** |
| T03 | [PLAN-20260306-002_T03_reatribuicao-tarefas-plan001.md](tasks/PLAN-20260306-002_T03_reatribuicao-tarefas-plan001.md) | B | Gestor de Processos | T01, T02 | — | **P1** |

---

### Riscos e Condições de Bloqueio

- **R1** — T03 (reatribuição) só pode ser executada após T01 e T02 estarem concluídas e os agentes criados e aprovados. Executar T03 sem os agentes existentes deixa PLAN-20260306-001 com atribuições inválidas.
- **R2** — **Janela crítica:** este plano deve ser executado antes de PLAN-20260306-001 atingir FASE 1 (i.e., antes do início das tarefas T02/T03/T04 do plano original). A janela disponível corresponde ao período de execução do T01 do PLAN-20260306-001 (CODEOWNERS). Após esse ponto, T03 do PLAN-20260306-001 pode iniciar com o agente errado.
- **R3** — O "Governador de Prompts" deve referenciar o documento `prompt-taxonomy.md` que o Arquiteto Corporativo produzirá como output de T02 do PLAN-20260306-001. Se o Arquiteto Corporativo ainda não produziu esse documento, o system prompt do Governador de Prompts deve incluir a taxonomia inline até o documento estar disponível.

---

### Gates Necessários

| Gate | Condição de Aceite | Responsável |
|------|-------------------|-------------|
| Gate A → B | `.github/agents/governador-prompts.md` criado com skills PG-01..03 + task-prompts publicados (T01) E `.github/agents/qa-comportamental.md` criado com skills QAC-01..03 + task-prompts publicados (T02) | Arquiteto Corporativo |
| Gate de encerramento | PLAN-20260306-001 com T03 e T06 reatribuídos + PROC-008 (RACI) atualizado com os 2 novos agentes | Gestor de Processos + Tech Lead |

---

### Critérios de Sucesso do Plano

| Dimensão | Estado Atual | Estado Alvo |
|----------|-------------|-------------|
| Agente para prompt governance | DOM-04 (generalista, sem skill de taxonomia) | "Governador de Prompts" com 3 skills PG especializadas |
| Agente para behavioral LLM QA | DOM-05b (fora de escopo) | "QA Comportamental" com 3 skills QAC especializadas |
| Atribuição T03 no PLAN-20260306-001 | `agent: DOM-04` | `agent: Governador de Prompts` |
| Atribuição T06 no PLAN-20260306-001 | `agent: DOM-05b` | `agent: QA Comportamental` |
| RACI da fábrica (PROC-008) | Sem esses papéis | Atualizado com "Governador de Prompts" e "QA Comportamental" |
| Task-prompts de invocação | Inexistentes | ≥2 por agente publicados em `.github/prompts/` |

---

### Impacto em PLAN-20260306-001

Após a execução deste plano, o PLAN-20260306-001 deve ser atualizado nos seguintes pontos:

| Tarefa do PLAN-20260306-001 | Campo | De | Para |
|-----------------------------|-------|----|------|
| T03 (índice + arquivo de tarefa) | `agent` | `DOM-04` | `Governador de Prompts` |
| T06 (índice + arquivo de tarefa) | `agent` | `DOM-05b` | `QA Comportamental` |
