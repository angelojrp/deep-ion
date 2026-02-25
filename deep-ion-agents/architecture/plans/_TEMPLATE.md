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
linked_issue: "#NNN"
linked_pr: ""
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

## Plano de Execução — <título da demanda>
**Classificação de Impacto:** T0 | T1 | T2 | T3

---

### Contexto
<!-- Descrever o problema ou oportunidade que motivou este plano -->

---

### Tarefas

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa do modelo |
|---|--------|--------|------------|--------------|-----------------|-------------------------|
| 1 | ...    | DOM-XX | —          | #2, #3       | `<modelo>`      | <motivo>                |
| 2 | ...    | DOM-XX | —          | #1, #3       | `<modelo>`      | <motivo>                |

---

### Riscos e Condições de Bloqueio
- ...

---

### Gates Necessários
- ...

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| YYYY-MM-DD | <nome> | Criação do plano |
