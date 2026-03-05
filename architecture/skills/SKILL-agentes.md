# SKILL — Agentes da Fábrica (DOM-01..DOM-05b)

## DOM-01 — Discovery Agent ✅ Implementado

**Responsabilidade:** Classificar demandas em T0..T3 com score ponderado.
**Disparo:** `issues.opened` / `issues.edited`
**Output:** `DecisionRecord` no Audit Ledger + label `gate/1-aguardando`

**Executa obrigatoriamente:**
- 5 análises de zona cinzenta (Consumer, BRF, Persistence, Contract, Regulatory)
- Score por dimensão → classificação T0..T3

---

## DOM-02 — Requirements Agent 📋 Especificado

**Responsabilidade:** Transformar issue aprovada em artefatos de requisitos canônicos.
**Disparo:** `/gate1-approve`
**Spec:** `DOM-02_SPEC.md`

| Skill          | Ação                                                               | Output                           |
|----------------|--------------------------------------------------------------------|----------------------------------|
| SKILL-REQ-00   | Detecta duplicatas e conflitos com RNs existentes                  | Relatório de conflitos (auto 60s)|
| SKILL-REQ-01   | Produz BusinessAnalysisRecord (BAR)                                | BAR → aguarda Checkpoint A       |
| SKILL-REQ-02   | Lê BAR aprovado → gera Use Cases (Gherkin) + Matriz Rastreabilidade| UCs + Matriz                     |

**Restrição crítica:** SKILL-REQ-02 lê **apenas o BAR aprovado** — nunca a issue original.

---

## DOM-03 — Architecture Agent 🔜 Planejado

**Responsabilidade:** Produzir decisões arquiteturais e esqueleto de código.
**Disparo:** `/gate2-approve`

**Executa:**
- Produz ADRs com alternativas e consequências
- Verifica fronteiras de módulo Spring Modulith
- Gera esqueleto de código para DOM-04

---

## DOM-04 — Dev Agent 🔜 Planejado

**Responsabilidade:** Implementar código conforme plano arquitetural.
**Disparo:** `/gate3-approve`

**Executa:**
- Implementa seguindo convenções obrigatórias (`SKILL-convencoes.md`)
- Abre PR com checklist self-review
- Inclui testes unitários e de integração conforme `TestPlan-{ID}`

---

## DOM-05a — QA Negocial Agent 📋 Especificado

**Responsabilidade:** Auditar artefatos de requisitos **antes** do Gate 2.
**Disparo:** Label `gate/2-aguardando`
**Spec:** `DOM-05a_SPEC.md`
**Posição no pipeline:** Entre DOM-02 e Gate 2 — independente do DOM-04

| Skill          | Ação                                                                | Autonomia de bloqueio             |
|----------------|---------------------------------------------------------------------|-----------------------------------|
| SKILL-QAN-00   | Verifica completude: schema UC, Gherkin, FEs determinísticos, Matriz| Auto 45s                          |
| SKILL-QAN-01   | Consistência negocial BAR→UC→RN, conflitos entre UCs, escopo LGPD  | —                                 |
| SKILL-QAN-02   | Gera `TestPlan-{ID}` — contrato formal de entrada para DOM-05b      | T0: bloqueia / T1+: alerta Gate 2 |

**LGPD bloqueia em todas as classes sem exceção.**

---

## DOM-05b — QA Técnico Agent 📋 Especificado

**Responsabilidade:** Auditar PR do DOM-04 **antes** do Gate 4.
**Disparo:** `pull_request.opened` / `pull_request.synchronize`
**Spec:** `DOM-05b_SPEC.md`
**Entrada obrigatória:** `TestPlan-{ID}` gerado pelo DOM-05a

| Skill          | Ação                                                                | Autonomia de bloqueio              |
|----------------|---------------------------------------------------------------------|------------------------------------|
| SKILL-QAT-00   | Verifica cobertura ≥ 80% e presença de todos os testes do TestPlan  | T0/T1: REQUEST_CHANGES auto        |
| SKILL-QAT-01   | Executa ModulithArchitectureTest, fronteiras, migrations Flyway     | T0/T1: REQUEST_CHANGES auto        |
| SKILL-QAT-02   | Audita conformidade RN-01..RN-07 no código implementado             | R1/R2/R3: bloqueio em qualquer classe |

**Bloqueio incondicional (independe da classe T):**
- A1 (cobertura insuficiente), A2 (fronteira Modulith violada), A6 (Flyway inválido)
- R1 (RN-01), R2 (RN-02), R3 (RN-03)

---

## Princípios de Implementação (todos os agentes)

1. **Processo independente:** cada skill é um script Python 3.12 invocado como processo separado pela GitHub Action
2. **Orquestração por evento:** sequência governada por labels/comentários GitHub — não por código Python
3. **Canal único:** skills se comunicam via comentários estruturados na Issue (ou PR Review para DOM-05b)
4. **Ambiguidade explicitada:** nenhum agente resolve silenciosamente uma dúvida — ambiguidades críticas bloqueiam
5. **Audit Ledger obrigatório:** toda decisão gera `DecisionRecord` append-only com cobertura de 100%