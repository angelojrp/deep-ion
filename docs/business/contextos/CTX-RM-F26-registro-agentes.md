---
tipo: contexto-funcionalidade
id-roadmap: RM-F26
nome: Registro e Configuração de Agentes de IA
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend de registro e configuração de agentes para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F26: Registro e Configuração de Agentes de IA

## 1. Descrição no Roadmap

Registro e configuração de agentes de IA — CRUD de agentes com atribuição a domínios (DOM-01 a DOM-05), gestão de skills/triggers, configuração de LLMs autorizados por tier, editor de prompts (system/task/review/escalation) e parâmetros de execução.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F26 |
| ID Visão | — |
| Marco | 2d — Funcionalidades Prototipadas no Frontend |
| Prioridade | Must |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

CRUD de agentes com interface por abas (overview, skills, LLMs, prompts, configuração), filtro por domínio, gestão de skills com triggers, configuração de modelos LLM autorizados por tier e editor de prompts.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Lista de Agentes | `/agents` | `frontend/src/presentation/pages/AgentsPage.tsx` | Agentes filtrados por domínio |
| Detalhe do Agente | `/agents/:id` | `frontend/src/presentation/pages/AgentDetailPage.tsx` | Detalhes com abas |

## 4. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/agent.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| Agent | Agente completo com skills, LLMs, prompts, config |
| AgentSummary | Versão resumida para listagem |
| DomainId | DOM-01 (Discovery), DOM-02 (Requirements), DOM-03 (Architecture), DOM-04 (Frontend/Development), DOM-05 (QA) |
| AgentStatus | active, inactive, error, maintenance |
| AutonomyLevel | full, semi, assisted, none |
| AgentSkill | Skill com SkillCheck e TriggerType |
| AuthorizedLlm | Modelo autorizado com tier, token limits, temperatura, pricing |
| AgentPrompt | Tipo: system, task, review, escalation, template; conteúdo com variáveis |
| TriggerType | gate-approval, label, schedule, manual, event |
| LlmProvider | Provedor de LLM |
| LlmTier | Tier de modelo |
| AgentExecutionConfig | Concurrency, retries, escalation rules |

### Domínios de Agentes

| Domínio | Nome | Responsabilidade |
|---------|------|------------------|
| DOM-01 | Discovery | Descoberta e classificação T0-T3 |
| DOM-02 | Requirements | Requisitos: BAR, Use Cases, Traceability Matrix |
| DOM-03 | Architecture | Arquitetura: ADR + esqueleto de código |
| DOM-04 | Development | Implementação + testes |
| DOM-05 | QA | Qualidade: cobertura, conformidade, auditoria |

### Níveis de Autonomia

| Nível | Descrição |
|-------|-----------|
| full | Agente executa sem intervenção |
| semi | Agente executa mas requer confirmação em pontos-chave |
| assisted | Agente sugere, humano decide |
| none | Agente desabilitado |

## 5. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/useAgents.ts`

| Hook | Operação |
|------|----------|
| useAgents() | Listagem filtrada por domínio |
| useAgent() | Detalhes do agente |
| useCreateAgent() | Criação de agente |
| useUpdateAgent() | Atualização de agente |

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/agents` | Listagem por domínio |
| GET | `/api/agents/:id` | Detalhes |
| POST | `/api/agents` | Criação |
| PATCH | `/api/agents/:id` | Atualização |
| DELETE | `/api/agents/:id` | Remoção |

## 6. Funcionalidades Implementadas no Protótipo

- Listagem de agentes filtrada por domínio (DOM-01 a DOM-05)
- Badges de status (active, inactive, error, maintenance)
- Visualização de nível de autonomia (full/semi/assisted/none)
- Estatísticas de execução (totalExecutions, successRate, lastActiveAt)
- **Aba Skills:** gestão de skills com lista, trigger types (gate-approval, label, schedule, manual, event)
- **Aba LLMs:** autorização de modelos por tier, limites de tokens, range de temperatura, pricing
- **Aba Prompts:** editor de prompts (system, task, review, escalation, template) com variáveis
- **Aba Config:** parâmetros de execução (concurrency, retries, escalation rules)
- Organização por tags
- Interface com abas: overview | skills | llms | prompts | config

## 7. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- Cada agente pertence a exatamente um domínio (DOM-01 a DOM-05)
- 4 estados: active, inactive, error, maintenance
- 4 níveis de autonomia: full, semi, assisted, none
- Skills têm triggers configuráveis
- LLMs são autorizados por tier
- Prompts são tipados: system, task, review, escalation, template
- Prompts suportam variáveis (template)
- Configuração de execução: concurrency, retries, escalation

### Pontos em Aberto para DOM-02

- Relação agente → pipeline (como agente é invocado pelo pipeline)
- Regras de ativação/desativação de agente em pipeline ativo
- Tratamento do estado "error" e "maintenance"
- Rate limiting e quotas por agente
- Logs de execução e auditoria
- Versionamento de prompts
- Regras de rollback de configuração
- Integração com MCP Servers (como agente se conecta)
