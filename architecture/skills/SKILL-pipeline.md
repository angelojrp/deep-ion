# SKILL — Pipeline da Fábrica

## Pipeline Completo T2

```
Issue GitHub
  → DOM-01 Discovery Agent
      → DecisionRecord + classificação T0..T3
        → [Gate 1] /gate1-approve  (PO / Domain Expert)

  → DOM-02 Requirements Agent
      → SKILL-REQ-00: Duplicate & Conflict Detector       (auto, 60s)
      → SKILL-REQ-01: Business Analyst Agent              → BusinessAnalysisRecord (BAR)
          → [Checkpoint A] /ba-approve                    (Analista / PO)
      → SKILL-REQ-02: Use Case Modeler Agent              → Use Cases + Matriz de Rastreabilidade

  → DOM-05a QA Negocial Agent                             ← audita artefatos ANTES do Gate 2
      → SKILL-QAN-00: Artifact Completeness Checker       (auto, 45s)
      → SKILL-QAN-01: Business Consistency Analyzer       → consistência BAR→UC→RN
      → SKILL-QAN-02: Test Plan Generator                 → TestPlan-{ID} (contrato para DOM-05b)
          → [T0] falha crítica → BLOQUEIO automático
          → [T1/T2/T3] falha crítica → alerta, Gate 2 decide

        → [Gate 2] /gate2-approve                         (PO + Tech Lead)

  → DOM-03 Architecture Agent
      → ADR + esqueleto de código
        → [Gate 3] /gate3-approve                         (Tech Lead + Arquiteto)

  → DOM-04 Dev Agent
      → PR com implementação + testes

  → DOM-05b QA Técnico Agent                              ← audita o PR ANTES do Gate 4
      → SKILL-QAT-00: Test Coverage Verifier              → cobertura vs TestPlan-{ID}
      → SKILL-QAT-01: Architecture Compliance Checker     → Modulith + fronteiras + Flyway
      → SKILL-QAT-02: RN Implementation Auditor           → conformidade RN-01..RN-07 no código
          → [T0/T1] falha crítica → REQUEST_CHANGES automático
          → [T2/T3] falha crítica → alerta, Gate 4 decide

        → [Gate 4] /gate4-approve                         (Tech Lead)
        → [Gate 5] Homologação                            (QA + PO)
```

---

## Comandos de Gate (comentados nas Issues GitHub)

```
/gate1-approve        /gate1-reject <motivo>
/ba-approve           /ba-reject <motivo>       /ba-revise <campo>=<valor>
/gate2-approve        /gate2-reject <motivo>
/gate3-approve        /gate3-reject <motivo>
/gate4-approve        /gate4-reject <motivo>
/reclassify-T0        /reclassify-T1            /reclassify-T2     /reclassify-T3
```

---

## Labels de Controle de Estado

| Label                    | Significado                                   |
|--------------------------|-----------------------------------------------|
| `gate/1-aguardando`      | Aguardando aprovação Gate 1                   |
| `gate/1-aprovado`        | Gate 1 aprovado — dispara DOM-02              |
| `gate/2-aguardando`      | Aguardando Gate 2 — dispara DOM-05a           |
| `gate/2-aprovado`        | Gate 2 aprovado — dispara DOM-03              |
| `gate/3-aprovado`        | Gate 3 aprovado — dispara DOM-04              |
| `gate/4-aguardando`      | PR aberto — dispara DOM-05b                   |
| `gate/4-aprovado`        | Gate 4 aprovado — encaminha para homologação  |

---

## Triggers GitHub Actions

| Evento                           | Agente disparado |
|----------------------------------|------------------|
| `issues.opened` / `issues.edited`| DOM-01           |
| `issue_comment` `/gate1-approve` | DOM-02           |
| label `gate/2-aguardando`        | DOM-05a          |
| `issue_comment` `/gate2-approve` | DOM-03           |
| `issue_comment` `/gate3-approve` | DOM-04           |
| `pull_request.opened` / `.sync`  | DOM-05b          |

---

## Elo DOM-05a → DOM-05b

- DOM-05a **especifica** o que deve ser testado → gera `TestPlan-{ID}`
- DOM-05b **verifica** se DOM-04 implementou exatamente o TestPlan
- **Sem TestPlan aprovado → DOM-05b não pode operar** (contrato de entrada obrigatório)

---

## Regras de Escalonamento Automático (todos os agentes)

| Condição                                              | Ação                              |
|-------------------------------------------------------|-----------------------------------|
| `confidence_score < 0.65`                             | Escalar para Risk Arbiter         |
| `risk_level == CRITICAL`                              | Bloquear + escalar para humano    |
| `reversibility == IRREVERSIBLE AND risk_level == HIGH`| Escalar para humano               |
| Qualquer dado pessoal (LGPD)                          | Aprovação humana obrigatória      |

---

## Arquitetura de Controle

```
CONTROL PLANE
  ├── Policy Engine (OPA/Rego)   — políticas como código
  ├── Risk Arbiter               — decisões bloqueantes
  └── Audit Ledger               — append-only, cobertura 100%

DATA PLANE
  ├── DOM-01 → DOM-02 → DOM-03 → DOM-04 → DOM-05b
  └── DOM-05a (paralelo, pré-Gate 2)

SHARED KNOWLEDGE BUS
  └── Kafka/Pulsar + Vector Store + Graph DB
```