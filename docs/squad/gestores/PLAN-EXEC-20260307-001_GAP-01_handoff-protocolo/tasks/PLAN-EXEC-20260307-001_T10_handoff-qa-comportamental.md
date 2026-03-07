---
plan_id: PLAN-EXEC-20260307-001
task_id: T10
title: "Adicionar Protocolo de Handoff: QA Comportamental"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T03, T04, T05, T06, T07, T08, T09]
artefatos: [A10]
prioridade: P1
---

## Tarefa T10 — Adicionar Protocolo de Handoff: QA Comportamental

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/qa-comportamental.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02..T09  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/qa-comportamental.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Label `gate/2-aguardando` ativado — artefatos esperados: BAR + Use Cases + Matriz de Rastreabilidade
- **entrego_para:** Gate 2 — TestPlan-{ID} como contrato para DOM-05b + relatório de consistência BAR→UC→RN para revisão do PO + Tech Lead
- **escalo_quando:**
  - Inconsistência crítica entre BAR e Use Cases irresolúvel → bloquear Gate 2 + escalar ao Analista de Negócios + PO
  - RN relevante sem cobertura no TestPlan (RN obrigatória) → gate bloqueia automaticamente
  - LGPD implicado na demanda sem DPO consultado → escalar ao PO imediatamente com status=ESCALADO
- **sla_máximo:** 2h por auditoria negocial (demandas T2/T3)
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/qa-comportamental.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
