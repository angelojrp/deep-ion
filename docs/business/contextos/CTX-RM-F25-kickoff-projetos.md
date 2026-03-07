---
tipo: contexto-funcionalidade
id-roadmap: RM-F25
nome: Workflow de Kickoff de Projetos
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend do workflow de kickoff de projetos para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F25: Workflow de Kickoff de Projetos

## 1. Descrição no Roadmap

Workflow de kickoff de projetos assistido por IA — fluxo de 11 etapas (descrição inicial → geração de visão DOM-02 → revisão → check de arquitetura → geração de arquitetura DOM-03 → revisão → scaffold) com estado de máquina e acompanhamento visual.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F25 |
| ID Visão | — |
| Marco | 2d — Funcionalidades Prototipadas no Frontend |
| Prioridade | Should |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

Workflow visual multi-step com stepper, geração de documentos por agentes IA (DOM-02 e DOM-03), revisão humana por seção, e scaffold de projeto.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Lista de Kickoffs | `/kickoff` | `frontend/src/presentation/pages/ProjectKickoffPage.tsx` | Projetos pendentes e kickoffs em andamento |
| Detalhe do Kickoff | `/kickoff/:projectId` | `frontend/src/presentation/pages/ProjectKickoffDetailPage.tsx` | Workflow step-by-step |

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| KickoffStepper | `frontend/src/presentation/components/kickoff/KickoffStepper.tsx` | Stepper visual do workflow |
| DocumentViewer | `frontend/src/presentation/components/kickoff/DocumentViewer.tsx` | Visualização de documentos gerados |
| ArchitectureCheck | `frontend/src/presentation/components/kickoff/ArchitectureCheck.tsx` | Validação arquitetural |
| ScaffoldResults | `frontend/src/presentation/components/kickoff/ScaffoldResults.tsx` | Resultado do scaffold |
| AgentProcessing | `frontend/src/presentation/components/kickoff/AgentProcessing.tsx` | Indicador de processamento do agente |

## 5. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/project-kickoff.ts`

### Etapas do Workflow (KickoffStep)

| # | Step | Descrição |
|---|------|-----------|
| 1 | initial_description | Usuário descreve o projeto |
| 2 | vision_generation | DOM-02 gera documento de visão |
| 3 | vision_review | PO/BA revisam o documento |
| 4 | vision_approved | Visão aprovada |
| 5 | architecture_check | Verificação de pré-requisitos arquiteturais |
| 6 | architecture_task | Pendências arquiteturais a resolver |
| 7 | architecture_generation | DOM-03 gera documento de arquitetura |
| 8 | architecture_review | Arquiteto revisa o documento |
| 9 | architecture_approved | Arquitetura aprovada |
| 10 | scaffold_generation | Geração do scaffold do projeto |
| 11 | completed | Kickoff concluído |

### Entidades

| Entidade/Tipo | Descrição |
|---------------|-----------|
| DocumentStatus | pending, generating, draft, in_review, approved, rejected |
| VisionDocument | Documento de visão com seções editáveis |
| ArchitectureDocument | Documento de arquitetura com seções editáveis |
| VisionSection | Seção do documento de visão |
| ArchitectureSection | Seção do documento de arquitetura |
| AgentType | DOM-02 (visão), DOM-03 (arquitetura) |
| ReviewerRole | po, business-analyst, architect |

## 6. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/useProjectKickoff.ts`

| Hook | Operação |
|------|----------|
| useKickoffs() | Listagem de kickoffs |
| useStartKickoff() | Iniciar kickoff para projeto |
| useKickoff() | Detalhes do kickoff |
| useGenerateVision() | Acionar DOM-02 para gerar visão |
| useReviewVision() | Submeter revisão da visão |
| useUpdateVisionSection() | Editar seção da visão |
| useCheckArchitecture() | Verificar pré-requisitos |
| useCompleteArchitectureTask() | Resolver pendência arquitetural |
| useGenerateArchitecture() | Acionar DOM-03 para gerar arquitetura |
| useReviewArchitecture() | Submeter revisão da arquitetura |
| useUpdateArchitectureSection() | Editar seção da arquitetura |
| useGenerateScaffold() | Gerar scaffold do projeto |

**MSW:** `frontend/src/infrastructure/api/mocks/project-kickoff.handlers.ts`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects/pending` | Projetos pendentes de kickoff |
| GET | `/api/kickoffs` | Listagem de kickoffs |
| POST | `/api/kickoffs/start` | Iniciar kickoff |
| GET | `/api/kickoffs/:projectId` | Detalhes |
| POST | `/api/kickoffs/:projectId/vision/generate` | Gerar visão (DOM-02) |
| POST | `/api/kickoffs/:projectId/vision/review` | Revisar visão |
| PATCH | `/api/kickoffs/:projectId/vision/sections/:sectionId` | Editar seção da visão |
| POST | `/api/kickoffs/:projectId/architecture/check` | Check arquitetural |
| POST | `/api/kickoffs/:projectId/architecture/task` | Resolver tarefa |
| POST | `/api/kickoffs/:projectId/architecture/generate` | Gerar arquitetura (DOM-03) |

## 7. Funcionalidades Implementadas no Protótipo

- Stepper visual com 11 etapas e indicação de progresso
- Descrição livre do projeto pelo usuário (etapa 1)
- Geração de documento de visão pelo agente DOM-02 (etapa 2)
- Revisão do documento de visão por PO/BA com edição por seção (etapa 3)
- Verificação de pré-requisitos arquiteturais (etapa 5)
- Geração de documento de arquitetura pelo agente DOM-03 (etapa 7)
- Revisão de arquitetura com edição por seção (etapa 8)
- Geração de scaffold do projeto (etapa 10)
- Indicador visual de processamento do agente
- Gestão de estado por passo (máquina de estados)
- Versionamento de documentos gerados

## 8. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Workflow é sequencial (não pula etapas)
- DOM-02 gera visão, DOM-03 gera arquitetura
- Documentos passam por revisão humana obrigatória
- Seções são editáveis individualmente
- Revisão pode aprovar ou rejeitar (volta para regeneração)
- Agentes: DOM-02 (Requirements), DOM-03 (Architecture)
- Revisores: PO e BA para visão; Arquiteto para arquitetura

### Pontos em Aberto para DOM-02

- Formato dos documentos de visão e arquitetura (estrutura de seções)
- Número máximo de ciclos de revisão/regeneração
- Critérios de aprovação automática vs. manual
- Integração real com MCP Servers (DOM-02, DOM-03)
- Dependências entre kickoff e outros módulos (pipeline, blueprint)
- Persistência do estado do workflow (recovery em caso de falha)
