---
plan_id: PLAN-20260306-001
task_id: T07
title: "Designar owners e SLA de manutenção para os 32 task-prompts"
fase: "FASE 3 — Manutenibilidade Contínua"
agent: Gestor de Processos
status: PENDENTE
depends_on: [T03, T04]
parallel_with: []
gaps: [GP-09]
recomendacao: R-07
prioridade: P2
---

## Tarefa T07 — Owners e SLA dos 32 Task-Prompts

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 3 — Manutenibilidade Contínua  
**Agente executor:** Gestor de Processos  
**Depende de:** T03 (prompts com frontmatter atualizado), T04 (PROC-010 publicado)  
**Paralelo com:** —  
**Prioridade:** P2

---

### Objetivo

Eliminar o risco de desatualização silenciosa dos 32 `task-prompts` após mudanças no pipeline ou nos processos da fábrica. Cada task-prompt deve ter: um owner designado, um PROC relacionado (quando aplicável) e um SLA de revisão quando o processo que ele suporta for alterado.

Após esta tarefa, quando um gate ou etapa do pipeline mudar, o Gestor de Processos pode determinar imediatamente quais task-prompts precisam ser revisados e notificar seus owners.

**GAP endereçado:**
- **GP-09** — 32 prompts de workflow sem owner nem SLA de manutenção

---

### Contexto

O risco identificado no diagnóstico: o `di-full-cycle.prompt.md` orquestra toda uma demanda de ponta-a-ponta. Se ficar desatualizado após uma mudança de pipeline, TODAS as demandas executadas por ele seguirão o fluxo incorreto silenciosamente. A mesma lógica aplica aos prompts de compliance, auditoria e gestão de planos.

O processo PROC-010 (T04) define as regras de ciclo de vida. Esta tarefa popula o catálogo de owners e SLAs com base nesse processo.

---

### Critérios para Designação de Owner

| Família de prompt | Owner natural | Justificativa |
|-------------------|---------------|---------------|
| `di-brief-*` | Analista de Negócios | Governa o fluxo de brief |
| `di-uc-*` | Analista de Negócios | Governa criação de UCs |
| `di-ux-*` | UX Engineer | Governa o sub-pipeline UX |
| `di-critique-*, di-refine-us, di-prioritize-us, di-split-us` | Analista de Negócios | Refinamento de user stories |
| `di-refinar-prototipo-ux` | UX Engineer | Refinamento de protótipos |
| `di-compliance-ciclo` | Gestor de Processos | Governa verificação de conformidade |
| `di-audit-processo` | Gestor de Processos | Governa auditoria de processo |
| `di-doc-processo` | Gestor de Processos | Governa documentação de processo |
| `di-visao-projeto, di-refinar-visao-projeto` | Analista de Negócios | Governa visão estratégica |
| `di-prototipar` | UX Engineer | Governa prototipação |
| `di-full-cycle` | Gestor de Processos | Orquestra ciclo completo — impacto máximo |
| `di-exportar-tema` | UX Engineer | Governa exportação de tema |
| `di-setup-dev-resources` | Arquiteto Corporativo | Governa setup de recursos |
| `plan-*` | Arquiteto Corporativo | Governa gestão de planos |
| `scaffold-*` | Arquiteto Corporativo | Governa scaffolding |
| `commit-manager` | Tech Lead | Governa gestão de commits |
| `process-gap-report` | Diretor de Processos | Governa relatório de GAPs |

---

### Definição de SLA de Manutenção

Para cada task-prompt:

> **Regra geral:** Toda alteração em um `PROC-XXX` ou gate do pipeline dispara revisão obrigatória dos task-prompts que referenciam aquele processo, com SLA de **1 sprint** (≤2 semanas).

| Impacto da mudança de processo | SLA de revisão | Ação se owner não disponível |
|-------------------------------|----------------|------------------------------|
| Gate adicionado ou removido | 1 sprint | Escalada ao Tech Lead |
| Artefato obrigatório alterado | 1 sprint | Escalada ao Gestor de Processos |
| Nomenclatura ou template alterado | 2 sprints | Registro no backlog de processo |
| Agente responsável alterado | 1 sprint | Escalada ao Tech Lead |

---

### Artefato a Produzir

O Gestor de Processos deve produzir o arquivo `docs/processos/gestores/fabrica-deep-ion/task-prompt-owners.md` com a tabela abaixo preenchida para todos os 32 task-prompts:

```markdown
# Catálogo de Owners de Task-Prompts

## Metadados
- Versão: 1.0.0
- Última atualização: 2026-03-06
- Responsável pela manutenção: Gestor de Processos
- Processo relacionado: PROC-010

## Tabela de Owners e SLA

| prompt_id | Arquivo | Owner | Agente Consumidor | PROC Relacionado | SLA de Revisão |
|-----------|---------|-------|-------------------|------------------|----------------|
| TP-brief-new | di-brief-new.prompt.md | Analista de Negócios | analista-negocios | PROC-001 | 1 sprint |
| TP-brief-refine | di-brief-refine.prompt.md | Analista de Negócios | analista-negocios | PROC-001 | 1 sprint |
| ... | ... | ... | ... | ... | ... |

## Regras de Gatilho de Revisão
{copiar do PROC-010 a seção de SLA}
```

---

### Riscos Específicos

- **R-T07-1** — Os agentes VS Code (Analista, UX Engineer, etc.) não são pessoas — "owner" é uma convenção de responsabilidade, não uma notificação automática. O Gestor de Processos é responsável por garantir que a revisão ocorra no SLA definido.
- **R-T07-2** — O arquivo `task-prompt-owners.md` precisa ser atualizado cada vez que um novo task-prompt é criado via PROC-010 (T04). Documentar esse elo no PROC-010.

---

### Artefatos de Saída

- `docs/processos/gestores/fabrica-deep-ion/task-prompt-owners.md` — catálogo completo com owner e SLA de todos os 32 task-prompts

---

### Critérios de Aceite

- [ ] `task-prompt-owners.md` publicado com todos os 32 task-prompts mapeados
- [ ] Cada linha tem: `prompt_id`, `arquivo`, `owner`, `agente consumidor`, `PROC relacionado`, `SLA de revisão`
- [ ] A seção de regras de gatilho de revisão está alinhada com o PROC-010 (T04)
- [ ] O documento foi revisado pelo Tech Lead
- [ ] O elo entre PROC-010 e o catálogo de owners está documentado no PROC-010
