---
plan_id: PLAN-{YYYYMMDD}-{NNN}
title: "<título da demanda>"
classification: T0 | T1 | T2 | T3
created_at: "YYYY-MM-DDTHH:MM:SSZ"
created_by: "<nome do arquiteto que elaborou o plano>"
status: PENDENTE          # PENDENTE | APROVADO | REJEITADO
approval:
  approved_by: ""         # OBRIGATÓRIO — nome do arquiteto responsável pela aprovação
  approved_at: ""         # OBRIGATÓRIO — timestamp ISO 8601
  rejection_reason: ""    # Preenchido somente se status = REJEITADO
linked_issue: ""
linked_pr: ""
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.

  ESTRUTURA DE ARQUIVOS:
  Cada plano vive em uma pasta própria:
    PLAN-{YYYYMMDD}-{NNN}_<slug>/
      PLAN-{YYYYMMDD}-{NNN}_<slug>.md   ← este arquivo (índice)
      tasks/
        PLAN-{YYYYMMDD}-{NNN}_T01_<slug>.md
        PLAN-{YYYYMMDD}-{NNN}_T02_<slug>.md
        ...
-->

> **Este é o índice do plano.** Cada tarefa tem seu próprio arquivo para execução independente.
> Ao executar uma tarefa, o agente deve ler APENAS o arquivo da tarefa + este índice (seções Riscos e Gates).

## Plano de Execução — <título da demanda>

**Classificação de Impacto:** T0 | T1 | T2 | T3  
**Blueprint de referência:** `architecture/blueprints/<blueprint>.yaml` v0.0.0  
**Pacote / Módulo alvo:** `<pacote>` | `<módulo>`

---

### Contexto

<!-- Descrever o problema ou oportunidade que motivou este plano -->

---

### Tarefas

> Indicar quais grupos de tarefas são independentes e paralelas, e quais dependem de outras.

| # | Arquivo da tarefa | Agente | Depende de | Paralelo com | Modelo |
|---|-------------------|--------|------------|--------------|--------|
| T01 | [PLAN-{ID}_T01_<slug>.md](tasks/PLAN-{ID}_T01_<slug>.md) | DOM-XX | — | T02, T03 | `<modelo>` |
| T02 | [PLAN-{ID}_T02_<slug>.md](tasks/PLAN-{ID}_T02_<slug>.md) | DOM-XX | — | T01, T03 | `<modelo>` |
| T03 | [PLAN-{ID}_T03_<slug>.md](tasks/PLAN-{ID}_T03_<slug>.md) | DOM-XX | T01 | T02 | `<modelo>` |

---

### Riscos e Condições de Bloqueio

- **R1** — <descrição do risco>
- **R2** — <descrição do risco>

---

### Gates Necessários

| Gate | Condição | Responsável |
|------|----------|-------------|
| Revisão de <artefato> (T01) | <condição de aceite> | Tech Lead |
| Aprovação de <artefato> (T02) | <condição de aceite> | Arquiteto / Tech Lead |

---

### Dependência com Próximas Iterações

- **PLAN-{ID}** (<demanda>) — <descrição da dependência>
- **<agente/módulo>** — depende de <artefato produzido por este plano>

> <Observação sobre contratos imutáveis ou restrições pós-produção, se aplicável>

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| YYYY-MM-DD | <nome> | Criação do plano |

---

<!--
  TEMPLATE DE TAREFA — copiar para tasks/PLAN-{ID}_TXX_<slug>.md
  ================================================================

---
plan_id: PLAN-{YYYYMMDD}-{NNN}
task_id: TXX
title: "<descrição da tarefa>"
agent: DOM-XX
model: <modelo>
status: PENDENTE
depends_on: []         # ex: [T01, T02]
parallel_with: []      # ex: [T03, T04]
---

## Tarefa TXX — `<nome do artefato>`

**Plano pai:** [PLAN-{ID}](<slug>.md)
**Agente executor:** DOM-XX
**Modelo sugerido:** `<modelo>` — <justificativa>
**Depende de:** <T0X ou —>
**Paralelo com:** <T0X, T0Y ou —>

---

### Objetivo

<!-- Descrever o que deve ser produzido e por quê -->

---

### Contexto de Blueprint

Blueprint de referência: `architecture/blueprints/<blueprint>.yaml` vX.Y.Z
Pacote base: `<pacote>` | Módulo alvo: `<módulo>`

---

### Especificação Técnica

<!-- Código, estrutura de arquivos, configurações ou contratos esperados -->

---

### Riscos Específicos

- **R<N>** — <risco relevante para esta tarefa específica>

---

### Artefatos de Saída

- `<caminho/do/arquivo>` — <descrição>

---

### Critérios de Aceite

- <condição verificável>
- <condição verificável>

-->

