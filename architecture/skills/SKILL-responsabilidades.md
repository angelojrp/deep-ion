# SKILL — Responsabilidades e Matriz RACI

## Visão Geral

Cada etapa do pipeline da fábrica possui responsáveis definidos — agentes autônomos e profissionais humanos. A Matriz RACI formaliza **quem faz**, **quem aprova**, **quem é consultado** e **quem é informado** em cada gate e artefato.

Legenda: **R** = Responsável (executa) | **A** = Aprova (accountable) | **C** = Consultado | **I** = Informado

---

## Matriz RACI — Pipeline Completo

### Agentes Autônomos

| Etapa / Artefato | DOM-01 | DOM-02 | DOM-03 | DOM-04 | DOM-05a | DOM-05b |
|------------------|--------|--------|--------|--------|---------|---------|
| DecisionRecord | **R** | I | I | — | — | — |
| Classificação T0..T3 | **R** | — | — | — | — | — |
| BAR | — | **R** | — | — | — | — |
| Use Cases + Gherkin | — | **R** | — | — | — | — |
| Matriz de Rastreabilidade | — | **R** | — | — | — | — |
| Relatório de Conflitos | — | **R** | — | — | — | — |
| Completude de Artefatos | — | — | — | — | **R** | — |
| Consistência Negocial | — | — | — | — | **R** | — |
| TestPlan | — | — | — | — | **R** | — |
| ADR | — | — | **R** | — | — | — |
| Esqueleto de Código | — | — | **R** | — | — | — |
| Implementação + Testes | — | — | — | **R** | — | — |
| PR | — | — | — | **R** | — | — |
| Cobertura de Testes | — | — | — | — | — | **R** |
| Compliance Arquitetural | — | — | — | — | — | **R** |
| Auditoria de RNs | — | — | — | — | — | **R** |

### Agentes de Governança

| Etapa / Artefato | Gestor de Squads | Diretor de Squads | Governador de Prompts | QA Comportamental | Risk Arbiter* |
|------------------|-----------------|-------------------|-----------------------|-------------------|---------------|
| Todos os gates (monitoramento) | **I** | I | — | — | — |
| Handoff Card (validação pós-gate) | **C** | — | — | — | — |
| Relatório de saúde de squad | **R** | I | — | — | — |
| Escalada crítica entre agentes | **R** | **A** | — | — | **C** |
| Auditoria de consistência BAR→UC→RN | — | — | — | **R** | — |
| Auditoria de prompts / agentes | — | — | **R** | — | — |
| Decisão em impasse (bloqueio) | C | **A** | — | — | **R** |

*Risk Arbiter: agente proposto (P1 do GAP-2)

### Profissionais Humanos

| Etapa / Gate | PO | Tech Lead | Arquiteto | QA | Domain Expert | Analista |
|-------------|-----|-----------|-----------|-----|---------------|----------|
| Gate 1 (Discovery) | **A** | I | — | — | **A** | — |
| Checkpoint A (BAR) | **A** | I | — | — | — | **A** |
| Gate 2 (Requisitos) | **A** | **A** | C | — | — | I |
| Gate 3 (Arquitetura) | I | **A** | **A** | — | — | — |
| Gate 4 (Code Review) | I | **A** | C | — | — | — |
| Gate 5 (Homologação) | **A** | I | — | **A** | — | — |
| Reclassificação | **A** | **A** | C | — | C | — |

---

## Responsabilidades por Agente

### DOM-01 — Discovery Agent
- **DEVE:** Executar 5 análises de zona cinzenta, calcular score, gerar DecisionRecord, aplicar label
- **NÃO DEVE:** Aprovar gates, editar artefatos de outros agentes, resolver ambiguidades silenciosamente
- **ESCALA QUANDO:** `confidence_score < 0.65`, item 5 positivo (LGPD), `risk_level == CRITICAL`

### DOM-02 — Requirements Agent
- **DEVE:** Detectar duplicatas (SKILL-REQ-00), produzir BAR (SKILL-REQ-01), gerar UCs + Matriz (SKILL-REQ-02)
- **NÃO DEVE:** Ler issue original após Gate 1 (ler apenas BAR), pular Checkpoint A
- **ESCALA QUANDO:** Conflito com RN existente, ambiguidade em regra de negócio

### DOM-03 — Architecture Agent
- **DEVE:** Produzir ADR com alternativas, verificar fronteiras Modulith, gerar esqueleto
- **NÃO DEVE:** Implementar código completo, ignorar TestPlan, pular validação de fronteiras
- **ESCALA QUANDO:** Impacto arquitetural em múltiplos módulos, mudança de contrato público

### DOM-04 — Dev Agent
- **DEVE:** Implementar conforme ADR + convenções, incluir testes conforme TestPlan, abrir PR
- **NÃO DEVE:** Alterar decisões arquiteturais do ADR, ignorar TestPlan, pular self-review
- **ESCALA QUANDO:** Impossibilidade técnica de implementar conforme ADR

### DOM-05a — QA Negocial Agent
- **DEVE:** Verificar completude, analisar consistência BAR→UC→RN, gerar TestPlan
- **NÃO DEVE:** Aprovar gates, alterar artefatos de requisitos, ignorar LGPD
- **ESCALA QUANDO:** Inconsistência entre BAR e UCs, RN não coberta por TestPlan

### DOM-05b — QA Técnico Agent
- **DEVE:** Verificar cobertura vs TestPlan, auditar Modulith, auditar RNs no código
- **NÃO DEVE:** Operar sem TestPlan aprovado, aprovar PR diretamente, modificar código
- **ESCALA QUANDO:** Violação de RN-01/RN-02/RN-03, fronteira Modulith violada

### Gestor de Squads
- **DEVE:** Monitorar handoffs, auditar desvios de escopo, registrar relatórios em `docs/squad/gestores`
- **NÃO DEVE:** Editar código, agentes, workflows ou executar comandos de terminal
- **ESCALA QUANDO:** Handoff IA→Humano ignorado; gate crítico aprovado sem revisor obrigatório; SLA ultrapassado

### Diretor de Squads
- **DEVE:** Definir composição estratégica de squads, emitir diagnósticos, aprovar escaladas críticas
- **NÃO DEVE:** Executar tarefas operacionais, editar artefatos de agentes diretamente
- **ESCALA QUANDO:** Desvio sistêmico insolúvel no nível operacional

### Governador de Prompts
- **DEVE:** Auditar qualidade e conformidade de prompts, revisar criação/modificação de agentes
- **NÃO DEVE:** Implementar código, aprovar gates de negócio ou técnicos
- **ESCALA QUANDO:** Prompt com risco de comportamento não determinístico ou fora de escopo

### QA Comportamental
- **DEVE:** Auditar consistência BAR→UC→RN, gerar TestPlan, bloquear Gate 2 quando inconsistências críticas
- **NÃO DEVE:** Aprovar gates, alterar artefatos de requisitos, operar sem BAR + Use Cases
- **ESCALA QUANDO:** Inconsistência crítica BAR→UC irresolúvel; LGPD implicado sem DPO

---

## Responsabilidades por Papel Humano

### Product Owner (PO)
- **Gates:** 1 (A), Checkpoint A (A), 2 (A), 5 (A)
- **Pode:** Aprovar/rejeitar gates, reclassificar demandas, priorizar backlog
- **Não pode:** Aprovar Gate 3 ou 4 isoladamente (precisa de Tech Lead)

### Tech Lead
- **Gates:** 2 (A), 3 (A), 4 (A)
- **Pode:** Aprovar gates técnicos, reclassificar, revisar ADRs e PRs
- **Não pode:** Aprovar Gate 1 ou 5 isoladamente (precisa de PO)

### Arquiteto
- **Gates:** 3 (A)
- **Pode:** Aprovar decisões arquiteturais, consultar em reclassificações
- **Não pode:** Aprovar gates negociais

### QA
- **Gates:** 5 (A)
- **Pode:** Validar funcionalidades em staging, aprovar homologação
- **Não pode:** Aprovar gates técnicos ou negociais

### Domain Expert
- **Gates:** 1 (A)
- **Pode:** Validar classificação de impacto no domínio
- **Consultado em:** Ambiguidades de regras de negócio

### Analista de Negócios
- **Gates:** Checkpoint A (A)
- **Pode:** Aprovar BAR, consultado em refinamento de requisitos

---

## Regras de Conflito de Responsabilidade

1. **Um gate nunca pode ser aprovado pelo solicitante da demanda** — princípio de segregação
2. **PO + Tech Lead devem ambos aprovar** no Gate 2 — aprovação de apenas um é insuficiente
3. **Tech Lead + Arquiteto devem ambos aprovar** no Gate 3
4. **Nenhum agente pode atuar em gate de outro agente** — DOM-04 não aprova output de DOM-03
5. **Reclassificação requer dois aprovadores** — PO + Tech Lead (exceto T0→T1 que PO pode fazer sozinho)

---

## Indicadores de Conformidade

| Indicador | Fórmula | Meta |
|-----------|---------|------|
| Taxa de conformidade de gates | Gates aprovados corretamente / Total de gates | ≥ 95% |
| Taxa de rastreabilidade | Cadeias completas / Total de demandas | 100% |
| Tempo médio em gate | Tempo entre label aplicado e aprovação | ≤ 4h (T0/T1), ≤ 8h (T2/T3) |
| Taxa de escaladas resolvidas | Escaladas resolvidas / Total de escaladas | ≥ 90% |
| Cobertura do Audit Ledger | Decisões registradas / Total de decisões | 100% |
| Desvios por sprint | Desvios encontrados em auditoria | Tendência decrescente |
