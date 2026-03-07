---
prompt_id: TP-di-prompt-governance-audit
version: 1.0.0
type: task-prompt
owner: tech-lead
consumers:
  - Governador de Prompts
related_proc: PROC-010
status: active
last_reviewed: "2026-03-06"
sha256: ""
agent: agent
description: "Auditar artefatos de prompt contra taxonomia e schema de frontmatter. Usa o Governador de Prompts. Input: escopo da auditoria (arquivo, diretório ou 'todos')."
name: "di-prompt-governance-audit"
argument-hint: "Informe o escopo: arquivo específico (ex: .github/agents/analista-negocios.md), diretório (ex: .github/prompts/) ou 'todos' para todos os 40 artefatos."
---

Assuma o papel de **Governador de Prompts**.

Carregue obrigatoriamente o arquivo `architecture/skills/SKILL-PG.md` antes de prosseguir.

## Parâmetros de Entrada

- **Escopo da auditoria:** `${input:scope:Arquivo específico, diretório ou 'todos'}` 

## Fluxo Obrigatório

### Passo 1 — Classificação (SKILL-PG-01)

1. Ler o escopo informado.
2. Para cada artefato no escopo:
   - Determinar tipo pela localização canônica.
   - Verificar frontmatter existente (campo `type`).
   - Comparar tipo detectado vs tipo declarado (se houver).
3. Produzir tabela de classificação:

| Arquivo | Tipo detectado | Conformidade de localização | Frontmatter existente? | Ação recomendada |
|---------|----------------|-----------------------------|------------------------|------------------|

### Passo 2 — Conformidade de Frontmatter (SKILL-PG-02)

1. Para cada artefato classificado:
   - Verificar se frontmatter contém todos os campos obrigatórios do schema para o tipo.
   - Identificar campos ausentes, incorretos ou com valor inválido.
2. Produzir relatório de conformidade:

| Arquivo | Tipo | Campos presentes | Campos ausentes | Campos incorretos | Status |
|---------|------|-----------------|-----------------|-------------------|--------|

### Passo 3 — Auditoria de Ownership (SKILL-PG-03)

1. Para cada artefato:
   - Ler campo `owner` do frontmatter.
   - Cruzar com tabela de ownership natural da SKILL-PG-03.
   - Identificar prompts sem owner ou com owner não recomendado.
2. Produzir relatório de ownership:

| Arquivo | Tipo | Owner atual | Owner recomendado | Família | SLA aplicável | Conformidade |
|---------|------|-------------|-------------------|---------|---------------|--------------|

### Passo 4 — Gate de Auditoria

Ao final, reportar:
- Total de artefatos auditados
- Total em conformidade total (frontmatter + ownership)
- Total com não conformidades
- Ações recomendadas priorizadas

> ⚠️ **Proteção:** Não editar nenhum arquivo neste fluxo. A auditoria é somente leitura. Para aplicar correções, use `di-prompt-apply-frontmatter`.
