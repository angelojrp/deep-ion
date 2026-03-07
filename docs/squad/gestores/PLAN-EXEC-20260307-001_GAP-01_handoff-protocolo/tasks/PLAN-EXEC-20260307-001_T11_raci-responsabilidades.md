---
plan_id: PLAN-EXEC-20260307-001
task_id: T11
title: "Atualizar RACI em SKILL-responsabilidades.md com agentes de governança"
agent: "Agente IA"
status: CONCLUÍDA
depends_on: [T01, T02, T03, T04, T05, T06, T07, T08, T09, T10]
parallel_with: []
artefatos: [A11]
prioridade: P1
---

## Tarefa T11 — Atualizar RACI em `SKILL-responsabilidades.md`

**Plano pai:** [PLAN-EXEC-20260307-001](../PLAN-EXEC-20260307-001_GAP-01_handoff-protocolo.md)  
**Agente executor:** Agente IA  
**Arquivo alvo:** `architecture/skills/SKILL-responsabilidades.md`  
**Ação:** Adicionar nova seção RACI + blocos de responsabilidades individuais  
**Depende de:** T01..T10 (todos concluídos)  
**Paralelo com:** —  
**Prioridade:** P1

---

### Objetivo

Estender a Matriz RACI de `SKILL-responsabilidades.md` para cobrir os **agentes de governança** (Gestor de Squads, Diretor de Squads, Governador de Prompts, QA Comportamental, Risk Arbiter) e adicionar os blocos de responsabilidades individuais para cada um desses agentes.

**Ler o arquivo completo antes de editar. Não remover nem alterar conteúdo existente.**

---

### Contexto a Carregar

```
1. architecture/skills/SKILL-responsabilidades.md  (ler completo)
```

---

### Especificação do Conteúdo a Adicionar

#### 1. Nova seção na tabela RACI (adicionar após a última entrada da tabela existente de Agentes Autônomos)

```markdown
### Agentes de Governança

| Etapa / Artefato | Gestor de Squads | Diretor de Squads | Governador de Prompts | QA Comportamental | Risk Arbiter* |
|------------------|-----------------|-------------------|-----------------------|-------------------|---------------|
| Todos os gates (monitoramento) | **I** | I | — | — | — |
| Handoff Card (validação pós-gate) | **C** | — | — | — | — |
| Relatório de saúde de squad | **R** | I | — | — | — |
| Escalada crítica entre agentes | **R** | **A** | — | — | **C** |
| Auditoria de consistência BAR→UC→RN | — | — | — | **R** | — |
| Auditoria de prompts / agentes | — | — | **R** | — | — |
| Decisão em impasse (bloqueio) | C | **A** | — | — | **R** |

*Risk Arbiter: agente proposto (P1 do GAP-2)
```

#### 2. Blocos de responsabilidades individuais (adicionar após `### DOM-05b`)

```markdown
### Gestor de Squads
- **DEVE:** Monitorar handoffs, auditar desvios de escopo, registrar relatórios em `docs/squad/gestores`
- **NÃO DEVE:** Editar código, agentes, workflows ou executar comandos de terminal
- **ESCALA QUANDO:** Handoff IA→Humano ignorado; gate crítico aprovado sem revisor obrigatório; SLA ultrapassado

### Diretor de Squads
- **DEVE:** Definir composição estratégica de squads, emitir diagnósticos, aprovar escaladas críticas
- **NÃO DEVE:** Executar tarefas operacionais, editar artefatos de agentes diretamente
- **ESCALA QUANDO:** Desvio sistêmico insolúvel no nível operacional

### Governador de Prompts
- **DEVE:** Auditar qualidade e conformidade de prompts, revisar criação/modificação de agentes
- **NÃO DEVE:** Implementar código, aprovar gates de negócio ou técnicos
- **ESCALA QUANDO:** Prompt com risco de comportamento não determinístico ou fora de escopo

### QA Comportamental
- **DEVE:** Auditar consistência BAR→UC→RN, gerar TestPlan, bloquear Gate 2 quando inconsistências críticas
- **NÃO DEVE:** Aprovar gates, alterar artefatos de requisitos, operar sem BAR + Use Cases
- **ESCALA QUANDO:** Inconsistência crítica BAR→UC irresolúvel; LGPD implicado sem DPO
```

---

### Critério de Conclusão

- [ ] Seção `### Agentes de Governança` adicionada na tabela RACI de `SKILL-responsabilidades.md`
- [ ] Bloco `### Gestor de Squads` adicionado com DEVE / NÃO DEVE / ESCALA QUANDO
- [ ] Bloco `### Diretor de Squads` adicionado
- [ ] Bloco `### Governador de Prompts` adicionado
- [ ] Bloco `### QA Comportamental` adicionado
- [ ] Conteúdo existente do arquivo não foi alterado ou removido
