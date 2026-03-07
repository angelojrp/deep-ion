---
tipo: contexto-funcionalidade
id-roadmap: RM-F01
nome: Gestão de Tenants
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend da gestão de tenants para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F01: Gestão de Tenants

## 1. Descrição no Roadmap

Gestão de tenants: cadastro, autenticação SSO via Keycloak e isolamento de dados.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F01 |
| ID Visão | F-01 |
| Marco | 2 — Plataforma Multi-Tenant |
| Prioridade | Must |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

CRUD completo de tenants com listagem paginada, busca, filtros por status, criação, edição e desativação/reativação.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Listagem de Tenants | `/tenants` | `frontend/src/presentation/pages/TenantsPage.tsx` | Lista paginada com busca e filtro por status (ATIVO/INATIVO) |
| Criação de Tenant | `/tenants/new` | `frontend/src/presentation/pages/TenantCreatePage.tsx` | Formulário de criação com configuração de admin |
| Detalhe/Edição | `/tenants/:id` | `frontend/src/presentation/pages/TenantDetailPage.tsx` | Visualização e edição de dados do tenant |

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| TenantListTable | `frontend/src/presentation/components/tenants/TenantListTable.tsx` | Tabela de listagem |
| TenantListCards | `frontend/src/presentation/components/tenants/TenantListCards.tsx` | Visualização em cards |
| TenantPagination | `frontend/src/presentation/components/tenants/TenantPagination.tsx` | Controle de paginação |
| TenantDeactivateDialog | `frontend/src/presentation/components/tenants/TenantDeactivateDialog.tsx` | Confirmação de desativação |

## 5. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/tenant.ts`

| Entidade/Tipo | Campos Principais |
|---------------|-------------------|
| Tenant | tenant_id (ULID), nome, slug, status, criado_em, email_admin, primeiro_nome_admin, sobrenome_admin, telefones_admin[], membros_ativos |
| TenantSummary | Versão resumida para listagem |
| CreateTenantPayload | nome, slug, email_admin, primeiro_nome_admin, sobrenome_admin |
| UpdateTenantPayload | Campos editáveis do tenant |
| TenantListResponse | items[], total, page, pageSize |
| SquadRole | PO, Arquiteto, Dev, QA, Gate Keeper |

**Validadores:** `frontend/src/domain/validators/tenant.ts` — isValidNome(), isValidSlug(), isValidEmail(), isValidNameField()

## 6. API Hooks (React Query)

**Arquivo:** `frontend/src/application/hooks/useTenants.ts`

| Hook | Operação |
|------|----------|
| useTenants() | Listagem paginada com filtros |
| useCreateTenant() | Criação de novo tenant |
| useUpdateTenant() | Atualização de tenant existente |
| useTenant() | Busca de tenant por ID |
| useCheckSlug() | Verificação de disponibilidade de slug |
| useDeactivateTenant() | Desativação de tenant |
| useReactivateTenant() | Reativação de tenant |

## 7. Endpoints de API (MSW Mocks)

**Arquivo:** `frontend/src/infrastructure/api/mocks/tenants.handlers.ts`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tenants` | Listagem paginada com busca e filtro por status |
| GET | `/api/tenants/:id` | Detalhes de um tenant |
| POST | `/api/tenants` | Criação de novo tenant |
| PATCH | `/api/tenants/:id` | Atualização de tenant |
| PATCH | `/api/tenants/:id/deactivate` | Desativação |
| PATCH | `/api/tenants/:id/reactivate` | Reativação |
| GET | `/api/tenants/slug/:slug` | Verificação de disponibilidade de slug |

## 8. Funcionalidades Implementadas no Protótipo

- Listagem paginada com busca textual e filtro por status (ATIVO/INATIVO)
- Criação de tenant com configuração de administrador inicial
- Visualização e edição de detalhes do tenant
- Desativação e reativação de tenants com diálogo de confirmação
- Auto-geração de slug a partir do nome
- Filtragem por status
- Alternância entre visualização em tabela e cards

## 9. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Slug deve ser único por tenant
- Tenant precisa de um administrador na criação (email, nome, sobrenome obrigatórios)
- Estados possíveis: ATIVO, INATIVO
- Identificador usa ULID (não UUID)
- Paginação server-side

### Pontos em Aberto para DOM-02

- Definição formal do fluxo de autenticação SSO via Keycloak
- Regras de isolamento de dados entre tenants
- Política de retenção de dados em tenants desativados
- Limites de membros por tenant
- Regras de transferência de propriedade do tenant
