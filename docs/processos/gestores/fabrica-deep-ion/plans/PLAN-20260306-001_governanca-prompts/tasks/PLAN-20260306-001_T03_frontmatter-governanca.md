---
plan_id: PLAN-20260306-001
task_id: T03
title: "Adicionar frontmatter de governança em todos os 40 prompts existentes"
fase: "FASE 1 — Fundação de Governança"
agent: Governador de Prompts
status: PENDENTE
depends_on: [T02]
parallel_with: [T04]
gaps: [GP-02]
recomendacao: R-02
prioridade: P1
---

## Tarefa T03 — Frontmatter de Governança nos 40 Prompts

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 1 — Fundação de Governança  
**Agente executor:** Governador de Prompts  
**Depende de:** T02 (taxonomia aprovada — define schema por tipo)  
**Paralelo com:** T04  
**Prioridade:** P1 — pré-requisito de T05 e T06

> **Instrução de execução (atualizado por PLAN-20260306-002):**
> Esta tarefa deve ser executada pelo agente "Governador de Prompts" usando o task-prompt
> `di-prompt-apply-frontmatter.prompt.md`. Não usar DOM-04.
> O Governador de Prompts aplica automaticamente o schema correto conforme o tipo de cada
> artefato (SKILL-PG-01 para classificação + SKILL-PG-02 para aplicação em lote).

---

### Objetivo

Estabelecer a linha de base (`baseline`) de governança da fábrica adicionando frontmatter YAML padronizado a todos os 40 artefatos de prompt existentes. Após esta tarefa, cada prompt terá: identificador único, versão semântica inicial, tipo (da taxonomia T02), owner, consumers, status e data de revisão. Isso cria a rastreabilidade mínima para que T05 (hash) e T06 (testes de regressão) sejam implementados com precisão.

**GAP endereçado:**
- **GP-02** — Ausência de metadados de rastreabilidade em todos os 40 prompts

---

### Schema de Frontmatter por Tipo

> O schema definitivo deve ser validado contra o documento `prompt-taxonomy.md` produzido por T02. Os schemas abaixo são referências baseadas no diagnóstico DIAG-20260306-002 (R-02).

#### Para `system-prompt` (6 arquivos em `.github/agents/`)

```yaml
---
prompt_id: SP-<slug-do-agente>
version: 1.0.0
type: system-prompt
owner: tech-lead
consumers:
  - <nome-do-agente-vs-code>
status: active  # draft | active | deprecated
last_reviewed: "2026-03-06"
sha256: ""  # Calculado e preenchido pelo processo de merge (T05)
---
```

#### Para `instruction` (2 arquivos)

```yaml
---
prompt_id: INS-<slug>
version: 1.0.0
type: instruction
scope: global  # global | scoped
apply_to: "**"  # ou o pattern do applyTo
owner: tech-lead
status: active
last_reviewed: "2026-03-06"
sha256: ""
---
```

#### Para `task-prompt` (32 arquivos em `.github/prompts/`)

```yaml
---
prompt_id: TP-<slug>
version: 1.0.0
type: task-prompt
owner: <papel-responsavel>  # ex: analista-negocios, gestor-processos
consumers:
  - <agente-ou-usuario>
status: active
last_reviewed: "2026-03-06"
related_proc: ""  # ex: PROC-001, PROC-002
---
```

---

### Lista Completa dos 40 Arquivos a Atualizar

**6 system-prompts:**
- `.github/agents/arquiteto-corporativo.md` → `SP-arquiteto-corporativo`
- `.github/agents/analista-negocios.md` → `SP-analista-negocios`
- `.github/agents/diretor-processos.md` → `SP-diretor-processos`
- `.github/agents/gestor-processos.md` → `SP-gestor-processos`
- `.github/agents/ux-engineer.md` → `SP-ux-engineer`
- `.github/agents/validador-ux.md` → `SP-validador-ux`

**2 instructions:**
- `.github/arquiteto-instructions.md` → `INS-arquiteto-global`
- `.github/instructions/process-governance.instructions.md` → `INS-process-governance`

**32 task-prompts:**
- `.github/prompts/di-brief-new.prompt.md` → `TP-brief-new`
- `.github/prompts/di-brief-refine.prompt.md` → `TP-brief-refine`
- `.github/prompts/di-uc-new.prompt.md` → `TP-uc-new`
- `.github/prompts/di-uc-update.prompt.md` → `TP-uc-update`
- `.github/prompts/di-uc-exec.prompt.md` → `TP-uc-exec`
- `.github/prompts/di-ux-page.prompt.md` → `TP-ux-page`
- `.github/prompts/di-ux-mock.prompt.md` → `TP-ux-mock`
- `.github/prompts/di-ux-component.prompt.md` → `TP-ux-component`
- `.github/prompts/di-ux-refactor.prompt.md` → `TP-ux-refactor`
- `.github/prompts/di-ux-validar-spec.prompt.md` → `TP-ux-validar-spec`
- `.github/prompts/di-ux-validar-prompts.prompt.md` → `TP-ux-validar-prompts`
- `.github/prompts/di-ux-validar-completo.prompt.md` → `TP-ux-validar-completo`
- `.github/prompts/di-critique-us.prompt.md` → `TP-critique-us`
- `.github/prompts/di-refine-us.prompt.md` → `TP-refine-us`
- `.github/prompts/di-refinar-prototipo-ux.prompt.md` → `TP-refinar-prototipo-ux`
- `.github/prompts/di-prioritize-us.prompt.md` → `TP-prioritize-us`
- `.github/prompts/di-split-us.prompt.md` → `TP-split-us`
- `.github/prompts/di-compliance-ciclo.prompt.md` → `TP-compliance-ciclo`
- `.github/prompts/di-audit-processo.prompt.md` → `TP-audit-processo`
- `.github/prompts/di-doc-processo.prompt.md` → `TP-doc-processo`
- `.github/prompts/di-visao-projeto.prompt.md` → `TP-visao-projeto`
- `.github/prompts/di-refinar-visao-projeto.prompt.md` → `TP-refinar-visao-projeto`
- `.github/prompts/di-prototipar.prompt.md` → `TP-prototipar`
- `.github/prompts/di-full-cycle.prompt.md` → `TP-full-cycle`
- `.github/prompts/di-exportar-tema.prompt.md` → `TP-exportar-tema`
- `.github/prompts/di-setup-dev-resources.prompt.md` → `TP-setup-dev-resources`
- `.github/prompts/plan-approve.prompt.md` → `TP-plan-approve`
- `.github/prompts/plan-execute-approved.prompt.md` → `TP-plan-execute-approved`
- `.github/prompts/plan-frontendReactSpaScaffold.prompt.md` → `TP-plan-frontend-react-spa`
- `.github/prompts/scaffold-modulo.prompt.md` → `TP-scaffold-modulo`
- `.github/prompts/commit-manager.prompt.md` → `TP-commit-manager`
- `.github/prompts/process-gap-report.prompt.md` → `TP-process-gap-report`

> ⚠️ A lista acima é baseada no inventário do DIAG-20260306-002. DOM-04 deve confirmar os nomes exatos dos arquivos antes de iniciar o batch, pois pode haver variações de nomenclatura.

---

### Estratégia de Execução (Batch)

DOM-04 deve executar a atualização em lote seguindo a ordem:
1. Primeiro os 2 `instructions` (menor risco, menor impacto de validação)
2. Depois os 32 `task-prompts` (maior volume, agrupados por família di-ux, di-brief, etc.)
3. Por último os 6 `system-prompts` (maior criticidade — os CODEOWNERS de T01 devem estar ativos)

Toda atualização em lote deve ser enviada via **PR único por tipo** (3 PRs total), não em commits diretos, para permitir revisão diferenciada por categoria.

---

### Riscos Específicos

- **R-T03-1** — Frontmatter YAML inválido (sintaxe errada, caracteres especiais no título) pode impedir o carregamento do prompt pelo VS Code. Validar com `yamllint` antes de cada PR.
- **R-T03-2** — Prompts com frontmatter YAML já existente (ex: `.github/arquiteto-instructions.md`, `.github/instructions/process-governance.instructions.md`) devem ter o frontmatter **mesclado**, não substituído. Leitura cuidadosa antes do update.
- **R-T03-3** — Campo `sha256` não deve ser preenchido manualmente — deixar em branco ou com placeholder `""`. Será calculado automaticamente pelo processo implementado em T05.

---

### Artefatos de Saída

- 40 arquivos de prompt atualizados com frontmatter de governança válido
- 3 PRs (1 por tipo: instructions, task-prompts, system-prompts)

---

### Critérios de Aceite

- [ ] Todos os 8 arquivos de tipo `system-prompt` e `instruction` têm frontmatter com campos obrigatórios: `prompt_id`, `version`, `type`, `owner`, `status`, `last_reviewed`
- [ ] Todos os 32 `task-prompts` têm frontmatter com campos obrigatórios: `prompt_id`, `version`, `type`, `owner`, `status`
- [ ] Nenhum arquivo de prompt tem frontmatter YAML inválido (validado por `yamllint`)
- [ ] Todos os `prompt_id` são únicos no repositório
- [ ] PRs de system-prompts foram revisados pelo owner designado no CODEOWNERS (validação de T01)
- [ ] Campo `sha256` está em branco (não preenchido manualmente)
