---
tipo: contexto-funcionalidade
id-roadmap: RM-F03
nome: Gestão de Squads e Usuários
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend da gestão de usuários e squads para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F03: Gestão de Squads e Usuários

## 1. Descrição no Roadmap

Gestão de squads por projeto: adição de membros e atribuição de papéis (PO, Arquiteto, Dev, QA, Gate Keeper, Analista de Negócios, Analista de Requisitos, Analista de UX).

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F03 |
| ID Visão | F-03 |
| Marco | 2 — Plataforma Multi-Tenant |
| Prioridade | Must |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

Gestão de usuários com CRUD, perfil profissional completo, atribuição de múltiplos papéis e sistema de convites.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Listagem de Usuários | `/users` | `frontend/src/presentation/pages/UsersPage.tsx` | Lista com status de convite e gestão |
| Perfil do Usuário | `/profile` | `frontend/src/presentation/pages/UserProfilePage.tsx` | Perfil profissional completo editável |

## 4. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/user.ts`

| Entidade/Tipo | Campos Principais |
|---------------|-------------------|
| User | ID, nome, email, papéis, status de convite |
| UserProfile | Perfil profissional completo |
| UserRole | admin, po, architect, tech-lead, developer, qa, devops, business-analyst, requirements-analyst, ux-analyst |
| Phone | Número com tipo (mobile/work/home) |
| Certification | Certificações profissionais |
| ProfessionalExperience | Experiência profissional |
| Education | Formação acadêmica |
| SocialLink | Links sociais (LinkedIn, GitHub, portfolio) |
| Language | Idioma com nível de proficiência |
| InviteStatus | Status do convite ao usuário |

## 5. API Hooks (React Query)

**Arquivo:** `frontend/src/application/hooks/useUsers.ts`

| Hook | Operação |
|------|----------|
| useUsers() | Listagem paginada de usuários |
| useAvailableRoles() | Papéis disponíveis para atribuição |
| useCreateUser() | Criação de usuário + envio de convite |
| useResendInvite() | Reenvio de convite |
| useDeleteUser() | Remoção de usuário |
| useProfile() | Perfil do usuário logado |
| useUpdateProfile() | Atualização de perfil |
| useUploadPhoto() | Upload de foto de perfil |

## 6. Endpoints de API (MSW Mocks)

**Arquivo:** `frontend/src/infrastructure/api/mocks/users.handlers.ts`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listagem paginada |
| GET | `/api/users/:id` | Detalhes de usuário |
| GET | `/api/roles` | Papéis disponíveis |
| POST | `/api/users` | Criação + envio de convite |
| PATCH | `/api/users/:id` | Atualização |
| DELETE | `/api/users/:id` | Remoção |
| GET | `/api/profile` | Perfil do usuário logado |
| PATCH | `/api/profile` | Atualização de perfil |
| POST | `/api/profile/photo` | Upload de foto |
| POST | `/api/users/:id/resend-invite` | Reenvio de convite |

## 7. Funcionalidades Implementadas no Protótipo

- Lista de usuários com rastreamento de status de convite
- Criação de usuários com atribuição de papéis
- Perfil profissional detalhado com seções colapsáveis:
  - Dados pessoais e contato
  - Bio, localização e timezone
  - Idiomas com nível de proficiência
  - Skills e certificações
  - Experiência profissional
  - Formação acadêmica
  - Links sociais (LinkedIn, GitHub, portfolio)
- Disponibilidade em horas/semana
- Upload de foto com preview em modal
- Sistema de convites (enviar e reenviar)
- 10 papéis disponíveis para atribuição múltipla

## 8. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Usuário pode ter múltiplos papéis
- Convite é obrigatório para adicionar membro (email)
- Perfil profissional é rico (experiência, certificações, idiomas)
- 10 papéis: admin, po, architect, tech-lead, developer, qa, devops, business-analyst, requirements-analyst, ux-analyst

### Pontos em Aberto para DOM-02

- Integração com Keycloak para autenticação (SSO)
- Regras de expiração de convites
- Permissões por papel (RBAC)
- Regras para remoção de membro ativo em projetos
- Limite de membros por squad/projeto
- Workflow de aprovação para atribuição de papéis críticos (admin, gate-keeper)
