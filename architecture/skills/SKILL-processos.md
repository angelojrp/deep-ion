# SKILL — Processos da Fábrica de Software

## Catálogo de Processos

A fábrica opera com processos formais, rastreáveis e auditáveis. Cada processo possui entradas, saídas, responsáveis e critérios de aceite definidos.

---

## PROC-001 — Discovery e Classificação de Demanda

**Trigger:** Issue criada ou editada no GitHub
**Responsável:** DOM-01 (Discovery Agent)
**Classificação T:** Determinada automaticamente

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Recepção da demanda | Qualquer stakeholder | Issue GitHub | Issue com corpo estruturado | Título + descrição mínima presentes |
| 2 | Análise de zona cinzenta (5 dimensões) | DOM-01 | Issue | Scores por dimensão | 5 análises executadas |
| 3 | Cálculo de score ponderado | DOM-01 | Scores | Score final T0..T3 | Score dentro dos limites definidos |
| 4 | Geração de DecisionRecord | DOM-01 | Score final | DecisionRecord no Audit Ledger | Registro append-only gravado |
| 5 | Aplicação de label de gate | DOM-01 | Classificação | Label `gate/1-aguardando` | Label visível na issue |
| 6 | Aprovação Gate 1 | PO / Domain Expert | DecisionRecord | Comentário `/gate1-approve` | Comentário registrado na issue |

**Exceções:**
- Se `confidence_score < 0.65` → escalada automática ao Risk Arbiter
- Se item 5 da zona cinzenta (LGPD) for positivo → aprovação humana obrigatória em qualquer classe

---

## PROC-002 — Análise de Requisitos

**Trigger:** `/gate1-approve` pelo PO
**Responsável:** DOM-02 (Requirements Agent)
**Pré-condição:** Gate 1 aprovado

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Detecção de duplicatas e conflitos | SKILL-REQ-00 (auto) | Issue + RNs existentes | Relatório de conflitos | Resposta em ≤60s |
| 2 | Produção do BAR | SKILL-REQ-01 | Issue aprovada | BusinessAnalysisRecord | BAR com todos os campos obrigatórios |
| 3 | Checkpoint A — Aprovação do BAR | Analista / PO | BAR | Comentário `/ba-approve` | Aprovação explícita registrada |
| 4 | Geração de Use Cases + Matriz | SKILL-REQ-02 | BAR aprovado (não a issue!) | UCs Gherkin + Matriz de Rastreabilidade | Cada UC rastreável ao BAR |

**Regra crítica:** SKILL-REQ-02 lê **exclusivamente** o BAR aprovado — nunca a issue original.

---

## PROC-003 — QA Negocial (Pré-Gate 2)

**Trigger:** Label `gate/2-aguardando`
**Responsável:** DOM-05a (QA Negocial Agent)
**Pré-condição:** PROC-002 concluído

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Verificação de completude | SKILL-QAN-00 (auto) | UCs + Gherkin + Matriz | Relatório de completude | Resposta em ≤45s |
| 2 | Análise de consistência negocial | SKILL-QAN-01 | BAR + UCs + RNs | Relatório de consistência | BAR→UC→RN sem contradições |
| 3 | Geração de TestPlan | SKILL-QAN-02 | Artefatos completos | `TestPlan-{ID}` | Contrato formal para DOM-05b |
| 4 | Aprovação Gate 2 | PO + Tech Lead | Relatórios + TestPlan | Comentário `/gate2-approve` | Aprovação explícita de ambos |

**Regras de bloqueio:**
- T0: falha crítica → BLOQUEIO automático (sem escalar)
- T1/T2/T3: falha crítica → alerta, Gate 2 decide
- LGPD: bloqueio em **todas** as classes sem exceção

---

## PROC-004 — Decisão Arquitetural

**Trigger:** `/gate2-approve`
**Responsável:** DOM-03 (Architecture Agent)
**Pré-condição:** Gate 2 aprovado + TestPlan gerado

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Análise de impacto arquitetural | DOM-03 | UCs + Matriz + TestPlan | Análise de fronteiras | Módulos afetados identificados |
| 2 | Produção de ADR | DOM-03 | Análise | ADR com alternativas + consequências | ADR seguindo template padrão |
| 3 | Geração de esqueleto de código | DOM-03 | ADR | Esqueleto + fronteiras Modulith | Limites de módulo respeitados |
| 4 | Aprovação Gate 3 | Tech Lead + Arquiteto | ADR + esqueleto | Comentário `/gate3-approve` | Aprovação de ambos |

---

## PROC-005 — Implementação

**Trigger:** `/gate3-approve`
**Responsável:** DOM-04 (Dev Agent)
**Pré-condição:** Gate 3 aprovado + ADR + esqueleto

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Implementação conforme ADR | DOM-04 | ADR + esqueleto + UCs | Código implementado | Convenções SKILL-convencoes.md respeitadas |
| 2 | Testes unitários e integração | DOM-04 | TestPlan-{ID} | Testes implementados | Cobertura ≥80%, todos os cenários do TestPlan |
| 3 | Self-review checklist | DOM-04 | Código + testes | Checklist preenchido | Todos os itens verificados |
| 4 | Abertura de PR | DOM-04 | Código completo | PR no GitHub | PR com descrição e checklist |

---

## PROC-006 — QA Técnico (Pré-Gate 4)

**Trigger:** `pull_request.opened` / `pull_request.synchronize`
**Responsável:** DOM-05b (QA Técnico Agent)
**Pré-condição:** PR aberto + `TestPlan-{ID}` aprovado

| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|
| 1 | Verificação de cobertura | SKILL-QAT-00 | PR + TestPlan | Relatório de cobertura | ≥80% + todos os cenários do TestPlan |
| 2 | Compliance arquitetural | SKILL-QAT-01 | PR + ADR | Relatório Modulith | Fronteiras + migrations válidas |
| 3 | Auditoria de RNs no código | SKILL-QAT-02 | PR + RN-01..RN-07 | Relatório de conformidade | RNs implementadas corretamente |
| 4 | Aprovação Gate 4 | Tech Lead | Relatórios DOM-05b | Comentário `/gate4-approve` | Aprovação com base nos relatórios |
| 5 | Homologação (Gate 5) | QA + PO | Build em staging | Aceite funcional | Funcionalidades conforme UCs |

**Bloqueio incondicional (independe de T):**
- A1 (cobertura insuficiente), A2 (fronteira Modulith violada), A6 (Flyway inválido)
- R1 (RN-01), R2 (RN-02), R3 (RN-03)

---

## Processo Transversal — Escalada e Reclassificação

| Condição | Ação | Responsável |
|----------|------|-------------|
| `confidence_score < 0.65` | Escalar para Risk Arbiter | Automático (qualquer agente) |
| `risk_level == CRITICAL` | Bloquear + escalar para humano | Automático |
| `reversibility == IRREVERSIBLE AND risk_level == HIGH` | Escalar para humano | Automático |
| Dado pessoal (LGPD) | Aprovação humana obrigatória | Gate responsável |
| `/reclassify-T{n}` | Reclassificação com novo DecisionRecord | PO ou Tech Lead |
| Reclassificação pós-Gate 2 | Reabertura obrigatória do fluxo | PO + Tech Lead |

---

## Artefatos Obrigatórios por Classe

| Artefato | T0 | T1 | T2 | T3 |
|----------|----|----|----|----|
| DecisionRecord | ✅ | ✅ | ✅ | ✅ |
| BAR | — | ✅ | ✅ | ✅ |
| Use Cases (Gherkin) | — | ✅ | ✅ | ✅ |
| Matriz de Rastreabilidade | — | — | ✅ | ✅ |
| TestPlan | — | ✅ | ✅ | ✅ |
| ADR | — | — | ✅ | ✅ |
| Gate 1 (PO) | — | ✅ | ✅ | ✅ |
| Gate 2 (PO + TL) | — | — | ✅ | ✅ |
| Gate 3 (TL + Arq.) | — | — | ✅ | ✅ |
| Gate 4 (TL) | — | ✅ | ✅ | ✅ |
| Gate 5 (QA + PO) | — | — | ✅ | ✅ |

> **T0:** Pipeline autônomo — apenas DecisionRecord e aprovação funcional final.
> **T3:** Nenhuma etapa autônoma — humano decide em cada gate.

---

## Checklist de Auditoria de Processo

Para cada demanda, verificar:

- [ ] DecisionRecord gerado com score e classificação
- [ ] Label de gate correto aplicado
- [ ] Gates aprovados na ordem correta (sem saltos)
- [ ] Artefatos obrigatórios para a classe T presentes
- [ ] Responsável correto atuou em cada gate (conforme RACI)
- [ ] Cadeia de rastreabilidade íntegra: Issue → DecisionRecord → BAR → UC → ADR → PR → TestPlan
- [ ] Bloqueios automáticos respeitados (RN-01..RN-03, LGPD)
- [ ] Escaladas executadas quando `confidence_score < 0.65`
- [ ] Nenhum agente atuou fora de seu escopo definido
- [ ] Audit Ledger com 100% de cobertura de decisões
