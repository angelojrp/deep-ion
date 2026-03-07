# DIAG-20260307-001 · 01 — Ecossistema Atual — Inventário Real

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Emitido por:** Diretor de Squads | **Data:** 07/03/2026

---

## Inventário de Agentes — Acoplamento ao Projeto

| Agente | Tipo de Escopo | Nível de Acoplamento ao deep-ion |
|--------|----------------|----------------------------------|
| Analista de Negócios | Operacional | Alto — referencia pipeline DOM-01..DOM-02 e artefatos deep-ion |
| Arquiteto Corporativo | Operacional | Alto — Spring Modulith, `architecture/`, estrutura de módulos deep-ion |
| Backend Java Júnior | Operacional | **Muito Alto** — hardcoded `backoffice/`, `net.deepion` |
| Backend Java Pleno | Operacional | **Muito Alto** — hardcoded `backoffice/`, Spring Boot 3.4.0 deep-ion |
| Backend Java Sênior | Operacional | **Muito Alto** — hardcoded `backoffice/`, toda a stack declarada explicitamente |
| UX Engineer | Operacional | **Muito Alto** — hardcoded `frontend/`, versões exatas da stack deep-ion |
| Tech Lead | Operacional | **Muito Alto** — módulos `frontend/`, `backoffice/`, `agents-engine/` deep-ion |
| Validador UX | Operacional | **Muito Alto** — paths hardcoded de arquivos específicos do `agents-engine/` |
| QA Comportamental | Operacional | Alto — paths `agents-engine/tests/behavioral/` hardcoded |
| Gestor de Processos | Estratégico | Baixo — metodológico, usa pipeline como referência |
| Gestor de Squads | Estratégico | Baixo — operacional, usa definições como entrada |
| Diretor de Processos | Estratégico | **Nulo** — 100% metodológico |
| Diretor de Squads | Estratégico | **Nulo** — 100% estratégico |
| Governador de Prompts | Especialista | Baixo — governança de prompts, agnóstico de domínio |

---

## Classificação por Tipo

| Categoria | Definição | Agentes atuais |
|-----------|-----------|----------------|
| **Tipo U — Universal** | Agnóstico de projeto, stack e domínio. Reutilizável sem modificação. | Diretor de Processos, Diretor de Squads, Gestor de Processos, Gestor de Squads, Governador de Prompts |
| **Tipo P — Especialista de Projeto** | Conhece o projeto em profundidade. Gerado via template no kickoff. | Backend Java Júnior/Pleno/Sênior, UX Engineer, Tech Lead, Analista de Negócios, Arquiteto Corporativo, Validador UX, QA Comportamental |
| **Tipo H — Híbrido** | Core agnóstico + seção de contexto de projeto injetável | *(nenhum ainda — categoria para novos agentes)* |

---

*← [Índice](00_indice.md) | Próximo: [GAP-1 — Handoff e Protocolo](02_GAP-01_handoff-protocolo.md) →*
