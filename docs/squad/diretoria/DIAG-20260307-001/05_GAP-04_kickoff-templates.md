# DIAG-20260307-001 · 05 — GAP-4: Ausência de Templates e Processo de Kickoff de Squad

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Prioridade:** **P2/P3** | **Emitido por:** Diretor de Squads | **Data:** 07/03/2026

---

## Diagnóstico

Não existe na fábrica nenhum processo formal de **kickoff de squad para um novo projeto**. O resultado atual: cada novo projeto precisaria criar seus agentes do zero, replicando manualmente o que foi construído para o deep-ion, sem padronização.

| O que falta | Impacto |
|-------------|--------|
| Taxonomia formal Tipo U / Tipo P / Tipo H | Sem ela, ninguém sabe o que é reutilizável |
| Catálogo de variáveis de projeto (`SKILL-project-variables.md`) | Sem variáveis definidas, os templates não podem ser parametrizados |
| Templates de agentes Tipo P (com `{{placeholders}}`) | Cada projeto recria do zero |
| `SKILL-kickoff-squad.md` — processo de onboarding de nova squad para novo projeto | Sem processo, o kickoff é informal e inconsistente |
| Agente de Kickoff ou checklist acionável pelo Diretor de Squads | Sem executor, o processo não sai do papel |

---

## Recomendações

### R4.1 — Criar `SKILL-project-variables.md`

Catálogo canônico das variáveis de configuração de projeto:

```
{project.name}                    → "deep-ion", "billing-service", etc.
{project.root_path}               → raiz do repositório
{project.base_package}            → "net.deepion", "com.acme.billing", etc.
{project.backend.module_path}     → "backoffice/", "api/", etc.
{project.backend.stack}           → "Java 21 + Spring Boot 3.4.0 + Spring Modulith"
{project.frontend.path}           → "frontend/", "web/", etc.
{project.frontend.stack}          → "React 18 + TypeScript + Tailwind v4"
{project.ai_engine.path}          → "agents-engine/", etc.
{project.blueprint}               → referência ao blueprint de arquitetura escolhido
{project.pipeline}                → referência ao pipeline (DOM-01..DOM-05b ou simplificado)
```

### R4.2 — Refatorar agentes Tipo P

Separar *core comportamental* (agnóstico) da *seção de contexto de projeto* (parametrizável). Ver detalhamento em [GAP-3](04_GAP-03_acoplamento-projeto.md).

### R4.3 — Criar `SKILL-kickoff-squad.md`

Processo formal de kickoff:

```
1. Coletar variáveis de projeto (SKILL-project-variables.md)
2. Selecionar blueprint arquitetural (architecture/blueprints/)
3. Selecionar agentes Tipo P necessários para a squad
4. Instanciar templates com as variáveis coletadas → gerar .github/agents/*.md
5. Definir RACI inicial da squad (template pré-construído)
6. Definir protocolo de handoff específico do projeto (baseado no SKILL-handoff.md)
7. Validar com Diretor de Squads e Tech Lead
```

### R4.4 — Templates Canônicos

Criar em `.github/agents/templates/`:

| Template | Para |
|----------|------|
| `template-backend-java.md` | Qualquer projeto Java/Spring |
| `template-frontend-spa.md` | Qualquer projeto React SPA |
| `template-python-ai.md` | Qualquer projeto com módulo de agentes IA |
| `template-tech-lead.md` | Qualquer projeto full-stack |

---

## Checklist de Execução — Gestor de Squads

**P2 — Alta prioridade (pré-requisito para refatoração de GAP-3)**
- [ ] Criar `architecture/skills/SKILL-project-variables.md` com catálogo de variáveis

**P3 — Média prioridade**
- [ ] Criar `architecture/skills/SKILL-kickoff-squad.md` com processo formal (7 passos)
- [ ] Criar `.github/agents/templates/template-backend-java.md`
- [ ] Criar `.github/agents/templates/template-frontend-spa.md`
- [ ] Criar `.github/agents/templates/template-python-ai.md`
- [ ] Criar `.github/agents/templates/template-tech-lead.md`

---

*← [GAP-3 — Acoplamento](04_GAP-03_acoplamento-projeto.md) | [Índice](00_indice.md) | Próximo: [RACI e Perfis Humanos](06_RACI-perfis-humanos.md) →*
