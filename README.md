# deep-ion
Fábrica de Software Autônoma operada por agentes de IA, integrada ao GitHub Issues e Pull Requests via GitHub Actions.

---

## Comandos Disponíveis nas Issues

Os comandos abaixo são postados como comentários nas Issues e PRs para acionar etapas do pipeline. Apenas membros autorizados podem executá-los.

### Gate 1 — Aprovação de Descoberta (DOM-01 → DOM-02)

| Comando | Descrição |
|---------|-----------|
| `/gate1-approve` | Aprova a classificação de impacto e inicia a análise de requisitos (DOM-02) |
| `/gate1-reject <motivo>` | Rejeita a demanda com justificativa |

### Checkpoint A — Revisão do BAR (SKILL-REQ-01)

| Comando | Descrição |
|---------|-----------|
| `/ba-approve` | Aprova o Business Analysis Record (BAR) e avança para modelagem de Use Cases |
| `/ba-reject <motivo>` | Rejeita o BAR com justificativa |
| `/ba-revise <campo>=<valor>` | Solicita revisão de um campo específico do BAR |

### Gate 2 — Aprovação de Requisitos (DOM-05a → DOM-03)

| Comando | Descrição |
|---------|-----------|
| `/gate2-approve` | Aprova os artefatos de requisitos (Use Cases + Matriz + TestPlan) e inicia a arquitetura (DOM-03) |
| `/gate2-reject <motivo>` | Rejeita os artefatos com justificativa |

### Gate 3 — Aprovação de Arquitetura (DOM-03 → DOM-04)

| Comando | Descrição |
|---------|-----------|
| `/gate3-approve` | Aprova a arquitetura (ADR + esqueleto) e inicia o desenvolvimento (DOM-04) |
| `/gate3-reject <motivo>` | Rejeita a arquitetura com justificativa |

### Gate 4 — Aprovação Técnica do PR (DOM-05b → merge)

| Comando | Descrição |
|---------|-----------|
| `/gate4-approve` | Aprova o PR após QA técnico e libera para homologação |
| `/gate4-reject <motivo>` | Rejeita o PR com justificativa |

### Reclassificação de Impacto

| Comando | Descrição |
|---------|-----------|
| `/reclassify-T0` | Reclassifica a demanda como **T0** — Trivial (pipeline autônomo) |
| `/reclassify-T1` | Reclassifica a demanda como **T1** — Semi-autônomo |
| `/reclassify-T2` | Reclassifica a demanda como **T2** — Multi-gate (5 gates) |
| `/reclassify-T3` | Reclassifica a demanda como **T3** — Totalmente assistido (nenhuma etapa autônoma) |

---

## Fluxo do Pipeline

```
Issue aberta
  → DOM-01 Discovery Agent        (classificação T0..T3)
      → [Gate 1] /gate1-approve

  → DOM-02 Requirements Agent
      → SKILL-REQ-00: Detector de duplicatas/conflitos
      → SKILL-REQ-01: Business Analysis Record (BAR)
          → [Checkpoint A] /ba-approve
      → SKILL-REQ-02: Use Cases + Matriz de Rastreabilidade

  → DOM-05a QA Negocial Agent     (audita artefatos antes do Gate 2)
      → [Gate 2] /gate2-approve

  → DOM-03 Architecture Agent     (ADR + esqueleto de código)
      → [Gate 3] /gate3-approve

  → DOM-04 Dev Agent              (PR com implementação + testes)

  → DOM-05b QA Técnico Agent      (audita o PR antes do Gate 4)
      → [Gate 4] /gate4-approve

      → [Gate 5] Homologação      (QA + PO)
```

---

## Classificação de Impacto (T0 → T3)

| Classe | Score | Autonomia |
|--------|-------|-----------|
| **T0** | 1.0–2.5 | Agente implementa → aprovação humana funcional → prod |
| **T1** | 2.6–4.5 | Gates: QA Review + Validação funcional |
| **T2** | 4.6–6.5 | 5 gates: Negocial → Requisitos → Arquitetural → Code Review → Homologação |
| **T3** | 6.6–9.0 | Nenhuma etapa autônoma — agente como acelerador de análise |