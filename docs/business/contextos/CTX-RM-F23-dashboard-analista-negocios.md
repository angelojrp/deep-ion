---
tipo: contexto-dashboard
id-roadmap: RM-F23
perfil: USR-07
nome: Analista de Negócios
data-criação: 2026-03-03
tema: deep-ion
objetivo: Fornecer contexto para prototipação do dashboard do Analista de Negócios
---

# Contexto de Dashboard — USR-07: Analista de Negócios

## 1. Perfil do Usuário

| Campo | Valor |
|-------|-------|
| ID | USR-07 |
| Perfil | Analista de Negócios |
| Descrição | Membro humano de squad responsável pela criação e validação dos briefs e do documento de visão do projeto |
| Necessidade Principal | Ter artefatos negociais completos, consistentes e rastreáveis, prontos para alimentar o pipeline |
| Frequência de acesso | Diária |
| Contexto de uso | Início e acompanhamento do pipeline; fases DOM-01 e DOM-02 |

## 2. Objetivo do Dashboard

Oferecer visibilidade total sobre o **estado dos artefatos negociais**, saúde do backlog, gargalos na descoberta e alinhamento estratégico das demandas — permitindo ao Analista de Negócios agir proativamente sobre problemas antes que impactem o pipeline.

## 3. Áreas de Informação

### 3.1 Briefs & Visão

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Total de briefs por status | KPI | Contagem de briefs DRAFT / FINAL / em refinamento | Must |
| Ciclo médio de refinamento | Métrica | Média de ciclos gastos até o brief atingir FINAL (máx. 3) | Must |
| Briefs com questões abertas (QA-NN) | Lista acionável | Briefs que possuem QA-NN pendentes de resposta | Must |
| Documentos de visão pendentes | Lista acionável | Projetos sem visão FINAL ou com QV-NN em aberto | Should |
| Tempo médio de permanência em DRAFT | Métrica | Alerta quando brief está em DRAFT > X dias | Should |

### 3.2 Pipeline de Descoberta

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Demandas na fase DOM-01/DOM-02 | KPI | Contagem de demandas ativas por fase do pipeline | Must |
| Tempo médio de permanência por fase | Métrica | Identifica gargalos no início do pipeline | Must |
| Demandas paradas > X dias | Alerta | Demandas sem movimentação — exige ação | Must |
| Throughput de descoberta | Gráfico | Demandas que saíram de DOM-01→DOM-02 por semana/sprint | Should |
| Pipeline funnel | Gráfico | Funil visual: entrada → brief → UC → Gate 2 → implementação | Could |

### 3.3 Qualidade de Artefatos

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Índice de completude dos briefs | Score (%) | Percentual de seções preenchidas por brief | Must |
| Briefs reprovados no Gate 2 | KPI + lista | Quantos e quais briefs foram devolvidos pela auditoria DOM-05a | Must |
| Taxa de retrabalho negocial | Métrica | Percentual de briefs que precisaram > 1 ciclo de refinamento | Should |
| Resultado da auditoria DOM-05a | Resumo | Último resultado de completude e consistência por demanda | Should |

### 3.4 Classificação de Impacto (T0–T3)

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Distribuição de demandas por classe | Gráfico pizza/barra | T0 / T1 / T2 / T3 — total e percentual | Must |
| Tendência de classificação ao longo do tempo | Gráfico linha | Identificar se demandas estão ficando mais complexas | Should |
| Demandas T3 ativas | Alerta | Demandas críticas que exigem acompanhamento próximo | Must |

### 3.5 Escaladas & Confidence Score

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Demandas com confidence_score < 0.65 | Alerta | Escaladas pendentes de resolução humana | Must |
| Tempo médio de resolução de escalada | Métrica | Mede a agilidade na resposta a escaladas | Should |
| Histórico de escaladas por projeto | Gráfico | Tendência de escaladas — identifica projetos problemáticos | Could |

### 3.6 Cobertura & Alinhamento Estratégico

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Mapa de calor por módulo/funcionalidade | Heatmap | Concentração de demandas vs. blind spots | Should |
| Demandas vinculadas a OKR vs. demandas órfãs | KPI | Percentual de alinhamento estratégico | Should |
| Valor de negócio estimado vs. entregue | Gráfico | ROI projetado por onda/sprint | Could |

### 3.7 Backlog Health

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Idade média das demandas no backlog | Métrica | Saúde geral do backlog | Must |
| Demandas sem movimentação > 2 sprints | Alerta | Itens esquecidos ou bloqueados | Must |
| Duplicatas detectadas (SKILL-REQ-00) | Lista acionável | Demandas potencialmente duplicadas | Should |
| Stakeholders inativos > N dias | Alerta | Gate Keepers ou POs sem interação recente | Could |

## 4. Ações Rápidas (Quick Actions)

| Ação | Descrição |
|------|-----------|
| Criar novo brief | Abre fluxo `di-brief-new` para o projeto selecionado |
| Refinar brief DRAFT | Abre fluxo `di-brief-refine` para brief selecionado |
| Criar visão de projeto | Abre fluxo `di-visao-projeto` |
| Ver questões abertas | Lista consolidada de QA-NN e QV-NN pendentes |
| Escalar demanda | Sinaliza demanda para revisão humana |

## 5. Filtros e Navegação

| Filtro | Descrição |
|--------|-----------|
| Por projeto | Selecionar projeto específico do tenant |
| Por sprint/onda | Filtrar por ciclo temporal |
| Por classificação T0–T3 | Filtrar por nível de impacto |
| Por status de brief | DRAFT / FINAL / em refinamento |
| Por módulo/funcionalidade | Agrupar demandas por área funcional |

## 6. Notificações Acionáveis (Top Bar)

- Briefs com questões QA-NN há > 48h sem resposta
- Demandas paradas em DOM-01/DOM-02 há > 5 dias úteis
- Escaladas (`confidence_score < 0.65`) aguardando resolução
- Briefings reprovados no Gate 2 aguardando retrabalho

## 7. Referências de Mercado

| Plataforma | Funcionalidade inspiradora |
|------------|---------------------------|
| ProductBoard | Feature gap analysis, backlog health, OKR alignment |
| Aha! | Stakeholder activity tracking, roadmap por valor |
| Jira | Cycle time por stage, backlog hygiene |
| Jama Connect | Requirements quality metrics, traceability gaps |
| ServiceNow | Escalation dashboards, SLA tracking |
| Perdoo | OKR tracking integrado a demandas |
| SAFe / Rally | WSJF, cost of delay, demand categorization |

## 8. Wireframe Conceitual
┌──────────────────────────────────────────────────────────────────┐
│ 🔔 Alertas: 3 briefs com QA pendente │ 2 escaladas abertas │
├──────────────────────────────────────────────────────────────────┤
│ [Projeto ▾] [Sprint ▾] [Classificação ▾] [Status Brief ▾] │
├────────────────────┬─────────────────────┬───────────────────────┤
│ BRIEFS │ PIPELINE │ CLASSIFICAÇÃO T0-T3 │
│ ┌──┐ ┌──┐ ┌──┐ │ DOM-01: 5 │ ██████░░ T0: 40% │
│ │12│ │ 8│ │ 3│ │ DOM-02: 3 │ ████░░░░ T1: 30% │
│ └──┘ └──┘ └──┘ │ Gate 2: 2 │ ██░░░░░░ T2: 20% │
│ DRAFT FINAL Refin │ Paradas: 1 ⚠️ │ █░░░░░░░ T3: 10% │
├────────────────────┼─────────────────────┼───────────────────────┤
│ QUALIDADE │ ESCALADAS │ BACKLOG HEALTH │
│ Completude: 78% │ Pendentes: 2 🔴 │ Idade média: 12d │
│ Reprovados: 1 │ Resolvidas: 8 │ Sem movim.: 3 ⚠️ │
│ Retrabalho: 15% │ Tempo médio: 1.2d │ Duplicatas: 1 │
├────────────────────┴─────────────────────┴───────────────────────┤
│ 📊 THROUGHPUT DE DESCOBERTA (últimas 4 semanas) │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ S1: ████████ 8 │ S2: ██████ 6 │ S3: ██████████ 10 │ S4: █ │
└──────────────────────────────────────────────────────────────────┘