---
plan_id: PLAN-20260304-002
task_id: T06
title: "Gerar application/BackofficeService.java"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: [T01, T03]
parallel_with: [T05]
---

## Tarefa T06 — `BackofficeService.java`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-5.1-Codex` — Use cases orquestrando domínio
**Depende de:** T01, T03
**Paralelo com:** T05

---

### Objetivo

Implementar a camada de aplicação para orquestrar casos de uso com `BackofficeRepository` e `BackofficeMapper`, sem expor entidades JPA.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; serviço com `@Service`, `@RequiredArgsConstructor` e transacionalidade para escrita; integração com contratos OpenAPI gerados.

---

### Especificação Técnica

<!-- A ser detalhada pelo agente executor com base no blueprint referenciado -->

---

### Riscos Específicos

— Sem riscos específicos identificados além dos listados no plano pai.

---

### Artefatos de Saída

<!-- A ser preenchido pelo agente executor -->

---

### Critérios de Aceite

<!-- A ser preenchido pelo agente executor -->
