---
plan_id: PLAN-20260304-004
task_id: T04
title: "Documentar desvio aceito permitAll() em /actuator/health (F04)"
agent: DOM-03/Dev
model: GPT-4o
status: CONCLUIDO
depends_on: []
parallel_with: [T01, T02, T03, T05]
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T04 — Documentar desvio aceito `permitAll()` em `/actuator/health` (F04)

**Plano pai:** [PLAN-20260304-004](../PLAN-20260304-004_correcao-conformidade-backoffice.md)  
**Achado de origem:** F04 — BAIXO  
**Agente executor:** DOM-03/Dev  
**Modelo sugerido:** `GPT-4o`  
**Depende de:** —  
**Paralelo com:** T01, T02, T03, T05

---

### Objetivo

Adicionar comentário de documentação inline no `SecurityConfig.java` sobre a linha `.requestMatchers("/actuator/health").permitAll()`, formalizando o desvio como aceito e justificado. Não alterar a lógica.

---

### Localização

**Arquivo:** `backoffice-core/src/main/java/net/deepion/config/SecurityConfig.java`  
**Linha afetada:** linha da cláusula `.requestMatchers("/actuator/health").permitAll()`

---

### Especificação Técnica

Adicionar comentário imediatamente acima da linha afetada:

```java
// DESVIO ACEITO (F04): /actuator/health é público intencionalmente para
// health checks de load balancers e orquestradores de container.
// Aprovado em PLAN-20260304-004 — Gate 1.
.requestMatchers("/actuator/health").permitAll()
```

Nenhuma alteração de lógica é necessária.

---

### Critérios de Aceite

- [ ] Comentário de desvio presente imediatamente acima de `.requestMatchers("/actuator/health").permitAll()`
- [ ] Referência ao plano e gate de aprovação no comentário
- [ ] Nenhuma alteração de comportamento

---

### Artefatos de Saída

- `SecurityConfig.java` — comentário de desvio adicionado
