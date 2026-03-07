---
plan_id: PLAN-20260306-001
task_id: T02
title: "Definir taxonomia formal dos 4 tipos de prompt da fábrica"
fase: "FASE 1 — Fundação de Governança"
agent: Arquiteto Corporativo
status: PENDENTE
depends_on: [T01]
parallel_with: []
gaps: [GP-03, GP-10]
recomendacao: R-01
prioridade: P1
---

## Tarefa T02 — Taxonomia de Tipos de Prompt

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 1 — Fundação de Governança  
**Agente executor:** Arquiteto Corporativo  
**Depende de:** T01  
**Paralelo com:** —  
**Prioridade:** P1 — pré-requisito de T03 e T04

---

### Objetivo

Estabelecer a taxonomia formal que classifica cada artefato de prompt da fábrica em um dos 4 tipos reconhecidos, com políticas de controle diferenciadas por tipo. Esta taxonomia é a fundação sobre a qual T03 (frontmatter), T04 (processo de inception), T05 (hash) e T06 (testes) se apoiam.

**GAPs endereçados:**
- **GP-03** — Prompts de sistema e de workflow misturados sem distinção formal
- **GP-10** — Ausência de taxonomia formal de prompt types

---

### Especificação da Taxonomia

O Arquiteto Corporativo deve produzir um documento de spec (`docs/processos/gestores/fabrica-deep-ion/prompt-taxonomy.md`) formalizando os 4 tipos abaixo com políticas diferenciadas:

#### Tipo 1 — `system-prompt`
- **Definição:** Arquivo que define a identidade, escopo, restrições e comportamento de um agente autônomo VS Code.
- **Localização canônica:** `.github/agents/*.md`
- **Exemplos:** `arquiteto-corporativo.md`, `gestor-processos.md`
- **Impacto de mudança:** Imediato, transversal ao agente. Uma linha altera todo o comportamento de produção.
- **Política de controle:** CODEOWNERS obrigatório + PR com ≥1 reviewer humano + bump de versão semântica + justificativa comportamental documentada.
- **Ciclo de vida:** `draft` → revisão por Tech Lead/PO → `active` → `deprecated` (nunca deletar, mover para `archive/`)

#### Tipo 2 — `instruction`
- **Definição:** Arquivo de instrução auto-injetado pelo VS Code com base em `applyTo` pattern (scoped) ou carregado automaticamente (global).
- **Localização canônica:** `.github/instructions/*.instructions.md` (scoped) ou `.github/*.md` (global)
- **Exemplos:** `arquiteto-instructions.md`, `process-governance.instructions.md`
- **Impacto de mudança:** Transversal (global) ou contextual (scoped). A instrução global afeta simulataneamente todos os agentes.
- **Política de controle:** CODEOWNERS obrigatório para globais + PR com ≥1 reviewer + bump de versão.
- **Ciclo de vida:** Igual ao `system-prompt`.

#### Tipo 3 — `task-prompt`
- **Definição:** Arquivo `.prompt.md` invocado explicitamente pelo usuário para executar um workflow ou tarefa específica. Não muda o comportamento do agente — contextualiza uma execução.
- **Localização canônica:** `.github/prompts/*.prompt.md`
- **Exemplos:** `di-brief-new.prompt.md`, `di-audit-processo.prompt.md`
- **Impacto de mudança:** Localizado ao workflow específico. Uma mudança afeta apenas quem invoca esse prompt.
- **Política de controle:** PR normal sem CODEOWNERS obrigatório; owner designado deve ser notificado quando pipeline ou processo referenciado pelo prompt mudar.
- **Ciclo de vida:** `draft` → `active` → `deprecated`.

#### Tipo 4 — `runtime-prompt`
- **Definição:** Arquivo de prompt injetado programaticamente pelo `agents-engine` Python durante execução de skill. Nunca invocado diretamente por usuário.
- **Localização canônica:** `agents-engine/src/deep_ion/*/prompts/*.txt` ou `*.md`
- **Exemplos:** `ux_analysis_v1.txt`, `ux_prototype_v1.txt` (criados por T04)
- **Impacto de mudança:** Programático e automático — afeta toda execução do skill que o injeta.
- **Política de controle:** Mesma rigidez que `system-prompt` + hash calculado e registrado no AuditLedger (T05 deste plano).
- **Ciclo de vida:** Gerenciado pela camada de código que o referencia; deprecação requer atualização simultânea do código chamador.

---

### Mapeamento Atual dos 40 Prompts Existentes

O Arquiteto Corporativo deve incluir no documento de taxonomia a tabela de classificação dos 40 artefatos existentes:

| Tipo | Quantidade | Localização |
|------|-----------|-------------|
| `system-prompt` | 6 | `.github/agents/` |
| `instruction` (global) | 1 | `.github/arquiteto-instructions.md` |
| `instruction` (scoped) | 1 | `.github/instructions/process-governance.instructions.md` |
| `task-prompt` | 32 | `.github/prompts/` |
| `runtime-prompt` | 0 existentes / 3 planejados | `agents-engine/src/deep_ion/dom_04_frontend/prompts/` |

---

### Artefatos de Saída

- `docs/processos/gestores/fabrica-deep-ion/prompt-taxonomy.md` — documento de spec com os 4 tipos, políticas diferenciadas e mapeamento de todos os 40 prompts existentes

---

### Critérios de Aceite

- [ ] Documento `prompt-taxonomy.md` publicado em `docs/processos/gestores/fabrica-deep-ion/`
- [ ] Os 4 tipos estão definidos com localização canônica, política de controle e ciclo de vida
- [ ] Todos os 40 prompts existentes estão classificados na tabela de mapeamento
- [ ] O documento foi revisado e aprovado pelo Tech Lead antes de T03 ser iniciada
- [ ] O schema de frontmatter obrigatório por tipo está especificado (insumo direto para T03)
