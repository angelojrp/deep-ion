# DIAG-20260307-001 · 07 — Resumo Consolidado de Prioridades

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)
**Emitido por:** Diretor de Squads | **Data:** 07/03/2026 | **Atualizado:** 07/03/2026 — v1.1 (inclui GAP-5 via análise cruzada com Diretor de Processos)

---

## Backlog de Ações — Por Prioridade

| Prioridade | GAP | Ação | Arquivo de Referência | Impacto |
|------------|-----|------|-----------------------|--------|
| **P1** | GAP-5 | Criar agente `Context Engineer` | [08_GAP-05](08_GAP-05_engenharia-contexto.md) | Sem Context Engineer, todos os DOM-XX serão implementados com contexto ad-hoc — comportamento não reproduzível |
| **P1** | GAP-2 | Criar agente `Risk Arbiter` | [03_GAP-02](03_GAP-02_agentes-faltantes.md) | Pipeline trava quando nenhum agente sabe o que fazer |
| **P1** | GAP-2 | Criar agente `Python AI Engineer` | [03_GAP-02](03_GAP-02_agentes-faltantes.md) | `agents-engine/` sem cobertura é uma lacuna de 100% |
| **P1** | GAP-1 | Criar `SKILL-handoff.md` + seção de handoff em cada agente | [02_GAP-01](02_GAP-01_handoff-protocolo.md) | Rastreabilidade de responsabilidade é a base da fábrica |
| **P2** | GAP-3 | Classificar agentes (U/P/H) e separar core de contexto | [04_GAP-03](04_GAP-03_acoplamento-projeto.md) | Habilita reutilização cross-projeto |
| **P2** | GAP-4 | Criar `SKILL-project-variables.md` | [05_GAP-04](05_GAP-04_kickoff-templates.md) | Pré-requisito para templates e kickoff padronizado |
| **P2** | GAP-2 | Criar agente `DevOps Engineer` | [03_GAP-02](03_GAP-02_agentes-faltantes.md) | CI/CD sem agente = gargalo no Tech Lead; também cobre G-09 e G-11 do processo |
| **P3** | GAP-2 | Criar agente `Security Auditor` | [03_GAP-02](03_GAP-02_agentes-faltantes.md) | OWASP é responsabilidade estratégica |
| **P3** | GAP-4 | Criar `SKILL-kickoff-squad.md` | [05_GAP-04](05_GAP-04_kickoff-templates.md) | Formaliza processo de onboarding de novo projeto |
| **P3** | GAP-2 | Criar agente `Release Manager` | [03_GAP-02](03_GAP-02_agentes-faltantes.md) | Libera o Tech Lead de tarefas de release manual |
| **P3** | GAP-1 | Estender RACI para cobrir agentes de governança | [02_GAP-01](02_GAP-01_handoff-protocolo.md) | Completude da matriz de responsabilidades |

---

## Visão Consolidada de Novos Artefatos

### Agentes a Criar

| Agente | Tipo | Prioridade | GAP de Origem | Arquivo |
|--------|------|------------|---------------|---------|
| `context-engineer.md` | Universal (U) | **P1** | GAP-5 (Engenharia de Contexto) | `.github/agents/context-engineer.md` |
| `risk-arbiter.md` | Universal (U) | **P1** | GAP-2 | `.github/agents/risk-arbiter.md` |
| `python-ai-engineer.md` | Tipo P | **P1** | GAP-2 | `.github/agents/python-ai-engineer.md` |
| `devops-engineer.md` | Tipo H | **P2** | GAP-2 | `.github/agents/devops-engineer.md` |
| `security-auditor.md` | Universal | **P3** | GAP-2 | `.github/agents/security-auditor.md` |
| `release-manager.md` | Tipo H | **P3** | GAP-2 | `.github/agents/release-manager.md` |

### SKILLs a Criar

| SKILL | Prioridade | Caminho | GAP de Origem |
|-------|------------|---------|----------------|
| `SKILL-context-engineering.md` | **P1** | `architecture/skills/SKILL-context-engineering.md` | GAP-5 (responsabilidade do Context Engineer) |
| `SKILL-handoff.md` | **P1** | `architecture/skills/SKILL-handoff.md` | GAP-1 |
| `SKILL-project-variables.md` | **P2** | `architecture/skills/SKILL-project-variables.md` | GAP-4 |
| `SKILL-kickoff-squad.md` | **P3** | `architecture/skills/SKILL-kickoff-squad.md` | GAP-4 |

### Templates a Criar

| Template | Prioridade | Caminho |
|----------|------------|---------|
| `template-backend-java.md` | **P3** | `.github/agents/templates/template-backend-java.md` |
| `template-frontend-spa.md` | **P3** | `.github/agents/templates/template-frontend-spa.md` |
| `template-python-ai.md` | **P3** | `.github/agents/templates/template-python-ai.md` |
| `template-tech-lead.md` | **P3** | `.github/agents/templates/template-tech-lead.md` |

### Agentes a Refatorar (GAP-3)

| Agente | Ação | Prioridade |
|--------|------|-----------|
| Backend Java Júnior/Pleno/Sênior | Separar core de contexto | **P2** |
| UX Engineer | Separar core de contexto | **P2** |
| Tech Lead | Separar core de contexto | **P2** |
| Arquiteto Corporativo | Separar core de contexto | **P2** |
| Validador UX | Substituir paths por variáveis | **P2** |
| QA Comportamental | Substituir paths por variáveis | **P2** |

---

*← [RACI e Perfis Humanos](06_RACI-perfis-humanos.md) | [Índice](00_indice.md)*  
*Diagnóstico emitido pelo Diretor de Squads — deep-ion Fábrica de Software Autônoma*
