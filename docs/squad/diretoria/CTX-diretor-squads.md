---
context: Diretor de Squads
updated: 2026-03-07
source: DIAG-20260307-001
---

# Contexto — Diretor de Squads

## Mapa de Referência — Agentes Existentes

| Agente | Domínio Principal | Nível | Tipo | Acoplamento |
|--------|-------------------|-------|------|-------------|
| Analista de Negócios | Discovery, requisitos, casos de uso | Pleno | P | Alto |
| Arquiteto Corporativo | Spring Modulith, ADRs, blueprints | Sênior | P | Alto |
| Backend Java Júnior | CRUD, bugfix simples, testes unitários | Júnior | P | Muito Alto |
| Backend Java Pleno | Features completas, módulo único | Pleno | P | Muito Alto |
| Backend Java Sênior | Decisões arquiteturais, cross-módulo | Sênior | P | Muito Alto |
| Diretor de Processos | Evolução estratégica de processos | Diretor | U | Nulo |
| Diretor de Squads | Composição e governança de squads | Diretor | U | Nulo |
| Gestor de Processos | Auditoria e conformidade operacional | Gestor | U | Baixo |
| Gestor de Squads | Gestão operacional de squads | Gestor | U | Baixo |
| Governador de Prompts | Ciclo de vida de artefatos de prompt | Especialista | U | Baixo |
| QA Comportamental | Testes comportamentais de agentes LLM | Especialista | P | Alto |
| Tech Lead | Implementação e coordenação técnica | Tech Lead | P | Muito Alto |
| UX Engineer | Frontend React, shadcn/ui, Tailwind | Sênior | P | Muito Alto |
| Validador UX | Auditoria de specs e artefatos UX | QA | P | Muito Alto |

**Legenda de Tipo:** U = Universal (agnóstico de projeto) · P = Especialista de Projeto · H = Híbrido (core + contexto injetável)

---

## Mapa de SKILLs da Fábrica

| Contexto analisado | SKILL a consultar |
|--------------------|--------------------|
| Agentes DOM-01..DOM-05b e responsabilidades | `architecture/skills/SKILL-agentes.md` |
| RACI, responsabilidades humanas e autônomas | `architecture/skills/SKILL-responsabilidades.md` |
| Pipeline, gates, fluxo de demandas | `architecture/skills/SKILL-pipeline.md` |
| Processos operacionais catalogados | `architecture/skills/SKILL-processos.md` |
| Convenções técnicas | `architecture/skills/SKILL-convencoes.md` |
| Classificação T0→T3, scoring | `architecture/skills/SKILL-modelo-classificacao.md` |

---

## Diagnóstico Ativo — DIAG-20260307-001

**Arquivo:** [`DIAG-20260307-001/00_indice.md`](DIAG-20260307-001/00_indice.md)
**Escopo:** Ecossistema de agentes IA, gaps de cobertura, acoplamento ao projeto, templates de kickoff

### Gaps Identificados

| # | Gap | Prioridade | Arquivo |
|---|-----|------------|---------|
| GAP-1 | Protocolo de handoff IA↔Humano ausente | **P1** | [02_GAP-01](DIAG-20260307-001/02_GAP-01_handoff-protocolo.md) |
| GAP-2 | Agentes faltantes para cobertura do pipeline | **P1–P3** | [03_GAP-02](DIAG-20260307-001/03_GAP-02_agentes-faltantes.md) |
| GAP-3 | Acoplamento excessivo ao projeto deep-ion | **P2** | [04_GAP-03](DIAG-20260307-001/04_GAP-03_acoplamento-projeto.md) |
| GAP-4 | Ausência de templates e processo de kickoff | **P2–P3** | [05_GAP-04](DIAG-20260307-001/05_GAP-04_kickoff-templates.md) |
| GAP-5 | Engenharia de Contexto sem cobertura de agente (cross: DIAG-20260306-001/003) | **P1** | [08_GAP-05](DIAG-20260307-001/08_GAP-05_engenharia-contexto.md) |

### Backlog de Ações Prioritárias

| Prioridade | Ação |
|------------|------|
| **P1** | Criar agente `context-engineer.md` ← **NOVO** — GAP-5 (via análise cruzada com Diretor de Processos) |
| **P1** | Criar agente `risk-arbiter.md` |
| **P1** | Criar agente `python-ai-engineer.md` |
| **P1** | Criar `SKILL-handoff.md` + seção de handoff em cada agente |
| **P2** | Classificar agentes U/P/H e separar core de contexto |
| **P2** | Criar `SKILL-project-variables.md` |
| **P2** | Criar agente `devops-engineer.md` |
| **P3** | Criar agente `security-auditor.md` |
| **P3** | Criar `SKILL-kickoff-squad.md` |
| **P3** | Criar agente `release-manager.md` |
| **P3** | Criar templates de kickoff (backend, frontend, python, tech-lead) |

---

*Fonte: [DIAG-20260307-001](DIAG-20260307-001/00_indice.md) · Emitido em 07/03/2026 pelo Diretor de Squads*
