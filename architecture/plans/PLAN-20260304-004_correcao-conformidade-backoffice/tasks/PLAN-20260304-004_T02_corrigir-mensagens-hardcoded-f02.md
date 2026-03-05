---
plan_id: PLAN-20260304-004
task_id: T02
title: "Corrigir mensagens hardcoded em BackofficeService (F02)"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
depends_on: []
parallel_with: [T01, T03, T04, T05]
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T02 — Corrigir mensagens hardcoded em `BackofficeService.java` (F02)

**Plano pai:** [PLAN-20260304-004](../PLAN-20260304-004_correcao-conformidade-backoffice.md)  
**Achado de origem:** F02 — MÉDIO  
**Agente executor:** DOM-03/Dev  
**Modelo sugerido:** `GPT-5.1-Codex`  
**Depende de:** —  
**Paralelo com:** T01, T03, T04, T05

---

### Objetivo

Substituir as strings literais `"Backoffice not found"` nas linhas 41 e 55 de `BackofficeService.java` por mensagens internacionalizadas via `MessageSource`, usando a chave `backoffice.not-found` já definida nos arquivos `messages_pt_BR.properties` e `messages_en.properties`.

---

### Localização

**Arquivo:** `backoffice-core/src/main/java/net/deepion/backoffice/application/BackofficeService.java`  
**Linhas afetadas:** 41, 55

---

### Especificação Técnica

1. Adicionar `MessageSource` como dependência injetada via construtor:
   ```java
   private final MessageSource messageSource;
   ```

2. Substituir as strings literais pela chamada ao `MessageSource`:
   ```java
   // Antes:
   throw new EntityNotFoundException("Backoffice not found");

   // Depois:
   throw new EntityNotFoundException(
       messageSource.getMessage("backoffice.not-found", null, LocaleContextHolder.getLocale())
   );
   ```

3. **Imports adicionais necessários:**
   - `org.springframework.context.MessageSource`
   - `org.springframework.context.i18n.LocaleContextHolder`

4. Verificar que `messages_pt_BR.properties` contém a chave:
   ```
   backoffice.not-found=Backoffice n\u00e3o encontrado
   ```
   E `messages_en.properties`:
   ```
   backoffice.not-found=Backoffice not found
   ```

---

### Regra de Blueprint Reparada

`internationalization.backend.rules`:  
- "Must not hardcode user-facing messages"  
- "Exception messages exposed to API must be localized"

---

### Critérios de Aceite

- [ ] `BackofficeService` não contém a string literal `"Backoffice not found"`
- [ ] `MessageSource` injetado via construtor (campo `final`)
- [ ] Chave `backoffice.not-found` presente em ambos os arquivos `.properties`
- [ ] `LocaleContextHolder.getLocale()` usado para resolução dinâmica de locale
- [ ] Imports corretos adicionados

---

### Artefatos de Saída

- `BackofficeService.java` com `MessageSource` e chaves i18n
- (Verificação) `messages_pt_BR.properties` e `messages_en.properties` com chave presente
