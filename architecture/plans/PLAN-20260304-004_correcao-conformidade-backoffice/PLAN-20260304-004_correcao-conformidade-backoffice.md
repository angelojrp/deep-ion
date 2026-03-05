---
plan_id: PLAN-20260304-004
title: "Correção de Conformidade: backoffice (F01–F05)"
classification: T0
created_at: "2026-03-04T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: CONCLUIDO
closed_at: "2026-03-04T13:00:00Z"
closed_by: "Copilot"
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-04T12:30:00Z"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

> **Este é o índice do plano.** Cada tarefa tem seu próprio arquivo para execução independente.
> Ao executar uma tarefa, o agente deve ler APENAS o arquivo da tarefa + este índice (seções Riscos e Gates).

## Plano de Execução — Correção de Conformidade: backoffice (F01–F05)

**Classificação de Impacto:** T0  
**Score:** 1.4  
**Blueprint de referência:** `architecture/blueprints/modulith-api-first.yaml` v1.0  
**Módulo alvo:** `backoffice-core`  
**Origem:** Achados de auditoria T13 — [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice/PLAN-20260304-002_scaffold-backoffice.md)  
**Data:** 2026-03-04

---

### Contexto

A tarefa T13 do plano PLAN-20260304-002 identificou 5 achados de não-conformidade no scaffold do módulo `backoffice` (1 CRÍTICO, 1 MÉDIO, 2 BAIXO, 1 INFORMATIVO). Este plano endereça todos os achados em tasks independentes, seguidas de re-auditoria completa pelo DOM-05b para confirmação de aderência ao blueprint `modulith-api-first v1.0`.

---

### Score de Classificação

| Dimensão               | Nota | Peso  | Contribuição |
|------------------------|------|-------|--------------|
| Complexidade técnica   | 1.5  | 25%   | 0.375        |
| Impacto negocial       | 2.0  | 30%   | 0.600        |
| Reversibilidade        | 1.0  | 20%   | 0.200        |
| Exposição regulatória  | 1.0  | 15%   | 0.150        |
| Superfície de contrato | 1.0  | 10%   | 0.100        |
| **Score final**        |      |       | **1.425 → T0** |

**5 Análises de Zona Cinzenta:**
- Consumer Analysis: campos não referenciados em outros módulos → negativo
- Business Rule Fingerprint: nenhuma RN afetada → negativo
- Data Persistence Check: sem alteração de schema → negativo
- Contract Surface Check: sem mudanças na API pública → negativo
- Regulatory Scope Check: sem dados pessoais → negativo

---

### Achados de Origem (T13)

| ID  | Severidade    | Descrição resumida                                    |
|-----|---------------|-------------------------------------------------------|
| F01 | CRÍTICO       | `extractAuthorities()` retorna lista vazia sempre     |
| F02 | MÉDIO         | Mensagens de exceção hardcoded em `BackofficeService` |
| F03 | BAIXO         | `OpenApiConfig.java` ausente                          |
| F04 | BAIXO         | `permitAll()` em `/actuator/health` sem documentação  |
| F05 | INFORMATIVO   | `@MockBean` deprecated — usar `@MockitoBean`          |

---

### Tarefas

| #   | Arquivo da tarefa | Agente     | Depende de              | Paralelo com          | Modelo            |
|-----|-------------------|------------|-------------------------|-----------------------|-------------------|
| T01 | [T01_corrigir-extract-authorities-f01.md](tasks/PLAN-20260304-004_T01_corrigir-extract-authorities-f01.md) | DOM-03/Dev | —          | T02, T03, T04, T05    | `GPT-5.1-Codex`   |
| T02 | [T02_corrigir-mensagens-hardcoded-f02.md](tasks/PLAN-20260304-004_T02_corrigir-mensagens-hardcoded-f02.md) | DOM-03/Dev | —          | T01, T03, T04, T05    | `GPT-5.1-Codex`   |
| T03 | [T03_criar-openapi-config-f03.md](tasks/PLAN-20260304-004_T03_criar-openapi-config-f03.md)                 | DOM-03/Dev | —          | T01, T02, T04, T05    | `GPT-4o`          |
| T04 | [T04_documentar-desvio-actuator-health-f04.md](tasks/PLAN-20260304-004_T04_documentar-desvio-actuator-health-f04.md) | DOM-03/Dev | —   | T01, T02, T03, T05    | `GPT-4o`          |
| T05 | [T05_substituir-mockbean-mockitobean-f05.md](tasks/PLAN-20260304-004_T05_substituir-mockbean-mockitobean-f05.md)     | DOM-03/Dev | —          | T01, T02, T03, T04    | `GPT-4o`          |
| T06 | [T06_re-auditoria-conformidade.md](tasks/PLAN-20260304-004_T06_re-auditoria-conformidade.md)               | DOM-05b    | T01, T02, T03, T04, T05 | —                     | `Claude Opus 4.6` |

---

### Riscos e Condições de Bloqueio

- **ALTO — Regressão em SecurityConfig (T01):** a correção do `extractAuthorities()` pode inadvertidamente bloquear todos os requests se o prefixo `ROLE_` for duplicado. Mitigação: usar `@WebMvcTest` com token mockado antes de merge.
- **MÉDIO — Compatibilidade MessageSource (T02):** injeção de `MessageSource` sem configurar `LocaleContextHolder` pode retornar mensagem de fallback. Mitigação: testar com `Locale.forLanguageTag("pt-BR")` no teste de serviço.
- **BAIXO — Dependência springdoc (T03):** `OpenApiConfig` usa `@SecurityScheme` do springdoc — verificar se dependência está declarada no `backoffice-core/pom.xml`.

---

### Gates Necessários

- **Gate 1:** Angelo Pereira — revisão do fix F01 (`SecurityConfig.extractAuthorities()`) antes de qualquer merge. Critério: roles extraídas corretamente de `realm_access.roles` sem duplicação de prefixo `ROLE_`.

---

### Artefatos Esperados

| Agente     | Artefato                                                                |
|------------|-------------------------------------------------------------------------|
| DOM-03/Dev | `SecurityConfig.java` — método `extractAuthorities()` corrigido (F01)  |
| DOM-03/Dev | `BackofficeService.java` — `MessageSource` + chave i18n (F02)          |
| DOM-03/Dev | `OpenApiConfig.java` — novo arquivo com `@SecurityScheme` global (F03) |
| DOM-03/Dev | `SecurityConfig.java` — comentário de desvio aceito em `/actuator/health` (F04) |
| DOM-03/Dev | `BackofficeControllerTest.java` — `@MockitoBean` substituindo `@MockBean` (F05) |
| DOM-05b    | Relatório de re-auditoria inline em T06 (todos os critérios F01–F05 resolvidos) |
