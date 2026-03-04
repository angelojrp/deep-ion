---
tipo: contexto-dashboard
perfil: USR-08
nome: Analista de Requisitos
data-criação: 2026-03-03
tema: deep-ion
objetivo: Fornecer contexto para prototipação do dashboard do Analista de Requisitos
---

# Contexto de Dashboard — USR-08: Analista de Requisitos

## 1. Perfil do Usuário

| Campo | Valor |
|-------|-------|
| ID | USR-08 |
| Perfil | Analista de Requisitos |
| Descrição | Membro humano de squad responsável pela modelagem e manutenção dos casos de uso e regras de negócio |
| Necessidade Principal | Assegurar rastreabilidade entre requisitos, casos de uso e critérios de aceite ao longo do ciclo de desenvolvimento |
| Frequência de acesso | Diária |
| Contexto de uso | Fases DOM-02 e DOM-05a; modelagem contínua ao longo do pipeline |

## 2. Objetivo do Dashboard

Oferecer visibilidade total sobre o **estado da especificação de requisitos**, gaps de rastreabilidade, qualidade dos casos de uso e regras de negócio — permitindo ao Analista de Requisitos identificar e corrigir lacunas antes que avancem no pipeline.

## 3. Áreas de Informação

### 3.1 Casos de Uso (UC)

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Total de UCs por status | KPI | DRAFT / validado / implementado / arquivado | Must |
| UCs sem regras de negócio associadas | Alerta | Casos de uso sem RN vinculada — gap de especificação | Must |
| UCs modificados recentemente | Lista | Últimas alterações para revisão de impacto | Must |
| UCs por módulo/funcionalidade | Gráfico barra | Distribuição de UCs por área do sistema | Should |
| UCs sem critérios Gherkin definidos | Alerta | Critérios de aceite ausentes ou incompletos | Must |
| Tempo médio de modelagem (brief → UC validado) | Métrica | Eficiência do processo de especificação | Should |

### 3.2 Regras de Negócio (RN)

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Total de RNs catalogadas | KPI | Contagem geral e por módulo | Must |
| RNs sem FE (Fluxo de Exceção) mapeado | Alerta | Regras sem tratamento de exceção definido | Must |
| RNs órfãs (sem UC vinculado) | Alerta | Regras que não estão associadas a nenhum caso de uso | Must |
| RNs contraditórias | Alerta | Regras que conflitam entre si (detectadas por auditoria) | Must |
| RNs por status | KPI | Ativa / deprecada / em revisão | Should |
| RNs por domínio/módulo | Gráfico | Distribuição para identificar concentrações | Should |

### 3.3 Rastreabilidade

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Matriz UC → RN → Critério de Aceite → Código | Tabela interativa | Navegação drill-down do requisito à implementação | Must |
| % de cobertura de rastreabilidade | KPI (%) | Percentual de UCs com cadeia completa de rastreabilidade | Must |
| Links quebrados na rastreabilidade | Alerta | UC referencia RN inexistente, ou RN aponta para UC removido | Must |
| Rastreabilidade por módulo | Heatmap | Módulos com boa vs. baixa cobertura de rastreabilidade | Should |
| Evolução da cobertura ao longo do tempo | Gráfico linha | Tendência de melhoria ou degradação | Should |

### 3.4 Qualidade de Especificação

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Score INVEST por story | Score (0–10) | Avaliação de qualidade via `di-critique-us` | Must |
| Stories abaixo do threshold (< 7/10) | Alerta + lista | Stories que necessitam refinamento | Must |
| Taxa de stories refinadas vs. pendentes | KPI (%) | Progresso do refinamento do backlog | Must |
| Critérios de aceite vagos sinalizados | Alerta | Critérios marcados como imprecisos pela auditoria DOM-05a | Should |
| Cobertura de critérios Gherkin por módulo | Gráfico barra | Módulos com menor cobertura de BDD | Should |

### 3.5 Auditoria DOM-05a

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Resultado da última auditoria negocial | Resumo | Completude e consistência por demanda | Must |
| Itens com falha na auditoria | Lista acionável | Artefatos que não passaram nos checks de DOM-05a | Must |
| Tendência de conformidade ao longo do tempo | Gráfico linha | Evolução da qualidade dos artefatos negociais | Should |
| Taxa de aprovação no Gate 2 | KPI (%) | Percentual de demandas aprovadas na primeira tentativa | Should |

### 3.6 Conflitos & Duplicatas

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Demandas com conflito de requisitos | Alerta | Requisitos contraditórios entre demandas | Must |
| Requisitos duplicados entre módulos | Lista | Sobreposição detectada (SKILL-REQ-00) | Should |
| Mapa de dependências entre UCs | Grafo | Visualização de interdependências | Could |

### 3.7 Impacto de Mudanças

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Requisitos alterados nos últimos N dias | Lista + timeline | Histórico recente de alterações | Must |
| Impacto em cascata | Análise | Quantos UCs/RNs/stories afetados por uma mudança em um requisito | Must |
| Alertas de impacto não revisado | Alerta | Mudanças feitas sem revisão de impacto downstream | Should |

### 3.8 Dívida de Requisitos

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Requisitos marcados "a detalhar" | Lista | Placeholders que precisam ser resolvidos | Must |
| RNs com placeholder | Alerta | Regras incompletas ou com texto provisório | Must |
| UCs incompletos há > X dias | Alerta | Especificações abandonadas ou esquecidas | Should |
| Índice de dívida de requisitos | Score | Proporção de itens incompletos vs. total | Should |

## 4. Ações Rápidas (Quick Actions)

| Ação | Descrição |
|------|-----------|
| Criar novo UC | Abre fluxo `di-uc-new` a partir de brief selecionado |
| Atualizar UC existente | Abre fluxo `di-uc-update` para UC selecionado |
| Criticar stories | Executa `di-critique-us` no conjunto de stories selecionado |
| Refinar stories | Abre fluxo `di-refine-us` para stories com score baixo |
| Fatiar épico | Abre fluxo `di-split-us` para épico selecionado |
| Ver matriz de rastreabilidade | Abre visualização interativa UC → RN → Critério → Código |
| Analisar impacto de mudança | Simula impacto em cascata de uma alteração em UC/RN |

## 5. Filtros e Navegação

| Filtro | Descrição |
|--------|-----------|
| Por projeto | Selecionar projeto específico do tenant |
| Por módulo/domínio | Agrupar por área funcional do sistema |
| Por status de UC | DRAFT / validado / implementado |
| Por score INVEST | Filtrar stories por faixa de qualidade |
| Por cobertura de rastreabilidade | Itens com rastreabilidade completa vs. incompleta |
| Por data de alteração | Requisitos alterados no período selecionado |

## 6. Notificações Acionáveis (Top Bar)

- UCs sem regras de negócio há > 3 dias após criação
- RNs sem FE mapeado
- Stories com score INVEST < 7 aguardando refinamento
- Conflitos de requisitos detectados pela auditoria
- Links de rastreabilidade quebrados
- Mudanças em UC/RN sem revisão de impacto downstream

## 7. Referências de Mercado

| Plataforma | Funcionalidade inspiradora |
|------------|---------------------------|
| IBM DOORS | Requirements status, traceability matrix, change impact analysis |
| Jama Connect | Traceability gaps, impact analysis, requirements quality metrics |
| Modern Requirements | Traceability matrix, requirements baseline |
| Azure DevOps | Lead time por tipo de item, work item linking |
| Jira + plugins | Story health, backlog quality, definition of ready |
| Cucumber/BDD dashboards | Scenario coverage, Gherkin completeness |
| SonarQube (analogia) | Quality gate status, tendência de conformidade |

## 8. Wireframe Conceitual
┌──────────────────────────────────────────────────────────────────┐
│ 🔔 5 UCs sem RN │ 3 RNs sem FE │ 2 conflitos │ 1 link quebrado │
├──────────────────────────────────────────────────────────────────┤
│ [Projeto ▾] [Módulo ▾] [Status UC ▾] [Score INVEST ▾] │
├────────────────────┬─────────────────────┬───────────────────────┤
│ CASOS DE USO │ REGRAS DE NEGÓCIO │ RASTREABILIDADE │
│ ┌──┐ ┌──┐ ┌──┐ │ Total: 45 │ ████████░░ 82% │
│ │24│ │18│ │ 6│ │ Sem FE: 3 🔴 │ │
│ └──┘ └──┘ └──┘ │ Órfãs: 2 ⚠️ │ Links quebrados: 1 │
│ DRAFT Valid Impl │ Conflito: 1 🔴 │ Sem cobertura: 18% │
├────────────────────┼─────────────────────┼───────────────────────┤
│ QUALIDADE STORIES │ AUDITORIA DOM-05a │ DÍVIDA DE REQUISITOS │
│ Média INVEST: 7.8 │ Aprovação Gate2: │ A detalhar: 5 │
│ Abaixo 7: 4 ⚠️ │ ████████░░ 85% │ Placeholder: 2 │
│ Refinadas: 70% │ Falhas: 3 │ Inativos >7d: 3 │
├────────────────────┴─────────────────────┴───────────────────────┤
│ 📊 MATRIZ DE RASTREABILIDADE (top 10 UCs) │
│ ┌─────────┬──────┬────────────┬────────┬────────┐ │
│ │ UC │ RN │ Critério │ Código │ Status │ │
│ ├─────────┼──────┼────────────┼────────┼────────┤ │
│ │ UC-001 │ ✅ │ ✅ │ ✅ │ 🟢 │ │
│ │ UC-002 │ ✅ │ ⚠️ vago │ — │ 🟡 │ │
│ │ UC-003 │ 🔴 │ — │ — │ 🔴 │ │
│ └─────────┴──────┴────────────┴────────┴────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ 📈 IMPACTO DE MUDANÇAS RECENTES │
│ UC-015 alterado → afeta: 3 RNs, 5 stories, 2 telas │
│ RN-032 nova → vinculada a: UC-008, UC-012 │
└──────────────────────────────────────────────────────────────────┘