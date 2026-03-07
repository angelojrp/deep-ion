# DIAG-20260307-001 · 08 — GAP-5: Engenharia de Contexto sem Cobertura de Agente

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-ecossistema.md) | **Índice:** [00_indice.md](00_indice.md)
**Prioridade:** **P1 — Crítico** | **Emitido por:** Diretor de Squads | **Data:** 07/03/2026
**Origem:** Cross-referência com [DIAG-20260306-001](../../../processos/diretoria/DIAG-20260306-001_maturidade-global-processos.md) (G-01, G-07) e [DIAG-20260306-003](../../../processos/diretoria/DIAG-20260306-003_engenharia-contexto.md) (GC-01..GC-10), emitidos pelo Diretor de Processos

---

## Contexto — O que o Diretor de Processos Identificou

O Diretor de Processos identificou em seu diagnóstico de maturidade global (DIAG-20260306-001) que a **Engenharia de Contexto** é o gap mais estrutural da fábrica:

> *"A fábrica possui uma arquitetura de governança sofisticada no papel [...]. O risco está na camada AI em si, que opera atualmente sem três controles fundamentais: (1) Contexto indeterminado — nenhum agente tem seu ContextPacket formal definido; (2) Prompts não versionados; (3) Saídas não validadas por esquema."*

O DIAG-20260306-003 aprofundou este diagnóstico identificando 10 sub-gaps críticos (GC-01..GC-10), todos relacionados à ausência de uma disciplina formal de engenharia de contexto na fábrica.

---

## Diagnóstico de Squad

A análise cruzada com os diagnósticos do Diretor de Processos revela que **nenhum agente existente cobre a disciplina de Engenharia de Contexto**:

| Responsabilidade de Engenharia de Contexto | Agente atual | Cobertura |
|--------------------------------------------|--------------|-----------|
| Definir ContextPacket por agente (GC-01) | ❌ Ninguém | 🔴 Gap |
| Especificar token budget por agente (GC-02) | ❌ Ninguém | 🔴 Gap |
| Definir política de priorização de fontes (GC-05) | ❌ Ninguém | 🔴 Gap |
| Especificar Context Assembly Layer no agents-engine (GC-09) | ❌ Ninguém | 🔴 Gap |
| Definir validação de completude do contexto (GC-10) | ❌ Ninguém | 🔴 Gap |
| Especificar Context Freeze por gate (GC-03/GC-06) | ❌ Ninguém | 🔴 Gap |
| Definir estratégia anti-drift entre fases (GC-04/GC-07) | ❌ Ninguém | 🔴 Gap |
| Criar `SKILL-context-engineering.md` (R-01 do Diretor de Processos) | ❌ Ninguém | 🔴 Gap |

**Distinção importante:** O Python AI Engineer (proposto em GAP-2) *implementa* o código do Context Assembly Layer no `agents-engine/`. Mas o **quê** implementar — os ContextPackets, as políticas de budget, as regras de freeze e drift — precisa ser **especificado e governado** por uma autoridade de contexto. Esse papel não existe.

---

## Problemas Identificados

| Problema | Evidência |
|----------|-----------|
| Nenhum agente define ContextPacket por agente | DIAG-20260306-003: tabela "Problema por Agente" — todos os agentes DOM-01..DOM-05b recebem "depende do que o usuário mencionar" |
| Nenhum agente especifica o token budget | DIAG-20260306-003 GC-02: "conteúdo é truncado silenciosamente" — nenhuma SKILL nem agent spec define limites |
| Context drift entre fases do pipeline não tem dono | DIAG-20260306-003 GC-03: exemplo concreto de BAR v1.0 → v1.1 causando falso negativo no QA |
| Context Assembly Layer do agents-engine não tem spec | DIAG-20260306-003 GC-09: "cada agente implementará sua própria escolha ad-hoc sobre o que injetar" |
| `SKILL-context-engineering.md` referenciada como R-01 mas sem agente responsável | DIAG-20260306-001 R-01: "Sem esse documento, todos os agentes futuros serão implementados de forma ad-hoc" |

**Impacto:** Sem um Context Engineer, todos os agentes DOM-XX (especialmente DOM-03, DOM-04, DOM-05b — ainda não implementados) serão construídos com contexto ad-hoc e não determinístico. O comportamento da fábrica não será reproduzível.

---

## Recomendação

### R5.1 — Criar agente `context-engineer.md` — P1 Crítico

**Perfil proposto:**

| Campo | Definição |
|-------|-----------|
| **Nome** | Context Engineer |
| **Responsabilidade** | Definir e manter os ContextPackets de cada agente DOM-XX, o token budget protocol, as políticas de priorização de fontes de contexto, e o contrato de Context Freeze por gate |
| **Gatilho** | (a) Novo agente DOM-XX sendo especificado/implementado; (b) Revisão de budget ou política de contexto; (c) Diagnóstico de context drift; (d) Especificação da Context Assembly Layer do agents-engine |
| **Tipo** | **Universal (Tipo U)** — agnóstico de stack; a disciplina de engenharia de contexto é independente de Java/Python/TS |
| **Tools** | `read`, `search`, `editFiles` (somente em `architecture/skills/`, `docs/`, `agents-engine/src/**/context/`) |
| **Restrições** | Nunca implementa código de aplicação (delega ao Python AI Engineer); nunca aprova gates; nunca edita system prompts de agentes (escopo do Governador de Prompts) |
| **workingDirectory** | `architecture/skills/` (primário) + `docs/` |
| **Outputs esperados** | `SKILL-context-engineering.md`, ContextPacket specs por agente, Context Assembly Layer spec, `context_budget.yaml` |

**Relacionamentos com outros agentes:**

| Agente | Relação |
|--------|---------|
| **Python AI Engineer** | Recebe do Context Engineer o spec da Context Assembly Layer e dos ContextPackets para implementar no `agents-engine/` |
| **Arquiteto Corporativo** | Colabora ao especificar quais artefatos de gate fazem parte do ContextPacket (ADR, blueprint, UCs) |
| **Gestor de Processos** | Valida que o ContextPacket de cada AGate está alinhado com as definições de PROC-00x |
| **QA Comportamental** | Recebe do Context Engineer os critérios de completude de contexto para incluir nos golden tests |
| **Governador de Prompts** | Parceiro: enquanto o Governador governa metadados de prompts, o Context Engineer governa o conteúdo de contexto injetado em tempo de execução |
| **Diretor de Processos** | Destinatário estratégico: o Context Engineer operacionaliza as recomendações R-01, R-04 e R-08 do DIAG-20260306-001 |

---

### R5.2 — Análise de Cobertura dos Demais Processos GAPs pelo Ecossistema Atual

Com base na análise cruzada com DIAG-20260306-001/002/003, os demais GAPs de processo têm **cobertura suficiente** no ecossistema atual ou proposto:

| GAP do Processo | Agente Responsável | Status |
|-----------------|-------------------|--------|
| G-02/GP-xx — Gestão de Prompts (versionamento, frontmatter, hash) | **Governador de Prompts** (existente) | ✅ Coberto — Governador define frontmatter, taxonomia, ownership |
| G-08 — Behavioral Regression Tests para agentes | **QA Comportamental** (existente) | ✅ Coberto — escopo do agente inclui golden tests para LLMs |
| G-03 — Output Schema Enforcement (Pydantic) | **Python AI Engineer** (proposto P1) | ✅ Coberto — implementa validadores no agents-engine |
| G-04 — Implementação DOM-03, DOM-04, DOM-05b | **Python AI Engineer** (proposto P1) | ✅ Coberto — responsabilidade central do agente |
| G-10 — DOM-03 spec de acesso a blueprints | **Arquiteto Corporativo** + **Context Engineer** | ✅ Coberto — ContextPacket definirá estrutura de blueprint |
| G-09 — Reclassificação pós-Gate 2 (workflow) | **DevOps Engineer** (proposto P2) | ✅ Coberto — GitHub Action CI/CD |
| G-11 — SLA Watchdog | **DevOps Engineer** (proposto P2) | ✅ Coberto — GitHub Action cron |
| G-12 — PLAN-20260302-001 pendente sem aprovador | **Gestor de Processos** (existente) | ✅ Processo de governança, não de squad |

**Observação sobre o Governador de Prompts:** O DIAG-20260306-002 identifica GP-06 (hash no Audit Ledger) e GP-08 (gate de revisão para alteração de system prompt) como gaps que vão além do Governador de Prompts. Esses gaps requerem **processo + DevOps** (GitHub Action de hash + CODEOWNERS gate), não um novo agente.

---

## Checklist de Execução — Gestor de Squads

**P1 — Urgente**
- [ ] Criar `.github/agents/context-engineer.md` com o perfil definido em R5.1
- [ ] Definir `SKILL-context-engineering.md` como artefato de responsabilidade do Context Engineer

**A ser executado pelo Context Engineer (após criação):**
- [ ] Produzir `SKILL-context-engineering.md` com ContextPacket por agente DOM-XX
- [ ] Especificar Context Assembly Layer para o Python AI Engineer implementar

---

*← [GAP-4 — Kickoff](05_GAP-04_kickoff-templates.md) | [Índice](00_indice.md) | Próximo: [RACI e Perfis Humanos](06_RACI-perfis-humanos.md) →*
