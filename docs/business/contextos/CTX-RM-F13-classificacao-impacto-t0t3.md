---
tipo: contexto-funcionalidade
id-roadmap: RM-F13
nome: Sistema de Classificação de Impacto T0-T3
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend do sistema de classificação T0-T3 para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F13: Sistema de Classificação de Impacto T0-T3

## 1. Descrição no Roadmap

Sistema de classificação de impacto T0–T3 com controle de autonomia por projeto.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F13 |
| ID Visão | F-13 |
| Marco | 1 — Core Pipeline |
| Prioridade | Must |
| Status | Protótipo frontend (configuração de tiers, critérios e SLA na UI de pipelines) |

## 2. Escopo do Protótipo Frontend

Configuração de tiers T0-T3 integrada à página de pipelines, com definição de critérios por campo/operador/valor, SLA e max lead time por tier.

## 3. Integração no Protótipo

A funcionalidade F13 está integrada em múltiplos módulos:

| Módulo | Onde aparece | Uso |
|--------|-------------|-----|
| Pipelines (RM-F06) | `PipelinesPage.tsx` | Configuração de critérios de classificação por tier |
| Dashboard BA (RM-F23) | `BaDashboardPage.tsx` | Visualização de distribuição de impacto T0-T3 |
| Dashboard PO (RM-F05) | `DashboardPage.tsx` | Cycle time analytics por tier, distribuição no backlog |

## 4. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/pipeline.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| TierClassification | T0, T1, T2, T3 |
| TierConfig | Nome, descrição, critérios[], max_lead_time, sla, auto_approve_gates, cor |
| TierCriterion | field (string), operator (enum), value (any) |

### Definição dos Tiers

| Tier | Significado | Autonomia |
|------|------------|-----------|
| T0 | Impacto mínimo | Autonomia total do agente |
| T1 | Impacto baixo | Agente semi-autônomo |
| T2 | Impacto médio | Agente assistido, requer aprovação |
| T3 | Impacto alto/crítico | Revisão humana obrigatória |

### Operadores de Critério

| Operador | Exemplo de uso |
|----------|----------------|
| equals | campo = valor |
| contains | campo contém valor |
| greater_than | campo > valor |
| less_than | campo < valor |
| in | campo ∈ [lista] |
| not_in | campo ∉ [lista] |

## 5. Funcionalidades Implementadas no Protótipo

- Definição de 4 tiers (T0-T3) com nome, descrição e cor
- Configuração de critérios de classificação por field/operator/value
- Max lead time configurável por tier
- SLA por tier
- Opção de auto-aprovação de gates por tier
- Visualização de distribuição T0-T3 no dashboard BA (gráfico pizza/barra)
- Cycle time analytics por tier no dashboard PO
- Codificação por cor em toda a plataforma

## 6. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- 4 níveis fixos: T0, T1, T2, T3
- Critérios são compostos por field + operator + value
- Cada tier pode ter múltiplos critérios
- Auto-aprovação de gates é configurável por tier (T0 pode auto-aprovar, T3 não)
- Tiers impactam: atribuição de agentes, autonomia, SLA, aprovação de gates

### Pontos em Aberto para DOM-02

- Algoritmo de classificação automática (quem calcula o tier de uma demanda)
- Regras de reclassificação (quando tier pode mudar durante o pipeline)
- Conflito de critérios entre tiers (qual prevalece)
- Campos permitidos nos critérios (origem dos metadados)
- Relação tier → confidence_score → escalada
- Auditoria de classificações (DecisionRecord)
