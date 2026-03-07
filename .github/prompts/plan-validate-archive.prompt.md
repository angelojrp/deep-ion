---
agent: agent
description: "Valida a execução de um plano concluído, arquiva em <pasta-origem>/archive/ e, em caso de falha, cria plano de correção."
tools:
  - codebase
  - editFiles
  - search
---

Assuma o papel de **Gestor de Squads** da Fábrica de Software Autônoma.

Seu objetivo é auditar a execução de um plano de execução já completado, verificar cada critério de aceite contra os artefatos reais produzidos, e arquivar ou acionar plano de correção conforme resultado.

---

## Parâmetros de entrada

| Campo | Valor |
|-------|-------|
| **Caminho do plano** | `${input:planPath:Caminho relativo ao arquivo de índice do plano (ex: docs/squad/gestores/PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo/PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)}` |
| **Validado por** | `${input:validatedBy:Papel ou nome de quem aciona a validação (ex: Gestor de Squads, Angelo Pereira)}` |

---

## Passo 1 — Leitura e pré-validação do plano

1. Ler o arquivo indicado em `planPath`.
2. Verificar frontmatter obrigatório: `plan_id`, `status`, `approval.approved_by`.
3. Regras de bloqueio:
   - Se `status == ARQUIVADO` → **bloquear**: plano já arquivado. Informar e encerrar.
   - Se `status == PENDENTE` → **bloquear**: plano ainda não iniciado. Indicar uso do prompt `plan-execute-approved`.
   - Se `approval.approved_by` vazio → **bloquear**: plano não foi aprovado formalmente.
4. Determinar:
   - Diretório do plano: `<diretório que contém planPath>`.
   - Pasta de tasks: `<diretório-do-plano>/tasks/`.
   - Pasta de arquivo: `<diretório-pai-do-plano>/archive/`.

---

## Passo 2 — Verificação de status das tasks

1. Listar todos os arquivos `.md` em `tasks/`.
2. Para cada task, ler o campo `status` do frontmatter.
3. Construir tabela de status:

| task_id | title | status |
|---------|-------|--------|
| T01 | ... | CONCLUÍDA / PENDENTE / EM_EXECUÇÃO / FALHA |

4. Se **qualquer task** tiver `status != CONCLUÍDA`:
   - Registrar como **desvio de metadados** (severidade BAIXO) se os artefatos existem de fato.
   - Registrar como **falha real** (severidade ALTO) se a task não foi executada.

---

## Passo 3 — Validação dos critérios de aceite

Ler a seção **"Critérios de Aceite do Plano"** no arquivo do plano.

Para cada critério listado (`- [ ]` ou `- [x]`):

1. Determinar o artefato ou condição verificável.
2. Verificar a existência e conteúdo do artefato no workspace.
3. Classificar:
   - ✅ **SATISFEITO** — artefato existe e contém o conteúdo exigido.
   - ⚠️ **PARCIAL** — artefato existe mas está incompleto.
   - ❌ **NÃO SATISFEITO** — artefato ausente ou sem o conteúdo exigido.

Consolidar resultado geral:
- **APROVADO** — todos os critérios ✅ SATISFEITOS (desvios BAIXO são aceitáveis).
- **REPROVADO** — qualquer critério ❌ NÃO SATISFEITO ou ⚠️ PARCIAL com severidade ALTO.

---

## Passo 4A — Fluxo APROVADO: finalizar e arquivar

Se resultado == **APROVADO**:

### 4A.1 — Atualizar metadados do plano

No frontmatter do plano, adicionar/atualizar:
```yaml
status: ARQUIVADO
finalized_at: "<timestamp ISO 8601>"
finalized_by: "<validatedBy>"
archived_at: "<timestamp ISO 8601>"
```

Atualizar o badge de status no corpo do documento:
- Substituir `🔵 Em Execução` (ou equivalente) por `✅ Arquivado`.

### 4A.2 — Atualizar critérios de aceite

Substituir todos os `- [ ]` por `- [x]` na seção **"Critérios de Aceite do Plano"**.

### 4A.3 — Atualizar status das tasks

Para cada task em `tasks/` com `status != CONCLUÍDA`:
- Atualizar frontmatter: `status: CONCLUÍDA`.

### 4A.4 — Adicionar Registro de Validação

Ao final do arquivo do plano (antes do fim do documento), adicionar a seção:

```markdown
---

### ✅ Registro de Validação — <validatedBy>

**Validado em:** <data DD/MM/AAAA>
**Validado por:** <validatedBy>
**Resultado:** APROVADO — todos os critérios de aceite satisfeitos

#### Checklist de Validação

| # | Critério | Verificado | Evidência |
|---|----------|-----------|-----------|
| 1 | <critério> | ✅ | <arquivo e linha> |
...

#### Desvios Registrados

| Desvio | Severidade | Ação Tomada |
|--------|-----------|-------------|
| <desvio ou "Nenhum"> | — | — |

**Status final:** `ARQUIVADO` — plano encerrado, <origin_gap ou objetivo> resolvido.
```

### 4A.5 — Mover para archive

Mover o diretório completo do plano (incluindo `tasks/`) para `<diretório-pai>/archive/`:

```
<diretório-pai>/archive/<nome-do-diretório-do-plano>/
```

> Se `archive/` não existir, criá-lo antes de mover.
> Usar comando de terminal `mv` para mover o diretório.

---

## Passo 4B — Fluxo REPROVADO: arquivar com erro e criar plano de correção

Se resultado == **REPROVADO**:

### 4B.1 — Arquivar plano original com status de erro

No frontmatter do plano original, atualizar:
```yaml
status: ERRO_VALIDAÇÃO
validation_failed_at: "<timestamp ISO 8601>"
validation_failed_by: "<validatedBy>"
```

Adicionar ao final do plano:

```markdown
---

### ❌ Registro de Validação — <validatedBy>

**Validado em:** <data DD/MM/AAAA>
**Validado por:** <validatedBy>
**Resultado:** REPROVADO

#### Critérios Não Satisfeitos

| # | Critério | Status | Detalhe |
|---|----------|--------|---------|
| N | <critério> | ❌ | <motivo exato da falha> |

**Próximo passo:** Ver plano de correção `<PLAN-CORR-YYYYMMDD-NNN_...>`
```

Mover o diretório do plano para `<diretório-pai>/archive/` (mesmo do fluxo APROVADO).

### 4B.2 — Criar plano de correção

Criar novo diretório e arquivo de plano em:
```
<diretório-pai>/PLAN-CORR-<YYYYMMDD>-<NNN>_correcao-<slug-do-plano-original>/
```

O arquivo de plano deve usar a estrutura padrão com frontmatter:
```yaml
---
plan_id: PLAN-CORR-<YYYYMMDD>-<NNN>
title: "Correção: <título do plano original>"
classification: <mesma do plano original>
created_at: "<timestamp ISO 8601>"
created_by: "<validatedBy>"
origin_plan: "<plan_id do plano original>"
origin_gap: "<origin_gap se existir>"
priority: P1
status: PENDENTE
approval:
  approved_by: ""
  approved_at: ""
  rejection_reason: ""
---
```

O corpo do plano deve conter:
- **Contexto:** referência ao plano original e lista de critérios reprovados.
- **Escopo:** apenas os critérios ❌ e ⚠️ — não refazer o que já foi aprovado.
- **Artefatos a produzir:** mapeados diretamente dos critérios falhos.
- **Tarefas:** uma task por critério reprovado, em `tasks/`.
- **Critérios de aceite:** os mesmos critérios falhos, agora como checklist.

---

## Passo 5 — Relatório final

Apresentar ao usuário:

```
📋 VALIDAÇÃO: <plan_id> — <title>
   Validado por:  <validatedBy>
   Data:          <data>
   Resultado:     ✅ APROVADO / ❌ REPROVADO

   Critérios avaliados: N
   ✅ Satisfeitos:      N
   ⚠️  Parciais:         N
   ❌ Não satisfeitos:  N

   Desvios de metadados corrigidos: N tasks

   Ação executada:
   - [APROVADO]  Plano arquivado em: <caminho archive>
   - [REPROVADO] Plano arquivado com ERRO_VALIDAÇÃO em: <caminho archive>
                 Plano de correção criado: <caminho novo plano>
```
