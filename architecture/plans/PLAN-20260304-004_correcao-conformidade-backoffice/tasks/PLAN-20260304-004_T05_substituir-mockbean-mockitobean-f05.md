---
plan_id: PLAN-20260304-004
task_id: T05
title: "Substituir @MockBean por @MockitoBean em BackofficeControllerTest (F05)"
agent: DOM-03/Dev
model: GPT-4o
status: CONCLUIDO
depends_on: []
parallel_with: [T01, T02, T03, T04]
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T05 — Substituir `@MockBean` por `@MockitoBean` (F05)

**Plano pai:** [PLAN-20260304-004](../PLAN-20260304-004_correcao-conformidade-backoffice.md)  
**Achado de origem:** F05 — INFORMATIVO  
**Agente executor:** DOM-03/Dev  
**Modelo sugerido:** `GPT-4o`  
**Depende de:** —  
**Paralelo com:** T01, T02, T03, T04

---

### Objetivo

Substituir a anotação `@MockBean` (deprecated no Spring Boot 3.4+) por `@MockitoBean` no arquivo `BackofficeControllerTest.java`, eliminando o warning de compilação.

---

### Localização

**Arquivo:** `backoffice-core/src/test/java/net/deepion/backoffice/api/BackofficeControllerTest.java`  
**Linha afetada:** linha 8 (import + uso de `@MockBean`)

---

### Especificação Técnica

1. Substituir import:
   ```java
   // Remover:
   import org.springframework.boot.test.mock.mockito.MockBean;

   // Adicionar:
   import org.springframework.test.context.bean.override.mockito.MockitoBean;
   ```

2. Substituir anotação na declaração de campo:
   ```java
   // Antes:
   @MockBean
   private BackofficeService backofficeService;

   // Depois:
   @MockitoBean
   private BackofficeService backofficeService;
   ```

3. Aplicar para **todas** as ocorrências de `@MockBean` no arquivo (pode haver mais de uma).

---

### Critérios de Aceite

- [ ] Nenhuma ocorrência de `@MockBean` no arquivo após a alteração
- [ ] Import `org.springframework.boot.test.mock.mockito.MockBean` removido
- [ ] Import `org.springframework.test.context.bean.override.mockito.MockitoBean` adicionado
- [ ] Compilação sem warnings de deprecação

---

### Artefatos de Saída

- `BackofficeControllerTest.java` — `@MockitoBean` substituindo `@MockBean`
