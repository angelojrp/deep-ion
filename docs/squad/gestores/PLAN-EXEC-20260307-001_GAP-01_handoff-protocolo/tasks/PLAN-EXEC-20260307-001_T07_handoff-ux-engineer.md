---
plan_id: PLAN-EXEC-20260307-001
task_id: T07
title: "Adicionar Protocolo de Handoff: UX Engineer"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T03, T04, T05, T06, T08, T09, T10]
artefatos: [A7]
prioridade: P1
---

## Tarefa T07 — Adicionar Protocolo de Handoff: UX Engineer

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/ux-engineer.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02..T06, T08..T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/ux-engineer.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Gate 2 aprovado (`/gate2-approve`) — artefatos esperados: Use Cases com requisitos de UI + TestPlan-{ID}
- **entrego_para:** Gate 4 → PR frontend aberto (auditado por Validador UX antes de chegar ao Tech Lead)
- **escalo_quando:**
  - Requisito de UX irreconciliável com constraints do design system → escalar ao PO para decisão de escopo
  - Conformidade WCAG impossível com stack declarada → escalar ao Tech Lead + sinalizar no Handoff Card
  - Componente necessário ausente no design system → escalar ao Tech Lead antes de criar novo componente
- **sla_máximo:** 8h por feature de frontend (demandas T2)
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/ux-engineer.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
