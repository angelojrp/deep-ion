---
tipo: contexto-dashboard
perfil: USR-09
nome: Analista de UX
data-criação: 2026-03-03
tema: deep-ion
objetivo: Fornecer contexto para prototipação do dashboard do Analista de UX
---

# Contexto de Dashboard — USR-09: Analista de UX

## 1. Perfil do Usuário

| Campo | Valor |
|-------|-------|
| ID | USR-09 |
| Perfil | Analista de UX |
| Descrição | Membro humano de squad responsável pela aprovação dos protótipos de UX gerados pela plataforma (WEB + Mobile) |
| Necessidade Principal | Garantir que os protótipos reflitam a experiência do usuário esperada antes da implementação |
| Frequência de acesso | Diária a cada 2 dias |
| Contexto de uso | Gate UX (entre geração de protótipo e DOM-05a); revisão contínua de design |

## 2. Objetivo do Dashboard

Oferecer visibilidade total sobre o **estado dos protótipos de UX**, qualidade da experiência, cobertura de telas, acessibilidade e consistência de design — permitindo ao Analista de UX aprovar, rejeitar e refinar protótipos com dados contextualizados.

## 3. Áreas de Informação

### 3.1 Protótipos

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Total de protótipos por status | KPI | DRAFT / FINAL / aprovados / rejeitados | Must |
| Protótipos pendentes no Gate UX | Alerta | Protótipos aguardando aprovação — ação imediata | Must |
| Tempo médio no Gate UX | Métrica | Quanto tempo um protótipo espera por aprovação | Must |
| Ciclos de refinamento por protótipo | KPI | Consumidos vs. máximo (3); protótipos no limite | Must |
| Protótipos travados (3 ciclos sem aprovação) | Alerta | Exigem escalada ou decisão de design alternativa | Must |
| Throughput de aprovação | Gráfico | Protótipos aprovados por semana/sprint | Should |

### 3.2 Questões de UX (QP-NN)

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Questões abertas por protótipo | Lista | QP-NN pendentes de resolução | Must |
| Ciclos de refinamento consumidos vs. limite | Indicador | Progresso do ciclo de refinamento (0/3 → 3/3) | Must |
| Questões recorrentes (padrões) | Análise | Tipos de feedback mais comuns nas rejeições | Should |
| Tempo médio de resolução de QP-NN | Métrica | Agilidade no ciclo de feedback de UX | Should |

### 3.3 Cobertura de Telas

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| UCs com protótipo vs. UCs sem protótipo | KPI + gráfico | Gap de cobertura visual | Must |
| Telas geradas vs. telas planejadas | KPI | Progresso da prototipação | Must |
| Fluxos de UC mapeados para jornadas de tela | Matriz | UC → sequência de telas; fluxos alternativos/exceção com representação | Should |
| Telas sem versão mobile | Alerta | Protótipos WEB-only quando mobile é esperado | Should |
| Breakpoints cobertos por protótipo | Checklist | Desktop / Tablet / Mobile | Should |

### 3.4 Consistência de Design

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Componentes reutilizados vs. únicos | KPI (%) | Taxa de reuso do design system | Must |
| Desvios do design system | Alerta | Componentes que não seguem o padrão estabelecido | Must |
| Padrões de navegação inconsistentes | Alerta | Fluxos de navegação que divergem do padrão adotado | Should |
| Paleta de cores e tipografia | Checklist | Conformidade com o design token definido | Should |
| Ícones e ilustrações padronizados | Checklist | Uso consistente de iconografia | Could |

### 3.5 Acessibilidade

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Score de acessibilidade por tela (WCAG 2.1 AA) | Score | Avaliação automatizada de conformidade | Must |
| Violações de acessibilidade detectadas | Lista | Contraste insuficiente, alt text ausente, etc. | Must |
| Telas sem avaliação de acessibilidade | Alerta | Protótipos que não passaram pelo check de a11y | Should |
| Navegação por teclado validada | Checklist | Telas com navegação acessível confirmada | Should |
| Leitores de tela compatíveis | Checklist | ARIA landmarks e roles validados | Could |

### 3.6 Usabilidade

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Heurísticas de Nielsen violadas por protótipo | Score | Se avaliação heurística for aplicada | Should |
| Profundidade de cliques por tarefa | Métrica | Complexidade de navegação (ideal ≤ 3 cliques) | Should |
| Fluxos com saída incorreta ou sem saída | Alerta | Telas sem caminho de volta ou com beco sem saída | Must |
| Feedback de ações do usuário | Checklist | Toda ação tem feedback visual/textual? | Should |
| Estados de erro, vazio e loading | Checklist | Telas com empty states, error states e skeleton loaders definidos | Must |

### 3.7 Feedback Loop & Eficiência

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Tempo médio DRAFT → FINAL | Métrica | Eficiência do ciclo de aprovação de protótipos | Must |
| Idas e voltas por protótipo | KPI | Número de rejeições antes da aprovação | Must |
| Taxa de aprovação na 1ª revisão | KPI (%) | Qualidade da geração automatizada | Must |
| Padrões de rejeição mais comuns | Análise | Categorização dos motivos de rejeição | Should |
| Qualidade percebida dos protótipos gerados pela IA | Score | Métrica proprietária deep-ion — aprovação 1ª revisão vs. rejeição | Should |

### 3.8 Design Debt

| Dado | Tipo | Descrição | Prioridade |
|------|------|-----------|------------|
| Protótipos aprovados com ressalvas | Lista | Aprovações condicionais com debt tags | Must |
| Telas com debt tags | Lista | Simplificações aceitas temporariamente | Should |
| Backlog de melhorias de UX | Lista | Itens de design debt para ondas futuras | Should |
| Índice de design debt | Score | Proporção de telas com ressalvas vs. total aprovado | Could |

## 4. Ações Rápidas (Quick Actions)

| Ação | Descrição |
|------|-----------|
| Aprovar protótipo (Gate UX) | Aprova protótipo no Gate UX (`/gate-approve`) |
| Rejeitar protótipo | Rejeita com feedback estruturado e QP-NN |
| Refinar protótipo DRAFT | Abre fluxo `di-refinar-prototipo-ux` |
| Gerar novo protótipo | Abre fluxo `di-prototipar` a partir de UC selecionado |
| Ver protótipo side-by-side | Compara versão anterior (DRAFT) com nova versão |
| Verificar acessibilidade | Executa check automatizado WCAG 2.1 AA |
| Ver alinhamento UC → Tela | Abre mapeamento de fluxo UC para jornada de telas |

## 5. Filtros e Navegação

| Filtro | Descrição |
|--------|-----------|
| Por projeto | Selecionar projeto específico do tenant |
| Por status do protótipo | DRAFT / FINAL / aprovado / rejeitado |
| Por tipo (WEB / Mobile) | Filtrar por plataforma-alvo |
| Por score de acessibilidade | Telas abaixo/acima do threshold WCAG |
| Por ciclo de refinamento | Protótipos no 1º, 2º ou 3º ciclo |
| Por UC vinculado | Protótipos associados a caso de uso específico |

## 6. Notificações Acionáveis (Top Bar)

- Protótipos aguardando aprovação no Gate UX há > 24h
- Protótipos no 3º ciclo de refinamento (último antes de escalada)
- Violações de acessibilidade WCAG AA detectadas
- UCs sem protótipo vinculado quando F-20 está habilitado
- Telas sem versão mobile quando projeto exige responsividade
- Protótipos com design debt acumulado > threshold

## 7. Referências de Mercado

| Plataforma | Funcionalidade inspiradora |
|------------|---------------------------|
| Figma | Design review status, library analytics, comments/feedback |
| Zeplin / Abstract | Design handoff coverage, review analytics, version control |
| InVision | Design review workflow, approval/rejection tracking |
| Maze | Usability metrics, task completion, click analysis |
| UserTesting | Usability scoring, heuristic evaluation |
| axe DevTools / Stark | Accessibility dashboard, WCAG compliance scoring |
| Overflow | User flow mapping, journey visualization |
| Storybook | Component library analytics, design system compliance |

## 8. Wireframe Conceitual
┌──────────────────────────────────────────────────────────────────┐
│ 🔔 2 protótipos no Gate UX │ 1 no 3º ciclo │ 3 violações a11y │
├──────────────────────────────────────────────────────────────────┤
│ [Projeto ▾] [Status ▾] [Plataforma ▾] [Acessibilidade ▾] │
├────────────────────┬─────────────────────┬───────────────────────┤
│ PROTÓTIPOS │ GATE UX │ COBERTURA │
│ ┌──┐ ┌──┐ ┌──┐ │ Pendentes: 2 🔴 │ UC com tela: 75% │
│ │ 5│ │ 8│ │ 2│ │ Tempo médio: 1.5d │ ████████░░░ │
│ └──┘ └──┘ └──┘ │ Aprovação 1ª: 60% │ WEB+Mobile: 60% │
│ DRAFT FINAL Rejeit │ Ciclo 3: 1 ⚠️ │ Só WEB: 40% ⚠️ │
├────────────────────┼─────────────────────┼───────────────────────┤
│ CONSISTÊNCIA │ ACESSIBILIDADE │ FEEDBACK LOOP │
│ Reuso design: 82% │ WCAG AA: 85% │ DRAFT→FINAL: 2.1d │
│ Desvios: 3 ⚠️ │ Violações: 3 🔴 │ Idas/voltas: 1.4 │
│ Nav incons.: 1 │ Sem check: 2 ⚠️ │ Aprovação 1ª: 60% │
├────────────────────┴─────────────────────┴───────────────────────┤
│ 📋 PROTÓTIPOS PENDENTES DE AÇÃO │
│ ┌──────────┬──────────┬─────────┬──────────┬──────────────────┐ │
│ │ Protótipo│ UC │ Status │ Ciclo │ Ação │ │
│ ├──────────┼──────────┼─────────┼──────────┼──────────────────┤ │
│ │ PT-001 │ UC-005 │ DRAFT │ 1/3 │ [Revisar] │ │
│ │ PT-002 │ UC-012 │ DRAFT │ 3/3 ⚠️ │ [Aprovar|Escalar]│ │
│ │ PT-003 │ UC-008 │ Rejeit. │ 2/3 │ [Ver feedback] │ │
│ └──────────┴──────────┴─────────┴──────────┴──────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ 📊 PADRÕES DE REJEIÇÃO (últimas 20 revisões) │
│ Navegação confusa ████████ 35% │
│ Falta empty state ██████ 25% │
│ Acessibilidade █████ 20% │
│ Inconsistência ████ 15% │
│ Outro █ 5% │
└──────────────────────────────────────────────────────────────────┘
