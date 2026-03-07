---
plan_id: PLAN-EXEC-20260307-001
task_id: T04
title: "Adicionar Protocolo de Handoff: Backend Java Júnior"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T03, T05, T06, T07, T08, T09, T10]
artefatos: [A4]
prioridade: P1
---

## Tarefa T04 — Adicionar Protocolo de Handoff: Backend Java Júnior

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/backend-java-junior.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02, T03, T05..T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/backend-java-junior.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Gate 3 aprovado (`/gate3-approve`) — artefatos esperados: ADR + esqueleto de código + TestPlan-{ID}
- **entrego_para:** Gate 4 → PR aberto (auditado automaticamente por DOM-05b antes de chegar ao Tech Lead)
- **escalo_quando:**
  - Impossibilidade técnica de implementar conforme ADR → escalar ao Arquiteto antes de qualquer desvio
  - Risco OWASP identificado durante implementação (SQL injection, XSS, etc.) → bloquear PR + escalar ao Tech Lead imediatamente
  - Cobertura de testes insuficiente para cobrir TestPlan → sinalizar ao QA antes do PR
- **sla_máximo:** 8h por implementação (demandas T2)
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/backend-java-junior.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
