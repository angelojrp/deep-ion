---
tipo: contexto-funcionalidade
id-roadmap: RM-F16
nome: Blueprints Arquiteturais Declarativos
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend de blueprints arquiteturais para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F16: Blueprints Arquiteturais Declarativos

## 1. Descrição no Roadmap

Blueprints arquiteturais declarativos (YAML) — biblioteca reutilizável e associação por projeto.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F16 |
| ID Visão | F-16 |
| Marco | 1 — Core Pipeline |
| Prioridade | Must |
| Status | Protótipo frontend (CRUD, editor YAML, versionamento, clonagem e chat assistido por IA) |

## 2. Escopo do Protótipo Frontend

CRUD de blueprints com categorização, editor YAML com syntax highlighting, versionamento, clonagem e assistente IA para criação guiada.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Blueprints | `/blueprints` | `frontend/src/presentation/pages/BlueprintsPage.tsx` | Gestão completa de blueprints |

## 4. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/blueprint.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| Blueprint | id, name, description, category, content (YAML), versions[], linkedProjects[], history[] |
| BlueprintCategory | backend, frontend, batch, fullstack |
| BlueprintCreationMode | manual, assisted (por IA) |
| BlueprintVersion | Versão do blueprint com status |
| BlueprintVersionStatus | active, in-use, superseded |
| BlueprintLinkedProject | Projeto que usa esta versão do blueprint |
| BlueprintHistoryEntry | Entrada de histórico (date, author, action, detail) |

## 5. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/useBlueprintsManagement.ts`

| Hook | Operação |
|------|----------|
| useBlueprintsManagement() | Listagem de blueprints |
| useCreateBlueprint() | Criação (manual ou assistida) |
| useUpdateBlueprint() | Atualização |
| useCloneBlueprint() | Clonagem de blueprint existente |

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/blueprints` | Listagem por categoria |
| POST | `/api/blueprints` | Criação |
| GET | `/api/blueprints/:id` | Detalhes |
| PATCH | `/api/blueprints/:id` | Atualização |
| POST | `/api/blueprints/:id/clone` | Clonagem |

## 6. Funcionalidades Implementadas no Protótipo

- Listagem de blueprints filtrada por categoria (backend, frontend, batch, fullstack)
- Criação manual com editor YAML e syntax highlighting
- Criação assistida por IA (modo conversacional)
- Preview do YAML com syntax highlighting
- Clonagem de blueprints existentes
- Versionamento com status (active, in-use, superseded)
- Rastreamento de projetos vinculados por versão
- Edição e publicação de novas versões
- Histórico de alterações (data, autor, ação, detalhe)
- Chat com assistente IA para orientação na criação

## 7. Referência: Blueprints Existentes no Projeto

Blueprints YAML reais em `architecture/blueprints/`:
- `modulith-api-first.yaml` — Spring Modulith com API-first
- `frontend-react-spa.yaml` — React SPA
- `python-agent-first.yaml` — Python Agent

## 8. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Blueprint é um documento YAML declarativo
- 4 categorias: backend, frontend, batch, fullstack
- Versionamento obrigatório (não edita versão em uso)
- Blueprint pode ser clonado para criar variações
- Projetos se vinculam a versão específica do blueprint
- Modo assistido usa IA conversacional para gerar YAML

### Pontos em Aberto para DOM-02

- Schema de validação do YAML de blueprint
- Regras de compatibilidade entre versões
- Impacto de atualizar blueprint em projetos que usam versão anterior
- Permissões (quem pode criar/editar/clonar blueprints)
- Regras de deprecação de blueprint
- Integração blueprint → DOM-03 (como o agente de arquitetura consome)
