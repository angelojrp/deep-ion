---
plan_id: PLAN-20260304-002
task_id: T02
title: "Gerar pom.xml aggregator e backoffice-contracts/pom.xml"
agent: DOM-03/Dev
model: GPT-4o
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: []
parallel_with: [T01]
---

## Tarefa T02 — `pom.xml aggregator e contracts`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-4o` — Configuração Maven + openapi-generator plugin
**Depende de:** —
**Paralelo com:** T01

---

### Objetivo

Criar os descritores Maven do agregador e do módulo `backoffice-contracts`, incluindo configuração de geração OpenAPI conforme padrões do blueprint.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; módulo alvo `backoffice`; submódulo `backoffice-contracts` isolado de core; geração de interface OpenAPI em módulo de contrato.

---

### Especificação Técnica

<!-- A ser detalhada pelo agente executor com base no blueprint referenciado -->

---

### Riscos Específicos

Versão incompatível de MapStruct com Lombok em `annotationProcessorPaths` (MÉDIO).

---

### Artefatos de Saída

<!-- A ser preenchido pelo agente executor -->

---

### Critérios de Aceite

<!-- A ser preenchido pelo agente executor -->
