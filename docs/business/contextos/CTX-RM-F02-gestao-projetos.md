---
tipo: contexto-funcionalidade
id-roadmap: RM-F02
nome: Gestão de Projetos por Tenant
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend da gestão de projetos para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F02: Gestão de Projetos por Tenant

## 1. Descrição no Roadmap

Gestão de projetos por tenant: cadastro, configuração de blueprint e vinculação a repositório GitHub.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F02 |
| ID Visão | F-02 |
| Marco | 2 — Plataforma Multi-Tenant |
| Prioridade | Must |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

CRUD completo de projetos com listagem, criação multi-step, edição, exclusão. Configuração de repositório, arquitetura (módulos + blueprints), documentação, AI providers e equipe.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Listagem de Projetos | `/projects` | `frontend/src/presentation/pages/ProjectsPage.tsx` | Lista de projetos do tenant |
| Detalhe do Projeto | `/projects/:id` | `frontend/src/presentation/pages/ProjectDetailPage.tsx` | Visão geral com overview e timeline de atividades |
| Formulário de Projeto | `/projects/new`, `/projects/:id/edit` | `frontend/src/presentation/pages/ProjectFormPage.tsx` | Criação e edição multi-step |

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| ProjectForm | `frontend/src/presentation/components/projects/ProjectForm.tsx` | Formulário multi-step |
| ProjectCard | `frontend/src/presentation/components/projects/ProjectCard.tsx` | Card de projeto na lista |
| ProjectOverview | `frontend/src/presentation/components/projects/ProjectOverview.tsx` | Visão geral do projeto |
| ActivityTimeline | `frontend/src/presentation/components/projects/ActivityTimeline.tsx` | Timeline de atividades |
| DeleteConfirmDialog | `frontend/src/presentation/components/projects/DeleteConfirmDialog.tsx` | Confirmação de exclusão |

## 5. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/project.ts`

| Entidade/Tipo | Campos Principais |
|---------------|-------------------|
| Project | id, name, slug, description, status, repository, documentation, aiProviders[], members[], architecture, updatedAt |
| ProjectStatus | pending, active, configuring, archived |
| ProjectMember | Membro com MemberRole atribuído |
| MemberRole | PO, Arquiteto, Dev, QA, etc. |
| RepositoryConfig | provider (GitHub/GitLab/Bitbucket/Azure DevOps), multiModule (subfolder/independent), serverUrl, accessToken |
| DocumentationConfig | Configuração de docs do projeto |
| AIProviderConfig | Configuração de provedores de IA |
| ArchitectureConfig | Módulos com blueprints associados |
| ArchitectureModule | Módulo com BlueprintInfo vinculado |
| BlueprintInfo | Referência ao blueprint arquitetural |

## 6. API Hooks (React Query)

**Arquivo:** `frontend/src/application/hooks/useProjects.ts`

| Hook | Operação |
|------|----------|
| useProjects() | Listagem de projetos |
| useProject() | Busca de projeto por ID |
| useCreateProject() | Criação de novo projeto |
| useUpdateProject() | Atualização de projeto |
| useDeleteProject() | Exclusão de projeto |

## 7. Endpoints de API (MSW Mocks)

**Arquivo:** `frontend/src/infrastructure/api/mocks/projects.handlers.ts`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects` | Listagem de projetos |
| GET | `/api/projects/:id` | Detalhes de um projeto |
| POST | `/api/projects` | Criação com configuração completa |
| PATCH | `/api/projects/:id` | Atualização |
| DELETE | `/api/projects/:id` | Exclusão |
| GET | `/api/blueprints` | Blueprints disponíveis para seleção |
| GET | `/api/tenant-members` | Membros do tenant para atribuição |
| GET | `/api/tenant-config` | Configurações do tenant |

## 8. Funcionalidades Implementadas no Protótipo

- CRUD completo de projetos
- Ciclo de vida: pending → configuring → active → archived
- Suporte a multi-módulo (subfolder ou independent)
- Configuração de repositório (GitHub, GitLab, Bitbucket, Azure DevOps)
- Gestão de provedores de IA por projeto
- Atribuição de membros da equipe com papéis
- Seleção de blueprint arquitetural por módulo
- Timeline de atividades do projeto
- Exclusão com diálogo de confirmação

## 9. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Projeto pertence a um tenant (isolamento)
- Status segue máquina de estados: pending → configuring → active → archived
- Cada módulo pode ter um blueprint diferente
- Repositório suporta 4 providers diferentes
- Membros são atribuídos do pool do tenant

### Pontos em Aberto para DOM-02

- Validação de conexão com repositório GitHub (token/permissões)
- Regras de arquivamento de projeto (quando permitido)
- Limite de projetos por tenant
- Regras de exclusão (soft delete vs. hard delete)
- Propagação de alterações no blueprint para projeto ativo
- Versionamento de configuração de projeto
