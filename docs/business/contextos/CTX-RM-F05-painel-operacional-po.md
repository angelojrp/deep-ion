---
tipo: contexto-funcionalidade
id-roadmap: RM-F05
nome: Painel Operacional do PO
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend do dashboard do PO para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F05: Painel Operacional do PO

## 1. Descrição no Roadmap

Painel operacional por projeto: status do pipeline, gates pendentes, métricas de qualidade.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F05 |
| ID Visão | F-05 |
| Marco | 2 — Plataforma Multi-Tenant |
| Prioridade | Should |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

Dashboard completo do PO com KPIs, Kanban do pipeline, métricas de entrega, saúde do backlog, qualidade negocial, riscos de conformidade, progresso do roadmap e análise valor/esforço.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Dashboard PO | `/` | `frontend/src/presentation/pages/DashboardPage.tsx` | Página principal da plataforma |

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| StatCard | `frontend/src/presentation/components/dashboard/StatCard.tsx` | Card de KPI genérico |
| PipelineKanban | `frontend/src/presentation/components/dashboard/PipelineKanban.tsx` | Kanban do pipeline por estágio |
| DeliveryMetrics | `frontend/src/presentation/components/dashboard/DeliveryMetrics.tsx` | Métricas de entrega |
| BacklogHealth | `frontend/src/presentation/components/dashboard/BacklogHealth.tsx` | Saúde do backlog |
| BusinessQuality | `frontend/src/presentation/components/dashboard/BusinessQuality.tsx` | Qualidade negocial |
| ComplianceRisks | `frontend/src/presentation/components/dashboard/ComplianceRisks.tsx` | Riscos de conformidade |
| RoadmapProgress | `frontend/src/presentation/components/dashboard/RoadmapProgress.tsx` | Progresso do roadmap |
| ValueEffort | `frontend/src/presentation/components/dashboard/ValueEffort.tsx` | Matriz valor vs. esforço |

## 5. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/po-dashboard.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| PipelineDemand | Demanda no pipeline com estágio, tier, status |
| DemandTier | T0, T1, T2, T3 |
| DemandStatus | Status da demanda nos estágios |
| MoSCoW | Must, Should, Could, Won't |
| CycleTimeByTier | Tempo de ciclo por classificação |
| DeliveryMetrics | Lead time, flow efficiency, throughput, predictability |
| BacklogHealth | Distribuição por tier e prioridade MoSCoW |
| RiskSeverity | Níveis de severidade de risco |
| DependencyStatus | Status de dependências |

## 6. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/usePoDashboard.ts` — usePoDashboard()

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/po-dashboard` | Dados consolidados do dashboard |

## 7. Funcionalidades Implementadas no Protótipo

- **Pipeline Kanban:** visualização por estágio (discovery → analysis → development → gates → done) com cards de demanda coloridos por tier
- **Métricas de entrega:** cycle time por tier, lead time, flow efficiency, throughput semanal, score de previsibilidade
- **Saúde do backlog:** distribuição por tier (T0-T3) e por prioridade MoSCoW
- **Qualidade negocial:** métricas de qualidade dos artefatos de negócio
- **Riscos de conformidade:** painel de riscos e alertas
- **Progresso do roadmap:** visualização de avanço por marco
- **Matriz valor/esforço:** classificação visual de demandas por valor vs. esforço

## 8. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Dashboard é a página inicial da plataforma (rota `/`)
- Estágios do pipeline: discovery, analysis, development, gates, done
- Classificação de demandas por tier (T0-T3) e MoSCoW
- Métricas calculadas: cycle time, lead time, flow efficiency, throughput

### Pontos em Aberto para DOM-02

- Filtro por projeto específico (atualmente mostra dados agregados)
- Periodicidade de atualização dos dados
- Drill-down de cards do Kanban para detalhes da demanda
- Configuração de alertas e thresholds por projeto
- Exportação de relatórios
