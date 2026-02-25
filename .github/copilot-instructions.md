# Copilot Instructions — deep-ion-agents

## Repository Purpose

This repo contains **specifications and Python scripts** for an AI agent pipeline that automates the software development lifecycle of a Spring Modulith fintech application. Agents run as isolated Python processes triggered by GitHub Actions and communicate exclusively via GitHub Issue/PR comments.

## Pipeline Architecture

The agent sequence is: `DOM-01 → DOM-02 → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4`

| Agent | Role | Trigger |
|---|---|---|
| DOM-02 | Requirements analysis (BAR + Use Cases + Traceability Matrix) | `/gate1-approve` comment |
| DOM-05a | Business QA audit pre-Gate 2 (completeness, consistency, test plan) | label `gate/2-aguardando` |
| DOM-05b | Technical QA audit pre-Gate 4 (coverage, architecture, RN conformance) | PR `opened`/`synchronize` |

Specs live in `agents_specs/`. Implementations go in `.github/{requirements,qa_negocial,qa_tecnico}/`.

## Core Design Rules

1. **Process isolation is sacred.** Each skill is a separate Python script invoked with `--issue N` or `--pr N`. No shared state, no direct inter-skill calls — only GitHub API reads.
2. **GitHub comments are the message bus.** A skill reads its input from Issue comments; publishes output as a new comment.  Downstream skills search for comments by prefix (e.g., `"## TestPlan-"`, `"## BAR-"`).
3. **Labels drive the state machine.** Never bypass label transitions — they are the pipeline's control flow. Labels like `req/bar-aprovado` or `qa/bloqueado` gate the next agent.
4. **Decisions are deterministic, not inferred.** The RN→FE mapping in `rn_catalog.py` is hardcoded. LLM inference is only for analysis skills (REQ-01, QAN-01, QAT-02) with `confidence_score` tracked.
5. **`confidence_score < 0.65` must escalate** — never silently resolve ambiguity or infer missing data.

## Business Rules Catalog (RN-01..RN-07)

These rules are central to all 3 agents. Each triggered RN has a **deterministic FE** that must be generated:

| RN | Domain check | Mandatory FE |
|---|---|---|
| RN-01 | `podeDebitar()` before any debit | Saldo Insuficiente |
| RN-02 | Transfer inside `@Transactional`, atomic dual-entry | Falha na atomicidade |
| RN-03 | Block deletion of `CONFIRMADA` transactions | Tentativa de exclusão de transação confirmada |
| RN-04 | Budget filter: `status = CONFIRMADA` only | Período inválido |
| RN-05 | Publish `MetaAtingidaEvent` when goal reached | None (event, not FE) |
| RN-06 | Block deletion of `padrao = true` categories | Tentativa de exclusão de categoria padrão |
| RN-07 | Cash flow report: `status = CONFIRMADA` only | Transação não confirmada excluída |

## Classification System (T0–T3)

Demands are classified T0 (trivial) → T3 (critical). This affects autonomous blocking behavior:
- **A1/A2/A6/R1/R2/R3 failures block ALL classes** (architecture invariants, RN violations, missing Flyway migration).
- **LGPD (B7) blocks ALL classes** — never autonomous on personal data.
- T0 blocks autonomously for most critical checks; T1+ escalates to human Gate.

## Audit Ledger

Every decision emits an append-only `DecisionRecord` JSON (see specs for schema). Fields that are always required when `decision = "block"` or `"escalar"`: `justification`, `rn_triggered`, `confidence_score`.

## Skill Invocation Pattern

```bash
python .github/requirements/skill_req_00.py --issue 42
python .github/qa_negocial/skill_qan_00.py --issue 42
python .github/qa_tecnico/skill_qat_00.py --pr 87
```

Skills within an agent run sequentially (00 → 01 → 02); each reads the previous skill's comment from the Issue/PR before proceeding.

## Architecture Compliance (Spring Modulith targets)

When implementing QAT-01 (`skill_qat_01.py`):
- Run `./mvnw test -pl . -Dtest=ModulithArchitectureTest -q` to validate module boundaries.
- Cross-module communication must use `ApplicationEventPublisher` — direct imports between modules = blocker.
- Flyway migration file `V{N}__{description}.sql` is mandatory for any schema change.

## Key Spec Files

- [agents_specs/DOM-02_SPEC.md](agents_specs/DOM-02_SPEC.md) — Requirements pipeline (BAR format, UC canonical schema, Traceability Matrix)
- [agents_specs/DOM-05a_SPEC.md](agents_specs/DOM-05a_SPEC.md) — Business QA (completeness checks C1–C6, consistency B1–B7, TestPlan format)
- [agents_specs/DOM-05b_SPEC.md](agents_specs/DOM-05b_SPEC.md) — Technical QA (coverage T1–T6, arch A1–A7, RN audit R1–R3)
