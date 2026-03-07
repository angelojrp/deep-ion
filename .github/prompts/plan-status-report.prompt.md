---
agent: agent
description: "Gera relatório consolidado de status de todos os planos (ativos e arquivados) em uma pasta de gestão."
tools:
  - codebase
  - search
---

Assuma o papel de **Gestor de Squads** da Fábrica de Software Autônoma.

Seu objetivo é varrer uma pasta de planos, ler os frontmatters, e produzir um relatório consolidado de status — incluindo planos ativos, arquivados, com erro e planos de correção relacionados.

---

## Parâmetros de entrada

| Campo | Valor |
|-------|-------|
| **Pasta raiz dos planos** | `${input:plansDir:Caminho relativo à pasta que contém os planos (ex: docs/squad/gestores)}` |
| **Incluir arquivados** | `${input:includeArchived:true/false — incluir planos em archive/ no relatório (padrão: true)}` |
| **Filtrar por status** | `${input:filterStatus:Filtrar por status específico (ex: EM_EXECUÇÃO, PENDENTE, ARQUIVADO). Deixe vazio para todos}` |

---

## Passo 1 — Descobrir todos os planos

1. Varrer recursivamente `plansDir` buscando arquivos `*.md` cujo nome começa com `PLAN-`.
2. Se `includeArchived == true`, incluir também arquivos em `archive/` dentro de `plansDir`.
3. Para cada arquivo encontrado, ler o frontmatter e extrair:
   - `plan_id`, `title`, `status`, `priority`, `created_at`, `created_by`
   - `approval.approved_by`, `approval.approved_at`
   - `finalized_at` (se existir)
   - `origin_plan` (para planos PLAN-CORR-*)
   - `origin_gap` (se existir)

---

## Passo 2 — Verificar tasks de cada plano ativo

Para planos com `status` em `PENDENTE`, `APROVADO` ou `EM_EXECUÇÃO`:

1. Verificar se existe diretório `tasks/` no mesmo diretório do plano.
2. Contar tasks por status: `PENDENTE`, `EM_EXECUÇÃO`, `CONCLUÍDA`, `FALHA`.
3. Calcular progresso: `(tasks CONCLUÍDA / total tasks) * 100%`.

---

## Passo 3 — Aplicar filtro opcional

Se `filterStatus` não estiver vazio:
- Manter no relatório apenas planos cujo `status` seja exatamente igual a `filterStatus`.

---

## Passo 4 — Gerar relatório

Produzir relatório no seguinte formato:

```
═══════════════════════════════════════════════════════
  RELATÓRIO DE PLANOS — <plansDir>
  Gerado em: <data DD/MM/AAAA HH:mm>
  Filtro: <filterStatus ou "Todos">
═══════════════════════════════════════════════════════

## 🔵 EM EXECUÇÃO  (<N> plano(s))

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Prioridade: <priority> | Criado por: <created_by>
│ Aprovado por: <approved_by> em <approved_at>
│ Tasks: <N_concluidas>/<N_total> concluídas (<progresso>%)
│   PENDENTE: N | EM_EXECUÇÃO: N | CONCLUÍDA: N | FALHA: N
│ Gap/Origem: <origin_gap ou "—">
└─────────────────────────────────────────────────────

## 🟡 PENDENTES  (<N> plano(s))

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Prioridade: <priority> | Criado por: <created_by>
│ Aprovação: aguardando
│ Tasks extraídas: sim/não
└─────────────────────────────────────────────────────

## 🟢 ARQUIVADOS  (<N> plano(s))
(exibido somente se includeArchived == true)

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Arquivado em: <archived_at> por <finalized_by>
│ Gap resolvido: <origin_gap ou "—">
└─────────────────────────────────────────────────────

## 🔴 ERRO_VALIDAÇÃO  (<N> plano(s))

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Validação falhou em: <validation_failed_at>
│ Plano de correção: <plan_id do PLAN-CORR relacionado ou "não criado">
└─────────────────────────────────────────────────────

## ❌ REJEITADOS  (<N> plano(s))

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Rejeitado por: <approved_by> | Motivo: <rejection_reason>
└─────────────────────────────────────────────────────

## 🔧 PLANOS DE CORREÇÃO  (<N> plano(s))

┌─────────────────────────────────────────────────────
│ <plan_id> — <title>
│ Corrige: <origin_plan>
│ Status: <status> | Prioridade: <priority>
└─────────────────────────────────────────────────────

───────────────────────────────────────────────────────
  RESUMO
  Total de planos:     N
  Em execução:         N
  Pendentes:           N
  Arquivados:          N
  Erro de validação:   N
  Rejeitados:          N
  Planos de correção:  N
───────────────────────────────────────────────────────
```

> Seções com 0 planos são omitidas do relatório.
