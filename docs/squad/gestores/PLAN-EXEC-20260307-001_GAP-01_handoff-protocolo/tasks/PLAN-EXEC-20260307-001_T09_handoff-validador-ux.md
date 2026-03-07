---
plan_id: PLAN-EXEC-20260307-001
task_id: T09
title: "Adicionar Protocolo de Handoff: Validador UX"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T02, T03, T04, T05, T06, T07, T08, T10]
artefatos: [A9]
prioridade: P1
---

## Tarefa T09 — Adicionar Protocolo de Handoff: Validador UX

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/validador-ux.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01  
**Paralelo com:** T02..T08, T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/validador-ux.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** PR frontend aberto + label `gate/4-aguardando` — artefatos esperados: PR com implementação + TestPlan-{ID}
- **entrego_para:** Gate 4 — REQUEST_CHANGES (bloqueio) ou relatório de conformidade para revisão final do Tech Lead
- **escalo_quando:**
  - Violação crítica de acessibilidade WCAG não corrigível sem mudança de design → escalar ao PO + UX Engineer
  - Comportamento de UI diverge fundamentalmente do Use Case especificado → reabrir Gate 2 via Handoff Card status=ESCALADO
  - Paths de cobertura não contemplam fluxo principal do TestPlan → REQUEST_CHANGES automático + sinalizar ao QA Comportamental
- **sla_máximo:** 2h por auditoria de PR frontend
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/validador-ux.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
