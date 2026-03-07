# PROC-008 — Responsabilidades e Matriz RACI

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PROC-008 |
| **Versão** | 1.0 |
| **Última atualização** | 2026-03-06 |
| **Responsável** | Gestor de Processos |

---

## Objetivo

Formalizar quem executa, aprova, é consultado e informado em cada etapa do pipeline, garantindo que nenhuma gate seja aprovada por parte não autorizada e que toda responsabilidade esteja claramente atribuída.

**Legenda:** `R` = Responsável (executa) | `A` = Aprova (accountable) | `C` = Consultado | `I` = Informado

---

## Matriz RACI — Agentes Autônomos

| Etapa / Artefato | DOM-01 | DOM-02 | DOM-03 | DOM-04 | DOM-05a | DOM-05b |
|------------------|:------:|:------:|:------:|:------:|:-------:|:-------:|
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
| Pull Request | — | — | — | **R** | — | — |
| Cobertura de Testes | — | — | — | — | — | **R** |
| Compliance Arquitetural | — | — | — | — | — | **R** |
| Auditoria de RNs no Código | — | — | — | — | — | **R** |

### Agentes Especializados de Governança de Prompts

> Adicionados por PLAN-20260306-002 em 2026-03-06.

| Etapa / Artefato | Governador de Prompts | QA Comportamental |
|-----------------|:--------------------:|:-----------------:|
| Frontmatter YAML de prompts | **R** | — |
| Inventário e classificação de prompt taxonomy | **R** | — |
| Designação de owners de task-prompts | C | — |
| Golden cases de regressão comportamental | — | **R** |
| Suite de behavioral regression tests | — | **R** |
| Constraint tests de system prompts | — | **R** |

---

## Matriz RACI — Profissionais Humanos

| Etapa / Gate | PO | Tech Lead | Arquiteto | QA | Domain Expert | Analista |
|-------------|:---:|:---------:|:---------:|:---:|:-------------:|:--------:|
| Gate 1 (Discovery) | **A** | I | — | — | **A** | — |
| Checkpoint A (BAR) | **A** | I | — | — | — | **A** |
| Gate 2 (Requisitos) | **A** | **A** | C | — | — | I |
| Gate 3 (Arquitetura) | I | **A** | **A** | — | — | — |
| Gate 4 (Code Review) | I | **A** | C | — | — | — |
| Gate 5 (Homologação) | **A** | I | — | **A** | — | — |
| Reclassificação | **A** | **A** | C | — | C | — |

---

## Responsabilidades por Agente Autônomo

### DOM-01 — Discovery Agent (✅ Implementado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Executar 5 análises de zona cinzenta; calcular score; gerar DecisionRecord; aplicar label |
| **NÃO DEVE** | Aprovar gates; editar artefatos de outros agentes; resolver ambiguidades silenciosamente |
| **ESCALA QUANDO** | `confidence_score < 0.65`; item 5 positivo (LGPD); `risk_level == CRITICAL` |

### DOM-02 — Requirements Agent (📋 Especificado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Detectar duplicatas (SKILL-REQ-00); produzir BAR (SKILL-REQ-01); gerar UCs + Matriz (SKILL-REQ-02) |
| **NÃO DEVE** | Ler issue original após Gate 1; pular Checkpoint A |
| **ESCALA QUANDO** | Conflito com RN existente; ambiguidade em regra de negócio |

### DOM-03 — Architecture Agent (🔜 Planejado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Produzir ADR com alternativas; verificar fronteiras Modulith; gerar esqueleto |
| **NÃO DEVE** | Implementar código completo; ignorar TestPlan; pular validação de fronteiras |
| **ESCALA QUANDO** | Impacto arquitetural em múltiplos módulos; mudança de contrato público |

### DOM-04 — Dev Agent (🔜 Planejado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Implementar conforme ADR + convenções; incluir testes conforme TestPlan; abrir PR |
| **NÃO DEVE** | Alterar decisões arquiteturais do ADR; ignorar TestPlan; pular self-review |
| **ESCALA QUANDO** | Impossibilidade técnica de implementar conforme ADR |

### DOM-05a — QA Negocial Agent (📋 Especificado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Verificar completude; analisar consistência BAR→UC→RN; gerar TestPlan |
| **NÃO DEVE** | Aprovar gates; alterar artefatos de requisitos; ignorar LGPD |
| **ESCALA QUANDO** | Inconsistência entre BAR e UCs; RN não coberta por TestPlan |

### DOM-05b — QA Técnico Agent (📋 Especificado)

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Verificar cobertura vs TestPlan; auditar Modulith; auditar RNs no código |
| **NÃO DEVE** | Operar sem TestPlan aprovado; aprovar PR diretamente; modificar código |
| **ESCALA QUANDO** | Violação de RN-01/RN-02/RN-03; fronteira Modulith violada |

### Governador de Prompts (✅ Implementado)

> Agente criado por PLAN-20260306-002 em 2026-03-06.

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Classificar artefatos pela taxonomia de 4 tipos, aplicar frontmatter correto por tipo, auditar ownership de prompts, processar edições em lote com verificação YAML |
| **NÃO DEVE** | Editar conteúdo comportamental de system prompts, executar código de aplicação, aprovar gates, calcular hash SHA-256 (responsabilidade do processo de merge em T05) |
| **ESCALA QUANDO** | Tipo de prompt não determinável pela taxonomia; conflito entre frontmatter existente e schema esperado; solicitação de edição de conteúdo comportamental |

### QA Comportamental (✅ Implementado)

> Agente criado por PLAN-20260306-002 em 2026-03-06.

| Coluna | Conteúdo |
|--------|----------|
| **DEVE** | Projetar golden cases para behavioral regression (SKILL-QAC-01), implementar testes pytest com schema validation (SKILL-QAC-02), criar constraint tests por restrição declarada (SKILL-QAC-03) |
| **NÃO DEVE** | Auditar cobertura de código de aplicação (DOM-05b), aprovar PRs, alterar system prompts para corrigir comportamentos detectados |
| **ESCALA QUANDO** | System prompt de agente não tem restrições declaradas formalmente; LLM em CI não disponível para testes não-mock; golden case specification recebida sem aprovação prévia do Arquiteto Corporativo |

---

## Responsabilidades por Papel Humano

### Product Owner (PO)
- **Gates:** 1 (A), Checkpoint A (A), 2 (A), 5 (A)
- **Pode:** Aprovar/rejeitar gates, reclassificar demandas, priorizar backlog
- **Não pode:** Aprovar Gate 3 ou 4 isoladamente

### Tech Lead
- **Gates:** 2 (A), 3 (A), 4 (A)
- **Pode:** Aprovar gates técnicos, reclassificar, revisar ADRs e PRs
- **Não pode:** Aprovar Gate 1 ou 5 isoladamente

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
2. **PO + Tech Lead devem ambos aprovar** no Gate 2 — aprovação unitária é insuficiente
3. **Tech Lead + Arquiteto devem ambos aprovar** no Gate 3
4. **Nenhum agente pode atuar em gate de outro agente** — DOM-04 não aprova output do DOM-03
5. **Reclassificação requer dois aprovadores** — PO + Tech Lead

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
