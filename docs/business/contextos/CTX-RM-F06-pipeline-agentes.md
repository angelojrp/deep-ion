---
tipo: contexto-funcionalidade
id-roadmap: RM-F06
nome: Pipeline Orquestrado de Agentes
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend de configuração de pipeline para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F06: Pipeline Orquestrado de Agentes

## 1. Descrição no Roadmap

Pipeline orquestrado de agentes — orquestração 100% interna via MCP Servers (DOM-01 → DOM-02 → [Gate UX] → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4).

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F06 |
| ID Visão | F-06 |
| Marco | 1 — Core Pipeline |
| Prioridade | Must |
| Status | Protótipo frontend (UI de configuração de pipeline e atribuição de agentes por tier/domínio) |

## 2. Escopo do Protótipo Frontend

UI de configuração de pipelines com criação global ou por projeto, configuração de tiers T0-T3, atribuição de agentes por combinação tier+domínio, e configuração de LLMs.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Pipelines | `/pipelines` | `frontend/src/presentation/pages/PipelinesPage.tsx` | Gestão e configuração de pipelines |

## 4. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/pipeline.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| PipelineConfig | Configuração completa do pipeline |
| PipelineScope | global, project |
| PipelineStatus | active, draft, archived |
| TierConfig | Configuração de classificação T0-T3 |
| TierCriterion | Critério de classificação (field, operator, value) |
| PipelineAgentAssignment | Atribuição de agente a tier+domínio |
| PipelineLlmConfig | Configuração de LLM por atribuição |
| ExecutionMode | realtime, batch |

### Operadores de critério de tier

| Operador | Descrição |
|----------|-----------|
| equals | Igualdade exata |
| contains | Contém valor |
| greater_than | Maior que |
| less_than | Menor que |
| in | Pertence a lista |
| not_in | Não pertence a lista |

## 5. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/usePipelines.ts` — usePipelines(), useCreatePipeline()

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pipelines` | Listagem de pipelines |
| POST | `/api/pipelines` | Criação de pipeline |
| GET | `/api/pipelines/:id` | Detalhes |
| PATCH | `/api/pipelines/:id` | Atualização |
| GET | `/api/agents` | Agentes disponíveis para atribuição |
| GET | `/api/tiers-config` | Configuração de tiers |

## 6. Funcionalidades Implementadas no Protótipo

- Criação de pipelines com escopo global ou por projeto
- Configuração de classificação T0-T3 com critérios por campo/operador/valor
- Atribuição de agentes a combinações tier + domínio (DOM-01 a DOM-05)
- Configuração de modelos LLM por atribuição
- Modo de execução: realtime ou batch
- Ciclo de vida: draft → active → archived
- Max lead time e SLA por tier
- Opção de auto-aprovação de gates

## 7. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Pipeline pode ser global (todos os projetos) ou específico de projeto
- Cada tier tem critérios configuráveis baseados em field/operator/value
- Agentes são atribuídos por combinação tier + domínio
- Cada atribuição pode ter modelo LLM específico
- Pipeline segue fluxo: DOM-01 → DOM-02 → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4

### Pontos em Aberto para DOM-02

- Regras de precedência: pipeline de projeto vs. global
- Validação de atribuição completa (todo tier/domínio coberto)
- Comportamento quando agente atribuído está inativo/em manutenção
- Regras de fallback quando LLM principal não responde
- Auditoria de alterações no pipeline
- Versionamento de configuração de pipeline
