---
plan_id: PLAN-20260304-002
task_id: T04
title: "Gerar backoffice-core/pom.xml"
agent: DOM-03/Dev
model: GPT-4o
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: [T02]
parallel_with: [T03]
---

## Tarefa T04 — `backoffice-core/pom.xml`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-4o` — Depende de backoffice-contracts; deps Spring
**Depende de:** T02
**Paralelo com:** T03

---

### Objetivo

Configurar o `pom.xml` do módulo `backoffice-core` com dependência em `backoffice-contracts` e conjunto de bibliotecas runtime/teste previstas no plano.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; core depende de contracts; uso de Spring Modulith, Spring Boot, MapStruct e Lombok com processadores configurados no compilador Maven.

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
