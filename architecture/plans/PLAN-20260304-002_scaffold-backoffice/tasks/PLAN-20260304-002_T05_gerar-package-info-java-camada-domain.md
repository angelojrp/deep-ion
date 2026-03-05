---
plan_id: PLAN-20260304-002
task_id: T05
title: "Gerar package-info.java e camada domain"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: [T01, T03]
parallel_with: [T06]
---

## Tarefa T05 — `package-info.java e domain`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-5.1-Codex` — Modelos Pydantic-equivalent (Lombok @Data)
**Depende de:** T01, T03
**Paralelo com:** T06

---

### Objetivo

Criar `package-info.java` com `@ApplicationModule` e estruturar a camada de domínio (`Backoffice` e `BackofficeRepository`) mantendo isolamento de infraestrutura e Spring.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; módulo `net.deepion.backoffice`; domínio puro sem anotações de persistência; interface de repositório como port de domínio.

---

### Especificação Técnica

<!-- A ser detalhada pelo agente executor com base no blueprint referenciado -->

---

### Riscos Específicos

Conflito de nome com pacote `net.deepion.backoffice` já existente (BLOQUEANTE).

---

### Artefatos de Saída

<!-- A ser preenchido pelo agente executor -->

---

### Critérios de Aceite

<!-- A ser preenchido pelo agente executor -->
