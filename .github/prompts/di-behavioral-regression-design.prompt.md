---
prompt_id: TP-di-behavioral-regression-design
version: 1.0.0
type: task-prompt
owner: tech-lead
consumers:
  - QA Comportamental
related_proc: PROC-011
status: active
last_reviewed: "2026-03-06"
sha256: ""
agent: agent
description: "Projetar golden cases de regressão comportamental para agentes da fábrica. Usa o QA Comportamental. Input: agente(s) alvo."
name: "di-behavioral-regression-design"
argument-hint: "Informe o(s) agente(s) alvo: nome de um agente específico (ex: arquiteto-corporativo) ou 'todos' para os 6 system prompts."
---

Assuma o papel de **QA Comportamental**.

Carregue obrigatoriamente o arquivo `architecture/skills/SKILL-QAC.md` antes de prosseguir.

## Parâmetros de Entrada

- **Agente(s) alvo:** `${input:agents:Nome do agente (ex: arquiteto-corporativo) ou 'todos'}`

## Fluxo Obrigatório

### Passo 1 — Ler System Prompts

1. Para cada agente alvo, ler o system prompt de `.github/agents/<agente>.md`.
2. Extrair:
   - Tipo(s) de output documentado(s)
   - Restrições declaradas (NUNCA, NÃO DEVE, ❌, proibido)
   - Artefatos de saída esperados (planos, relatórios, tabelas, código)

### Passo 2 — Projetar Golden Cases (SKILL-QAC-01)

Para cada agente, especificar no mínimo 3 golden cases:

| Agente | Golden Case ID | Tipo | Input canônico | Expectativa estrutural | Critério de pass/fail |
|--------|----------------|------|----------------|------------------------|------------------------|

**Regras:**
- GC-01: schema validation — campos obrigatórios do output principal
- GC-02: constraint test — input adversarial para restrição #1
- GC-03+: à critério do QA Comportamental (schema, constraint ou snapshot)
- **Nunca** especificar texto literal de resposta como expectativa

### Passo 3 — Mapear Restrições (SKILL-QAC-03)

Para cada restrição declarada no system prompt:

| Agente | Restrição declarada | Input adversarial | Critério de pass | Critério de fail |
|--------|---------------------|-------------------|------------------|------------------|

**Cobertura obrigatória:** 100% das restrições com `NUNCA`/`NÃO DEVE`/`❌` devem ter ao menos 1 constraint test.

### Passo 4 — Gate de Qualidade

Antes de encerrar, verificar:
- [ ] ≥3 golden cases por agente
- [ ] ≥1 schema validation por agente
- [ ] ≥1 constraint test por agente
- [ ] 100% das restrições declaradas cobertas
- [ ] Nenhuma expectativa com texto literal fixado

> ⚠️ **Esta etapa é somente especificação.** Para implementar os testes como código pytest, use `di-behavioral-regression-implement` com a especificação confirmada.
