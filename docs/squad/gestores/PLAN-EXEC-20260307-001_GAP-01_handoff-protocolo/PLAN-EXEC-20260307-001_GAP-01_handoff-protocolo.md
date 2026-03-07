---
plan_id: PLAN-EXEC-20260307-001
title: "Execução GAP-01: Protocolo de Handoff IA↔Humano"
classification: T2
created_at: "2026-03-07T00:00:00Z"
created_by: "Gestor de Squads"
origin_diag: "DIAG-20260307-001"
origin_gap: "GAP-01"
priority: P1
status: ARQUIVADO
finalized_at: "2026-03-07T00:00:00Z"
finalized_by: "Gestor de Squads"
archeived_at: "2026-03-07T00:00:00Z"
executor: "Agente IA (modo com acesso a architecture/skills/ e .github/agents/)"
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-07T00:00:00Z"
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
> Ao executar uma tarefa, o agente deve ler APENAS o arquivo da tarefa + este índice (seções Riscos e Critérios de Aceite).

## Plano de Execução — Protocolo de Handoff IA↔Humano

**Origem:** [DIAG-20260307-001 · 02_GAP-01](../../../squad/diretoria/DIAG-20260307-001/02_GAP-01_handoff-protocolo.md)  
**Emitido por:** Gestor de Squads | **Data:** 07/03/2026  
**Prioridade:** P1 | **Status:** ✅ Arquivado

---

### Objetivo

Implementar o **Protocolo de Handoff IA↔Humano** da Fábrica de Software Autônoma, resolvendo o GAP-01 identificado no diagnóstico DIAG-20260307-001. O resultado deve transformar handoffs de passagens implícitas em **eventos rastreáveis com artefato obrigatório, SLA definido e escalada formal**.

---

### Escopo do Plano

#### ✅ O agente executor DEVE fazer
- Criar `architecture/skills/SKILL-handoff.md` com protocolo completo por gate
- Criar estrutura padrão do **Handoff Card** (template obrigatório em cada passagem IA→Humano)
- Criar **Escalation Ladder** formal documentado no SKILL
- Adicionar seção `## Protocolo de Handoff` nos 9 agentes operacionais
- Atualizar `architecture/skills/SKILL-responsabilidades.md` — incluir agentes de governança na RACI

#### ❌ O agente executor NÃO DEVE fazer
- Criar ou editar arquivos de código (`.java`, `.py`, `.ts`)
- Editar workflows do GitHub Actions
- Alterar arquivos fora de `architecture/skills/` e `.github/agents/`
- Modificar a lógica de negócio dos agentes existentes — apenas adicionar a seção de handoff

---

### Contexto a Carregar Antes de Executar

```
1. docs/squad/diretoria/DIAG-20260307-001/01_ecosistema-atual.md
2. docs/squad/diretoria/DIAG-20260307-001/02_GAP-01_handoff-protocolo.md
3. architecture/skills/SKILL-pipeline.md
4. architecture/skills/SKILL-responsabilidades.md
```

---

### Artefatos a Produzir

| # | Artefato | Tipo | Caminho |
|---|----------|------|---------|
| A1 | SKILL-handoff.md | Criar novo | `architecture/skills/SKILL-handoff.md` |
| A2 | Seção Handoff — Analista de Negócios | Editar existente | `.github/agents/analista-negocios.md` |
| A3 | Seção Handoff — Arquiteto Corporativo | Editar existente | `.github/agents/arquiteto-corporativo.md` |
| A4 | Seção Handoff — Backend Java Júnior | Editar existente | `.github/agents/backend-java-junior.md` |
| A5 | Seção Handoff — Backend Java Pleno | Editar existente | `.github/agents/backend-java-pleno.md` |
| A6 | Seção Handoff — Backend Java Sênior | Editar existente | `.github/agents/backend-java-senior.md` |
| A7 | Seção Handoff — UX Engineer | Editar existente | `.github/agents/ux-engineer.md` |
| A8 | Seção Handoff — Tech Lead | Editar existente | `.github/agents/tech-lead.md` |
| A9 | Seção Handoff — Validador UX | Editar existente | `.github/agents/validador-ux.md` |
| A10 | Seção Handoff — QA Comportamental | Editar existente | `.github/agents/qa-comportamental.md` |
| A11 | RACI estendida | Editar existente | `architecture/skills/SKILL-responsabilidades.md` |

---

### Tarefas

> **T01** é pré-requisito de todas as demais — cria a SKILL de referência.  
> **T02 a T10** dependem de T01 e podem ser executadas em paralelo entre si.  
> **T11** depende de T01..T10 concluídas.

| # | Arquivo da tarefa | Agente | Depende de | Paralelo com | Prioridade |
|---|-------------------|--------|------------|--------------|------------|
| T01 | [T01_criar-skill-handoff](tasks/PLAN-EXEC-20260307-001_T01_criar-skill-handoff.md) | Agente IA | — | — | **P1** |
| T02 | [T02_handoff-analista-negocios](tasks/PLAN-EXEC-20260307-001_T02_handoff-analista-negocios.md) | Agente IA | T01 | T03..T10 | **P1** |
| T03 | [T03_handoff-arquiteto-corporativo](tasks/PLAN-EXEC-20260307-001_T03_handoff-arquiteto-corporativo.md) | Agente IA | T01 | T02, T04..T10 | **P1** |
| T04 | [T04_handoff-backend-junior](tasks/PLAN-EXEC-20260307-001_T04_handoff-backend-junior.md) | Agente IA | T01 | T02, T03, T05..T10 | **P1** |
| T05 | [T05_handoff-backend-pleno](tasks/PLAN-EXEC-20260307-001_T05_handoff-backend-pleno.md) | Agente IA | T01 | T02..T04, T06..T10 | **P1** |
| T06 | [T06_handoff-backend-senior](tasks/PLAN-EXEC-20260307-001_T06_handoff-backend-senior.md) | Agente IA | T01 | T02..T05, T07..T10 | **P1** |
| T07 | [T07_handoff-ux-engineer](tasks/PLAN-EXEC-20260307-001_T07_handoff-ux-engineer.md) | Agente IA | T01 | T02..T06, T08..T10 | **P1** |
| T08 | [T08_handoff-tech-lead](tasks/PLAN-EXEC-20260307-001_T08_handoff-tech-lead.md) | Agente IA | T01 | T02..T07, T09..T10 | **P1** |
| T09 | [T09_handoff-validador-ux](tasks/PLAN-EXEC-20260307-001_T09_handoff-validador-ux.md) | Agente IA | T01 | T02..T08, T10 | **P1** |
| T10 | [T10_handoff-qa-comportamental](tasks/PLAN-EXEC-20260307-001_T10_handoff-qa-comportamental.md) | Agente IA | T01 | T02..T09 | **P1** |
| T11 | [T11_raci-responsabilidades](tasks/PLAN-EXEC-20260307-001_T11_raci-responsabilidades.md) | Agente IA | T01..T10 | — | **P1** |

---

### Riscos e Condições de Bloqueio

- **R1** — T02 a T10 editam arquivos `.github/agents/` que são system prompts de produção. Adicionar seção ao final do arquivo não altera lógica existente, mas deve-se verificar que a seção não é inserida no meio de outro bloco. Mitigação: adicionar sempre ao final do arquivo, após verificar a última linha existente.
- **R2** — T11 edita `SKILL-responsabilidades.md` com nova tabela RACI. Risco de quebrar estrutura existente. Mitigação: ler o arquivo completo antes de editar; adicionar nova seção sem remover conteúdo existente.

---

### Critérios de Aceite do Plano

O plano está **concluído** quando todos os itens abaixo forem verificáveis:

- [x] `architecture/skills/SKILL-handoff.md` existe e contém: Handoff Card template, protocolo por gate (G1..G5 + CheckA), Escalation Ladder, tabela SLA consolidada
- [x] `.github/agents/analista-negocios.md` contém seção `## Protocolo de Handoff` com os 5 campos (recebo_de, entrego_para, escalo_quando, sla_máximo, referência)
- [x] `.github/agents/arquiteto-corporativo.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/backend-java-junior.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/backend-java-pleno.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/backend-java-senior.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/ux-engineer.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/tech-lead.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/validador-ux.md` contém seção `## Protocolo de Handoff`
- [x] `.github/agents/qa-comportamental.md` contém seção `## Protocolo de Handoff`
- [x] `architecture/skills/SKILL-responsabilidades.md` inclui Gestor de Squads, Diretor de Squads, Governador de Prompts e QA Comportamental na RACI

---

### Checklist de Execução do Agente

```
[x] T01 — SKILL-handoff.md criado
[x] T02 — Handoff adicionado: analista-negocios.md
[x] T03 — Handoff adicionado: arquiteto-corporativo.md
[x] T04 — Handoff adicionado: backend-java-junior.md
[x] T05 — Handoff adicionado: backend-java-pleno.md
[x] T06 — Handoff adicionado: backend-java-senior.md
[x] T07 — Handoff adicionado: ux-engineer.md
[x] T08 — Handoff adicionado: tech-lead.md
[x] T09 — Handoff adicionado: validador-ux.md
[x] T10 — Handoff adicionado: qa-comportamental.md
[x] T11 — RACI estendida em SKILL-responsabilidades.md
```

---

### Pós-Execução — Validação pelo Gestor de Squads

Após execução pelo agente, o **Gestor de Squads** deve:

1. Verificar cada artefato da lista de critérios de aceite
2. Confirmar que os 5 campos obrigatórios estão presentes em cada seção `## Protocolo de Handoff` dos agentes
3. Confirmar que o SKILL-handoff.md cobre todos os gates do pipeline
4. Registrar status de conclusão neste arquivo (campo `status` no frontmatter → `CONCLUÍDO`)
5. Emitir relatório de handoff para o Diagnóstico de origem: `DIAG-20260307-001`

---

### ✅ Registro de Validação — Gestor de Squads

**Validado em:** 07/03/2026  
**Validado por:** Gestor de Squads (modo autônomo)  
**Resultado:** APROVADO — todos os critérios de aceite satisfeitos

#### Checklist de Validação

| # | Critério | Verificado | Evidência |
|---|----------|-----------|-----------|
| 1 | `SKILL-handoff.md` com Handoff Card, G1..G5+CheckA, Escalation Ladder, SLA consolidado | ✅ | `architecture/skills/SKILL-handoff.md` — todos os blocos presentes |
| 2 | `.github/agents/analista-negocios.md` — 5 campos obrigatórios | ✅ | Linhas 191-200 |
| 3 | `.github/agents/arquiteto-corporativo.md` — 5 campos obrigatórios | ✅ | Linhas 165-174 |
| 4 | `.github/agents/backend-java-junior.md` — 5 campos obrigatórios | ✅ | Linhas 111-120 |
| 5 | `.github/agents/backend-java-pleno.md` — 5 campos obrigatórios | ✅ | Linhas 142-151 |
| 6 | `.github/agents/backend-java-senior.md` — 5 campos obrigatórios | ✅ | Linhas 63-72 |
| 7 | `.github/agents/ux-engineer.md` — 5 campos obrigatórios | ✅ | Linhas 400-409 |
| 8 | `.github/agents/tech-lead.md` — 5 campos obrigatórios | ✅ | Linhas 122-131 |
| 9 | `.github/agents/validador-ux.md` — 5 campos obrigatórios | ✅ | Linhas 217-226 |
| 10 | `.github/agents/qa-comportamental.md` — 5 campos obrigatórios | ✅ | Linhas 89-98 |
| 11 | `SKILL-responsabilidades.md` — RACI de governança incluída | ✅ | Tabela "Agentes de Governança" linha 36 + seções 94-109 |

#### Desvio de Baixa Severidade Registrado

| Desvio | Severidade | Ação Tomada |
|--------|-----------|-------------|
| Metadados `status: PENDENTE` em todos os 11 arquivos de task, inconsistentes com artefatos reais produzidos | BAIXO | Corrigido neste ato — todas tasks atualizadas para `CONCLUÍDA` |

**Status final:** `ARQUIVADO` — plano encerrado, GAP-01 do DIAG-20260307-001 resolvido.
