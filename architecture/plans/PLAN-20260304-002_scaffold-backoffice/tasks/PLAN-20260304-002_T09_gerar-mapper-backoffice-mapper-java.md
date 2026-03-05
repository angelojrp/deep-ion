---
plan_id: PLAN-20260304-002
task_id: T09
title: "Gerar mapper/BackofficeMapper.java"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: [T05, T03]
parallel_with: [T08]
---

## Tarefa T09 — `BackofficeMapper.java`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-5.1-Codex` — MapStruct DTO↔Domain↔JpaEntity
**Depende de:** T05, T03
**Paralelo com:** T08

---

### Objetivo

Implementar mapper MapStruct para os quatro fluxos de conversão entre DTO, domínio e entidade JPA sem lógica manual de transformação.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; pacote `net.deepion.backoffice.mapper`; `@Mapper(componentModel = "spring")` obrigatório.

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
