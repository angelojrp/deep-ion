---
plan_id: PLAN-EXEC-20260307-001
task_id: T08
title: "Adicionar Protocolo de Handoff: Tech Lead"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T03, T04, T05, T06, T07, T09, T10]
artefatos: [A8]
prioridade: P1
---

## Tarefa T08 — Adicionar Protocolo de Handoff: Tech Lead

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/tech-lead.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02..T07, T09..T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/tech-lead.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

O Tech Lead é revisor obrigatório em Gates 2, 3 e 4. A seção deve refletir essa responsabilidade transversal.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Gates 2, 3 e 4 — revisor obrigatório em todos; artefatos: BAR+UCs+TestPlan (Gate 2), ADR+esqueleto (Gate 3), PR+relatório DOM-05b (Gate 4)
- **entrego_para:** Decisão de gate (`/gate2-approve|reject`, `/gate3-approve|reject`, `/gate4-approve|reject`) ou reabertura com motivo explícito
- **escalo_quando:**
  - Desvio arquitetural crítico sem caminho de resolução dentro do sprint → escalar ao Diretor de Processos
  - Conflito PO vs decisão técnica sem consenso após 2 rodadas → escalar ao Diretor de Squads
  - risk_level CRITICAL em gate sem Risk Arbiter disponível → suspender gate temporariamente + notificar PO
- **sla_máximo:** 4h por revisão de gate
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/tech-lead.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
