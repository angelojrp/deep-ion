---
plan_id: PLAN-20260304-002
task_id: T03
title: "Gerar backoffice.yaml com especificação OpenAPI 3.1"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
depends_on: [T01, T02]
parallel_with: []
---

## Tarefa T03 — `backoffice.yaml`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-03/Dev
**Modelo sugerido:** `GPT-5.1-Codex` — Contrato de interface; define API surface
**Depende de:** T01, T02
**Paralelo com:** —

---

### Objetivo

Definir o contrato OpenAPI 3.1 do módulo `backoffice`, com esquemas, segurança OAuth2 e operações CRUD mínimas para permitir geração de interfaces.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; arquivo único `src/main/resources/openapi/backoffice.yaml`; geração com `interfaceOnly=true`, `useSpringBoot3=true`, `generateApiTests=false`.

---

### Especificação Técnica

- **Arquivo único do contrato:** `backoffice/backoffice-contracts/src/main/resources/openapi/backoffice.yaml`
- **Versão OpenAPI:** `3.1.0`
- **Base path versionado:** `/api/v1/backoffice`
- **Segurança:** `oauth2` com `authorizationCode` + PKCE (S256), com escopos:
	- `backoffice:read`
	- `backoffice:write`
- **Operações CRUD mínimas (todas com `security` explícito):**
	- `GET /api/v1/backoffice` (listagem paginada com `page`, `size`, `sort`)
	- `POST /api/v1/backoffice`
	- `GET /api/v1/backoffice/{id}`
	- `PUT /api/v1/backoffice/{id}`
	- `DELETE /api/v1/backoffice/{id}`
- **Schemas principais (`components.schemas`):**
	- `BackofficeRequest`
	- `BackofficeResponse`
	- `BackofficePageResponse`
	- `ProblemDetails` (RFC 9457)
- **Responses de erro reutilizáveis (`components.responses`):** `400`, `401`, `403`, `404`, `409`, `500` com `application/problem+json`.
- **Ajuste de geração no módulo contracts (`backoffice-contracts/pom.xml`):**
	- `inputSpec=src/main/resources/openapi/backoffice.yaml`
	- `generatorName=spring`
	- `interfaceOnly=true`
	- `useSpringBoot3=true`
	- `generateApiTests=false`
	- `generateSupportingFiles=false`

---

### Riscos Específicos

`backoffice.yaml` sem operações pode gerar interface vazia e impedir compilação (MÉDIO).

---

### Artefatos de Saída

- `backoffice/backoffice-contracts/src/main/resources/openapi/backoffice.yaml`
- `backoffice/backoffice-contracts/pom.xml` atualizado para consumir o contrato em `openapi/backoffice.yaml` com opções de geração API-First compatíveis com Spring Boot 3.

---

### Critérios de Aceite

- Existe um único contrato OpenAPI do módulo em `src/main/resources/openapi/backoffice.yaml`.
- O contrato está em OpenAPI `3.1.0` e contém operações CRUD mínimas não vazias.
- Todas as operações declaram `security` explicitamente usando `oauth2`.
- O contrato inclui `BackofficeRequest` e `BackofficeResponse` em `components.schemas`.
- A listagem (`GET /api/v1/backoffice`) é paginada e possui parâmetros `page`, `size` e `sort`.
- Erros são padronizados com `application/problem+json` e schema `ProblemDetails`.
- `backoffice-contracts/pom.xml` aponta para `openapi/backoffice.yaml` e mantém geração com:
	- `interfaceOnly=true`
	- `useSpringBoot3=true`
	- `generateApiTests=false`
	- `generateSupportingFiles=false`
