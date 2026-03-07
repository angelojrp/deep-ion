---
tipo: contexto-funcionalidade
id-roadmap: RM-F04
nome: Frontend de Controle da Plataforma
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend do painel de controle geral da plataforma para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F04: Frontend de Controle da Plataforma

## 1. Descrição no Roadmap

Frontend de controle da plataforma — painel de gerenciamento de tenants, projetos, agentes, pipelines, blueprints, usuários e dashboards especializados.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F04 |
| ID Visão | F-04 |
| Marco | 2 — Plataforma Multi-Tenant |
| Prioridade | Must |
| Status | Protótipo completo (21 páginas, 12 módulos, 40+ componentes de dashboard, MSW mocks, i18n) |

## 2. Escopo do Protótipo Frontend

Plataforma de controle completa cobrindo todos os módulos funcionais do sistema. A UI é uma SPA React com layout de shell (sidebar + topbar + conteúdo).

## 3. Inventário do Protótipo

| Métrica | Valor |
|---------|-------|
| Total de páginas | 21 |
| Módulos funcionais | 12 |
| Componentes de dashboard | 40+ |
| Domain models | 12 |
| API hooks | 12 |
| MSW handler files | 13 |
| API adapters | 12 |

## 4. Módulos da Plataforma

| Módulo | ID Roadmap | Páginas | Descrição |
|--------|------------|---------|-----------|
| Tenants | RM-F01 | 3 | CRUD de tenants |
| Projetos | RM-F02 | 3 | CRUD de projetos |
| Usuários | RM-F03 | 2 | Gestão de usuários e perfis |
| Dashboard PO | RM-F05 | 1 | Painel operacional do PO |
| Dashboard BA | RM-F23 | 1 | Dashboard Analista de Negócios |
| Dashboard RA | RM-F23 | 1 | Dashboard Analista de Requisitos |
| Dashboard UX | RM-F23 | 1 | Dashboard Analista de UX |
| Pipelines | RM-F06/F13 | 1 | Configuração de pipeline e tiers |
| Blueprints | RM-F16 | 1 | CRUD de blueprints arquiteturais |
| Chatbot IA | RM-F24 | 1 | Interface de chat com IA |
| Kickoff | RM-F25 | 2 | Workflow de kickoff de projetos |
| Agentes | RM-F26 | 2 | Registro e configuração de agentes |

## 5. Estrutura de Navegação

```
/ (Dashboard PO)
├── /tenants (Gestão de Tenants)
│   ├── /tenants/new
│   └── /tenants/:id
├── /projects (Gestão de Projetos)
│   ├── /projects/new
│   ├── /projects/:id
│   └── /projects/:id/edit
├── /users (Gestão de Usuários)
├── /agents (Agentes de IA)
│   └── /agents/:id
├── /pipelines (Pipelines)
├── /blueprints (Blueprints Arquiteturais)
├── /kickoff (Kickoff de Projetos)
│   └── /kickoff/:projectId
├── /chatbot (Chatbot IA)
├── /dashboard/ba (Dashboard BA)
├── /dashboard/ra (Dashboard RA)
├── /dashboard/ux (Dashboard UX)
├── /profile (Perfil do Usuário)
└── /settings (Configurações)
```

## 6. Stack Técnica do Protótipo

| Tecnologia | Uso |
|------------|-----|
| React 18 | Framework UI |
| TypeScript strict | Tipagem |
| Vite | Build tool |
| React Router | Roteamento SPA |
| React Query (TanStack) | Data fetching e cache |
| Zustand | Estado global (chat) |
| shadcn/ui | Componentes UI |
| Tailwind CSS v4 | Estilização |
| MSW (Mock Service Worker) | Mocks de API |
| Vitest | Testes |
| Lucide React | Ícones |

## 7. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Layout shell com sidebar colapsável e topbar
- Navegação organizada por módulo funcional
- Todos os dados via API REST com mocks MSW
- Dashboards especializados por papel (PO, BA, RA, UX)

### Pontos em Aberto para DOM-02

- Controle de acesso por papel (RBAC) — quais páginas cada papel acessa
- Internacionalização (i18n) — idiomas suportados
- Tema e personalização visual por tenant
- Notificações em tempo real (WebSocket vs. polling)
- Responsividade mobile (padrão atual é desktop-first)
