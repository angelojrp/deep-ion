---
plan_id: PLAN-20260306-002
task_id: T03
title: "Reatribuir tarefas T03 e T06 do PLAN-20260306-001 para os novos agentes"
fase: "FASE B — Atualização de Atribuições"
agent: Gestor de Processos
status: CONCLUIDO
depends_on: [T01, T02]
parallel_with: []
prioridade: P1
completed_at: "2026-03-06T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T03 — Reatribuição de Tarefas no PLAN-20260306-001

**Plano pai:** [PLAN-20260306-002](../PLAN-20260306-002_novos-agentes-governanca-prompts.md)  
**Fase:** FASE B — Atualização de Atribuições  
**Agente executor:** Gestor de Processos  
**Depende de:** T01 (Governador de Prompts criado) e T02 (QA Comportamental criado)  
**Paralelo com:** —  
**Prioridade:** P1

---

### Objetivo

Atualizar formalmente o PLAN-20260306-001 para refletir as novas atribuições de agentes em T03 e T06, garantindo que:
1. Todo agente que executar T03 ou T06 do PLAN-20260306-001 saberá que deve usar os novos agentes especializados
2. A rastreabilidade entre a decisão de reatribuição (este plano) e os artefatos alterados está documentada
3. A Matriz RACI (PROC-008) é atualizada com os 2 novos agentes

---

### Alterações a Realizar

#### 1. Arquivo de índice do PLAN-20260306-001

**Arquivo:** `docs/processos/gestores/fabrica-deep-ion/plans/PLAN-20260306-001_governanca-prompts/PLAN-20260306-001_governanca-prompts.md`

**Alteração na tabela de tarefas:**

| Campo | Tarefa | Antes | Depois |
|-------|--------|-------|--------|
| `Agente` | T03 | `DOM-04` | `Governador de Prompts` |
| `Agente` | T06 | `DOM-05b` | `QA Comportamental` |

Adicionar nota no índice:
```
> **Nota de reatribuição (PLAN-20260306-002):** As tarefas T03 e T06 foram reatribuídas em
> 2026-03-06 por análise de conformidade de agentes. T03 usava DOM-04 (sem skill de taxonomia
> de prompts); T06 usava DOM-05b (fora de escopo de behavioral LLM testing). Ver
> [PLAN-20260306-002](../../PLAN-20260306-002_novos-agentes-governanca-prompts/PLAN-20260306-002_novos-agentes-governanca-prompts.md).
```

#### 2. Arquivo de tarefa T03 do PLAN-20260306-001

**Arquivo:** `docs/processos/gestores/fabrica-deep-ion/plans/PLAN-20260306-001_governanca-prompts/tasks/PLAN-20260306-001_T03_frontmatter-governanca.md`

**Alterações:**

| Campo no frontmatter YAML | Antes | Depois |
|---------------------------|-------|--------|
| `agent` | `DOM-04` | `Governador de Prompts` |

**Adicionar seção ao corpo da tarefa:**
```markdown
> **Instrução de execução (atualizado por PLAN-20260306-002):**
> Esta tarefa deve ser executada pelo agente "Governador de Prompts" usando o task-prompt
> `di-prompt-apply-frontmatter.prompt.md`. Não usar DOM-04.
> O Governador de Prompts aplica automaticamente o schema correto conforme o tipo de cada
> artefato (SKILL-PG-01 para classificação + SKILL-PG-02 para aplicação em lote).
```

#### 3. Arquivo de tarefa T06 do PLAN-20260306-001

**Arquivo:** `docs/processos/gestores/fabrica-deep-ion/plans/PLAN-20260306-001_governanca-prompts/tasks/PLAN-20260306-001_T06_behavioral-regression-tests.md`

**Alterações:**

| Campo no frontmatter YAML | Antes | Depois |
|---------------------------|-------|--------|
| `agent` | `DOM-05b` | `QA Comportamental` |

**Adicionar seção ao corpo da tarefa:**
```markdown
> **Instrução de execução (atualizado por PLAN-20260306-002):**
> Esta tarefa deve ser executada pelo agente "QA Comportamental" em 2 fases:
> 1. Fase de design: usar `di-behavioral-regression-design.prompt.md` para especificar
>    os ≥3 golden cases por agente (SKILL-QAC-01 + SKILL-QAC-03)
> 2. Fase de implementação: usar `di-behavioral-regression-implement.prompt.md` para
>    gerar o código pytest (SKILL-QAC-02)
> DOM-05b permanece como revisor do código de teste depois de implementado (PR review).
```

#### 4. PROC-008 — Matriz RACI

**Arquivo:** `docs/processos/gestores/fabrica-deep-ion/PROC-008_raci.md`

Adicionar os 2 novos agentes à Matriz RACI:

**Adição na seção "Agentes Autônomos":**

| Etapa / Artefato | Governador de Prompts | QA Comportamental |
|-----------------|----------------------|-------------------|
| Frontmatter YAML de prompts | **R** | — |
| Inventário e classificação de prompt taxonomy | **R** | — |
| Designação de owners de task-prompts | C | — |
| Golden cases de regressão comportamental | — | **R** |
| Suite de behavioral regression tests | — | **R** |
| Constraint tests de system prompts | — | **R** |

**Adição na seção "Responsabilidades por Agente":**

```markdown
### Governador de Prompts
- **DEVE:** Classificar artefatos pela taxonomia de 4 tipos, aplicar frontmatter correto por tipo,
  auditar ownership de prompts, processar edições em lote com verificação YAML
- **NÃO DEVE:** Editar conteúdo comportamental de system prompts, executar código de aplicação,
  aprovar gates, calcular hash SHA-256 (responsabilidade do processo de merge em T05)
- **ESCALA QUANDO:** Tipo de prompt não determinável pela taxonomia; conflito entre frontmatter
  existente e schema esperado; solicitação de edição de conteúdo comportamental

### QA Comportamental
- **DEVE:** Projetar golden cases para behavioral regression (SKILL-QAC-01), implementar testes
  pytest com schema validation (SKILL-QAC-02), criar constraint tests por restrição declarada
  (SKILL-QAC-03)
- **NÃO DEVE:** Auditar cobertura de código de aplicação (DOM-05b), aprovar PRs, alterar
  system prompts para corrigir comportamentos detectados
- **ESCALA QUANDO:** System prompt de agente não tem restrições declaradas formalmente;
  LLM em CI não disponível para testes não-mock; golden case specification recebida sem
  aprovação prévia do Arquiteto Corporativo
```

---

### Critérios de Aceite da Tarefa

- [ ] Tabela de tarefas no índice de PLAN-20260306-001 atualizada (T03: DOM-04 → Governador de Prompts; T06: DOM-05b → QA Comportamental)
- [ ] Nota de reatribuição adicionada ao índice de PLAN-20260306-001 com link para este plano
- [ ] Frontmatter de T03 do PLAN-20260306-001 atualizado (`agent: Governador de Prompts`) + instrução de execução adicionada
- [ ] Frontmatter de T06 do PLAN-20260306-001 atualizado (`agent: QA Comportamental`) + instrução de execução adicionada
- [ ] PROC-008 atualizado com seções para os 2 novos agentes
- [ ] PR aberto com todas as alterações acima para aprovação do Gestor de Processos + Tech Lead
