---
plan_id: PLAN-20260306-001
task_id: T04
title: "Documentar processo formal de Prompt Inception (PROC-010)"
fase: "FASE 1 — Fundação de Governança"
agent: Gestor de Processos
status: PENDENTE
depends_on: [T02]
parallel_with: [T03]
gaps: [GP-05, GP-08]
recomendacao: R-06
prioridade: P1
---

## Tarefa T04 — Processo de Prompt Inception (PROC-010)

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 1 — Fundação de Governança  
**Agente executor:** Gestor de Processos  
**Depende de:** T02 (taxonomia — define quem é owner por tipo)  
**Paralelo com:** T03  
**Prioridade:** P1

---

### Objetivo

Documentar o processo formal pelo qual um novo prompt nasce, é revisado, entra em produção e é depreciado. Sem este processo, os 3 `runtime-prompts` Python que o `agents-engine` precisa (referenciados em `validador-ux.md` mas inexistentes) e todos os futuros prompts nascerão no mesmo estado não governado que os 40 existentes.

O artefato produzido é o **PROC-010 — Prompt Inception e Ciclo de Vida**, publicado em `docs/processos/gestores/fabrica-deep-ion/`.

**GAPs endereçados:**
- **GP-05** — Prompts planejados do agents-engine inexistentes (ausência de processo de inception)
- **GP-08** — Sem processo de revisão para alterações em prompts

---

### Especificação do Processo PROC-010

O documento PROC-010 deve cobrir:

#### 1. Fluxo Principal — Criação de Novo Prompt

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|--------------------|
| 1 | Identificar necessidade | Qualquer agente/profissional | Demanda ou gap de processo | Issue de prompt inception | Issue criada com tipo, owner tentativo e justificativa |
| 2 | Classificar tipo | Arquiteto Corporativo | Issue + taxonomia (T02) | Tipo definido (`system-prompt`/`instruction`/`task-prompt`/`runtime-prompt`) | Tipo documentado na Issue |
| 3 | Designar owner | Tech Lead (sys) / Gestor (task) | Tipo definido | Owner atribuído | Owner confirmado e notificado |
| 4 | Criar draft | Owner designado | Schema de frontmatter (T03) | Arquivo com `status: draft` + frontmatter completo | yaml válido, conteúdo revisável |
| 5 | Revisão comportamental | Owner do agente consumidor | Draft + golden cases de referência | Aprovação ou rejeição com feedback | Aprovação documentada no PR |
| 6 | Gate de merge | CODEOWNERS (sys/ins) ou PR review (task) | PR aprovado | Arquivo com `status: active` | PR merged após revisão do owner |
| 7 | Registrar version bump | Owner | Merge confirmado | `version` incrementado, `last_reviewed` atualizado | Frontmatter atualizado no commit de merge |

#### 2. Fluxo de Alteração de Prompt Existente

| # | Etapa | Responsável | Critério de Aceite |
|---|-------|-------------|--------------------|
| 1 | Identificar prompt impactado | Quem detectou a necessidade | Issue ou PR de origem documentado |
| 2 | Avaliar impacto de regressão | Owner do prompt | Registro de quais golden cases precisam ser atualizados (T06) |
| 3 | Bump semântico | Owner | PATCH = comportamento neutro; MINOR = nova capacidade; MAJOR = mudança de identidade/escopo |
| 4 | PR com CODEOWNERS | CODEOWNERS (sys/ins) ou PR normal (task) | Revisão do tipo correspondente |
| 5 | Atualizar `last_reviewed` | Owner | Campo atualizado no frontmatter |

#### 3. Fluxo de Deprecação

- Nunca deletar um prompt ativo sem:
  1. Garantir que nenhum agente, skill ou task-prompt o referencia
  2. Alterar `status: active` → `status: deprecated` com `deprecated_at` e `deprecation_reason`
  3. Mover para pasta `archive/` ou prefixar com `archived-`

#### 4. Regra de Inception para runtime-prompts Python

Os 3 `runtime-prompts` pendentes do `agents-engine` devem seguir o fluxo abaixo antes de serem criados:

```
DOM-04 ou Arquiteto cria Issue de inception
  → Arquiteto Corporativo classifica como runtime-prompt
  → Owner: DOM-04 (ou responsável pelo skill Python)
  → Draft criado em agents-engine/src/deep_ion/<módulo>/prompts/
  → Revisão por DOM-05b (QA técnico) incluindo golden case
  → Merge após aprovação
  → Hash registrado automaticamente pelo AuditLedger (T05)
```

---

### Artefatos de Saída

- `docs/processos/gestores/fabrica-deep-ion/PROC-010_prompt-inception.md` — processo documentado com os 4 fluxos acima

---

### Critérios de Aceite

- [ ] PROC-010 publicado em `docs/processos/gestores/fabrica-deep-ion/`
- [ ] Fluxo principal (criação) com 7 etapas, responsáveis e critérios de aceite
- [ ] Fluxo de alteração com bump semântico definido (PATCH/MINOR/MAJOR)
- [ ] Fluxo de deprecação com regras de archive
- [ ] Regra específica para `runtime-prompts` Python documentada
- [ ] Documento revisado e aprovado pelo Tech Lead
- [ ] Os 3 `runtime-prompts` pendentes do `agents-engine` têm um path de inception definido para execução futura
