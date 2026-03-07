---
plan_id: PLAN-EXEC-20260307-001
task_id: T03
title: "Adicionar Protocolo de Handoff: Arquiteto Corporativo"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T04, T05, T06, T07, T08, T09, T10]
artefatos: [A3]
prioridade: P1
---

## Tarefa T03 — Adicionar Protocolo de Handoff: Arquiteto Corporativo

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/arquiteto-corporativo.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02, T04..T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/arquiteto-corporativo.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Gate 2 aprovado (`/gate2-approve`) — artefatos esperados: BAR + Use Cases + Matriz de Rastreabilidade + TestPlan-{ID}
- **entrego_para:** Gate 3 → ADR + esqueleto de código para revisão (Tech Lead obrigatório + Arquiteto obrigatório)
- **escalo_quando:**
  - Impacto arquitetural em múltiplos módulos Spring Modulith sem caminho de isolamento → escalar ao Tech Lead antes de concluir ADR
  - Mudança de contrato público de API → escalar ao Tech Lead + notificar PO
  - Impossibilidade de conformidade com blueprint declarado em `architecture/blueprints/` → escalar ao Diretor de Processos
- **sla_máximo:** 4h por ADR + esqueleto de código
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/arquiteto-corporativo.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
