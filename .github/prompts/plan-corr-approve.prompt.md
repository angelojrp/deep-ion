---
agent: agent
description: "Revisa e aprova (ou rejeita) um plano de correção (PLAN-CORR-*), extraindo as tasks e liberando para execução."
tools:
  - codebase
  - editFiles
  - search
---

Assuma o papel de **Gestor de Squads** responsável pela governança de planos de correção da Fábrica de Software Autônoma.

---

## Parâmetros de entrada

| Campo | Valor |
|-------|-------|
| **Caminho do plano** | `${input:planPath:Caminho relativo ao arquivo de índice do plano de correção (ex: docs/squad/gestores/PLAN-CORR-20260307-001_correcao-.../PLAN-CORR-20260307-001....md)}` |
| **Decisão** | `${input:decision:Decisão: APROVADO ou REJEITADO}` |
| **Aprovado por** | `${input:approvedBy:Nome ou papel do responsável pela aprovação (ex: Angelo Pereira)}` |
| **Motivo de rejeição** | `${input:rejectionReason:Motivo da rejeição (obrigatório se REJEITADO, deixe em branco se APROVADO)}` |

---

## Passo 1 — Leitura e validação do plano de correção

1. Ler o arquivo indicado em `planPath`.
2. Verificar campos obrigatórios no frontmatter:
   - `plan_id`, `title`, `status`, `origin_plan`, `approval.approved_by`.
3. Confirmar que `plan_id` começa com `PLAN-CORR-`.
   - Se não começar → **bloquear**: este prompt é específico para planos de correção. Orientar uso do `plan-approve` para planos normais.
4. Regras de bloqueio por status:
   - `status == APROVADO` → **bloquear**: já aprovado.
   - `status == REJEITADO` → **bloquear**: já rejeitado.
   - `status == ARQUIVADO` ou `ERRO_VALIDAÇÃO` → **bloquear**: ciclo encerrado.
5. Verificar que `origin_plan` existe e referencia um plano real no workspace.

---

## Passo 2 — Exibição do resumo para revisão

Apresentar ao usuário antes de qualquer alteração:

```
📋 PLANO DE CORREÇÃO: <plan_id> — <title>
   Plano de origem:  <origin_plan>
   Criado por:       <created_by> em <created_at>
   Status atual:     <status>
   Prioridade:       <priority>

   Critérios falhos a corrigir:
   <lista dos critérios do plano original que reprovaram>

   Tarefas de correção:
   <lista numerada com task_id | título | depende de>

   Riscos:
   <lista de riscos, ou "Nenhum identificado">
```

Aguardar confirmação do usuário antes de prosseguir.

---

## Passo 3 — Atualização dos metadados

### Se `decision == APROVADO`

Atualizar no frontmatter:
```yaml
status: APROVADO
approval:
  approved_by: "<approvedBy>"
  approved_at: "<timestamp ISO 8601>"
  rejection_reason: ""
```

### Se `decision == REJEITADO`

- Se `rejectionReason` estiver vazio → **bloquear** e solicitar o motivo.

Atualizar no frontmatter:
```yaml
status: REJEITADO
approval:
  approved_by: "<approvedBy>"
  approved_at: "<timestamp ISO 8601>"
  rejection_reason: "<rejectionReason>"
```

> ⚠️ Não modificar nenhuma outra seção do arquivo do plano.

---

## Passo 4 — Extração de tasks (somente se `decision == APROVADO`)

### 4.1 — Verificar se tasks já foram extraídas

Verificar se `<diretório-do-plano>/tasks/` existe e contém arquivos `.md`.
- Se sim → pular extração, informar o usuário.
- Se não → prosseguir.

### 4.2 — Criar diretório tasks/

Criar o diretório `<diretório-do-plano>/tasks/` se não existir.

### 4.3 — Criar uma task por critério falho

Para cada tarefa listada na seção **"Tarefas"** do plano, criar o arquivo:
```
tasks/<plan_id>_<task_id>_<slug-do-título>.md
```

Frontmatter obrigatório:
```yaml
---
plan_id: <plan_id>
task_id: <TXX>
title: "<título da tarefa>"
agent: "Agente IA"
status: PENDENTE
depends_on: [<lista ou []>]
parallel_with: [<lista ou []>]
artefatos: [<lista de artefatos a produzir>]
prioridade: P1
---
```

O corpo deve conter:
- Referência ao plano pai.
- Critério original que falhou (copiado do plano de origem).
- Especificação do artefato a produzir ou corrigir.
- Critério de aceite individual da task.

---

## Passo 5 — Relatório final

```
📋 APROVAÇÃO: <plan_id> — <title>
   Decisão:     ✅ APROVADO / ❌ REJEITADO
   Aprovado por: <approvedBy>

   [APROVADO]
   Tasks extraídas: N
   Diretório:       <caminho tasks/>
   Próximo passo:   /plan-execute-approved planPath=<planPath>

   [REJEITADO]
   Motivo: <rejectionReason>
   Plano permanece em REJEITADO. Revisar e resubmeter se necessário.
```
