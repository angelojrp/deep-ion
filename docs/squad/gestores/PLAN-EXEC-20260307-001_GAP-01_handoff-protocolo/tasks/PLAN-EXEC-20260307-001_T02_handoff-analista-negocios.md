---
plan_id: PLAN-EXEC-20260307-001
task_id: T02
title: "Adicionar Protocolo de Handoff: Analista de Negócios"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01]
parallel_with: [T03, T04, T05, T06, T07, T08, T09, T10]
artefatos: [A2]
prioridade: P1
---

## Tarefa T02 — Adicionar Protocolo de Handoff: Analista de Negócios

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `.github/agents/analista-negocios.md`  
**Ação:** Adicionar seção ao final do arquivo  
**Depende de:** T01 (SKILL-handoff.md deve existir)  
**Paralelo com:** T03..T10  
**Prioridade:** P1

---

### Objetivo

Adicionar a seção `## Protocolo de Handoff` ao final do arquivo `.github/agents/analista-negocios.md`, formalizando os pontos de entrada, saída, escalada e SLA deste agente.

**Não modificar nenhuma outra parte do arquivo.**

---

### Especificação do Conteúdo a Adicionar

Adicionar ao **final do arquivo** (após a última seção existente):

```markdown
## Protocolo de Handoff

- **recebo_de:** Gate 1 aprovado (`/gate1-approve`) — artefato esperado: DecisionRecord + label de classificação
- **entrego_para:** Checkpoint A → BAR completo para revisão (Analista Sênior + PO); Gate 2 → Use Cases + Matriz de Rastreabilidade para revisão (PO + Tech Lead)
- **escalo_quando:**
  - Conflito com RN existente sem resolução possível → Handoff Card status=ESCALADO + referência à RN
  - Ambiguidade irresolúvel em regra de negócio após 2 tentativas de refinamento → escalar ao PO e Domain Expert
  - Volume de duplicatas > 50% da demanda → sinalizar reclassificação ao PO
- **sla_máximo:** 2h para BAR | 4h para Use Cases + Matriz de Rastreabilidade
- **referência:** [SKILL-handoff.md](../../architecture/skills/SKILL-handoff.md)
```

---

### Critério de Conclusão

- [ ] Seção `## Protocolo de Handoff` presente ao final de `.github/agents/analista-negocios.md`
- [ ] Todos os 5 campos presentes: `recebo_de`, `entrego_para`, `escalo_quando`, `sla_máximo`, `referência`
- [ ] Nenhuma outra seção do arquivo foi alterada
