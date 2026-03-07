---
prompt_id: TP-di-prompt-apply-frontmatter
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
description: "Aplicar ou corrigir frontmatter YAML em artefatos de prompt. Usa o Governador de Prompts. Pré-condição: tipo de cada artefato confirmado."
name: "di-prompt-apply-frontmatter"
argument-hint: "Informe arquivo(s) ou diretório alvo. O tipo de cada artefato deve estar confirmado antes da aplicação."
---

Assuma o papel de **Governador de Prompts**.

Carregue obrigatoriamente o arquivo `architecture/skills/SKILL-PG.md` antes de prosseguir.

## Parâmetros de Entrada

- **Alvo:** `${input:target:Arquivo específico, lista de arquivos ou diretório}`
- **Tipo confirmado (se já classificado):** `${input:confirmedType:system-prompt | instruction | task-prompt | runtime-prompt | deixe vazio para classificar primeiro}`

## Pré-condições Obrigatórias

> ⛔ **BLOQUEANTE:** O tipo de cada artefato DEVE estar confirmado antes da aplicação de frontmatter. Se o tipo não estiver confirmado, execute primeiro `di-prompt-governance-audit` para classificar.

## Fluxo Obrigatório

### Passo 1 — Verificar Classificação

1. Se `confirmedType` for informado: usar o tipo informado para todos os arquivos do alvo.
2. Se `confirmedType` estiver vazio:
   - Executar SKILL-PG-01 para classificar o(s) arquivo(s).
   - Apresentar classificação ao usuário e aguardar confirmação antes de prosseguir.

### Passo 2 — Preview das Alterações (OBRIGATÓRIO)

Antes de qualquer edição, apresentar ao usuário:

| Arquivo | Ação | Schema a aplicar | Campos a adicionar | Campos a corrigir | Campos com conflito |
|---------|------|------------------|--------------------|-------------------|---------------------|

> ⚠️ **Aguardar confirmação explícita do usuário antes de prosseguir para o Passo 3.**

### Passo 3 — Aplicar Frontmatter (SKILL-PG-02)

Após confirmação:
1. Para cada arquivo:
   - Selecionar schema canônico para o tipo confirmado.
   - Inserir ou corrigir frontmatter conforme SKILL-PG-02.
   - Manter `sha256: ""` sempre vazio.
   - Preservar todo conteúdo fora do frontmatter inalterado.
2. Para lotes > 10 arquivos: processar em grupos de 10 e apresentar relatório parcial antes de continuar.

### Passo 4 — Relatório Final

Após aplicação:

| Arquivo | Ação realizada | Campos adicionados | Campos corrigidos | Status |
|---------|----------------|--------------------|-------------------|--------|

> **Regras absolutas:**
> - `sha256` NUNCA é calculado — sempre `""`.
> - Conteúdo fora do frontmatter NUNCA é alterado.
> - Conflitos de campo são apresentados ao usuário — nunca resolvidos automaticamente.
