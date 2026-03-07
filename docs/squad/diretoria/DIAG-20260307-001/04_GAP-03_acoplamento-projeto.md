# DIAG-20260307-001 · 04 — GAP-3: Acoplamento Excessivo ao Projeto deep-ion

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Prioridade:** **P2** | **Emitido por:** Diretor de Squads | **Data:** 07/03/2026

---

## Diagnóstico

Dos 14 agentes atuais, **8 são fortemente acoplados** ao deep-ion com caminhos, stacks e convenções hardcoded nas instruções. Isso cria dois problemas:

1. **Reutilização zero**: Para usar o Backend Java Pleno em outro projeto seria necessário reescrever o agente inteiro
2. **Manutenção centralizada frágil**: Rename de módulo ou migração de stack impacta N arquivos de instruções

---

## Classificação Formal de Tipos de Agente

| Categoria | Definição | Agentes atuais |
|-----------|-----------|----------------|
| **Tipo U — Universal** | Agnóstico de projeto, stack e domínio. Reutilizável sem modificação. | Diretor de Processos, Diretor de Squads, Gestor de Processos, Gestor de Squads, Governador de Prompts, Risk Arbiter (proposto) |
| **Tipo P — Especialista de Projeto** | Conhece o projeto em profundidade. Gerado via template no kickoff. | Backend Java Júnior/Pleno/Sênior, UX Engineer, Tech Lead, Analista de Negócios, Arquiteto Corporativo, Validador UX, QA Comportamental, Python AI Engineer (proposto) |
| **Tipo H — Híbrido** | Core agnóstico + seção de contexto de projeto injetável | Security Auditor (proposto), DevOps Engineer (proposto), Release Manager (proposto) |

---

## Impacto por Agente — O Que Está Hardcoded

| Agente | O que está hardcoded | Variável de projeto sugerida |
|--------|----------------------|------------------------------|
| Backend Java Júnior/Pleno/Sênior | `backoffice/`, `net.deepion`, versões Spring | `{project.module_path}`, `{project.base_package}`, `{project.stack_versions}` |
| UX Engineer | `frontend/`, versões React/Tailwind/shadcn | `{project.frontend_path}`, `{project.ui_stack}` |
| Tech Lead | `frontend/`, `backoffice/`, `agents-engine/` | `{project.modules}` |
| Arquiteto Corporativo | Spring Modulith, DOM-01..DOM-05b | `{project.architecture_style}`, `{project.blueprint}` |
| Validador UX | 10+ paths absolutos de arquivos deep-ion | `{project.dom04_ux_paths}` |
| QA Comportamental | `agents-engine/tests/behavioral/` | `{project.behavioral_tests_path}` |

---

## Estrutura de Refatoração Proposta para Agentes Tipo P

Separar o *core comportamental* (agnóstico) da *seção de contexto de projeto* (parametrizável):

```markdown
--- [core comportamental — não muda entre projetos] ---
## Identidade e Princípios de Engenharia
## Restrições Absolutas
## Protocolo de Handoff
--- [contexto de projeto — gerado no kickoff] ---
## Contexto do Projeto: {project.name}
- Module path: {project.backend.module_path}
- Base package: {project.base_package}
- Stack: {project.backend.stack}
- Blueprint: {project.blueprint}
```

---

## Checklist de Execução — Gestor de Squads

**Etapa 1 — Classificação (pré-requisito)**
- [ ] Documentar a taxonomia U/P/H em `architecture/skills/SKILL-project-variables.md` (ver GAP-4)
- [ ] Anotar o tipo (U/P/H) no cabeçalho de cada agente existente

**Etapa 2 — Refatoração dos agentes Tipo P (executar após SKILL-project-variables.md estar criado)**
- [ ] Refatorar `Backend Java Júnior` — separar core de contexto de projeto
- [ ] Refatorar `Backend Java Pleno` — separar core de contexto de projeto
- [ ] Refatorar `Backend Java Sênior` — separar core de contexto de projeto
- [ ] Refatorar `UX Engineer` — separar core de contexto de projeto
- [ ] Refatorar `Tech Lead` — separar core de contexto de projeto
- [ ] Refatorar `Arquiteto Corporativo` — separar core de contexto de projeto
- [ ] Refatorar `Validador UX` — substituir paths absolutos por variáveis
- [ ] Refatorar `QA Comportamental` — substituir paths absolutos por variáveis

---

*← [GAP-2 — Agentes Faltantes](03_GAP-02_agentes-faltantes.md) | [Índice](00_indice.md) | Próximo: [GAP-4 — Kickoff e Templates](05_GAP-04_kickoff-templates.md) →*
