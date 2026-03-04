/* ──────────────────────────────────────────────────────────
 * Agent — Domain Models
 * Tipos puros sem dependência de framework
 * Cadastro de Agentes IA por Domínio (DOM-01 a DOM-05)
 * ────────────────────────────────────────────────────────── */

/** Identificadores dos domínios do pipeline */
export type DomainId = 'DOM-01' | 'DOM-02' | 'DOM-03' | 'DOM-04' | 'DOM-05'

/** Status operacional do agente */
export type AgentStatus = 'active' | 'inactive' | 'error' | 'maintenance'

/** Nível de autonomia do agente */
export type AutonomyLevel = 'full' | 'semi' | 'assisted' | 'none'

/** Tipo de trigger que dispara o agente/skill */
export type TriggerType = 'gate-approval' | 'label' | 'schedule' | 'manual' | 'event'

/** Provedor de LLM */
export type LlmProvider = 'anthropic' | 'openai' | 'google' | 'aws-bedrock' | 'azure-openai'

/** Tier do modelo LLM */
export type LlmTier = 'junior' | 'mid' | 'senior' | 'specialist'

/** Tipo de prompt */
export type PromptType = 'system' | 'task' | 'review' | 'escalation' | 'template'

/** Modelo LLM autorizado para uso pelo agente */
export interface AuthorizedLlm {
  id: string
  provider: LlmProvider
  modelId: string
  displayName: string
  tier: LlmTier
  maxTokens: number
  temperatureDefault: number
  temperatureRange: [number, number]
  costPer1kInput: number
  costPer1kOutput: number
  isDefault: boolean
  enabled: boolean
}

/** Prompt configurado para o agente */
export interface AgentPrompt {
  id: string
  type: PromptType
  name: string
  description: string
  content: string
  variables: string[]
  version: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Verificação executada por uma skill */
export interface SkillCheck {
  id: string
  code: string
  description: string
  type: 'deterministic' | 'llm-assisted'
  blocking: boolean
}

/** Skill de um agente */
export interface AgentSkill {
  id: string
  code: string
  name: string
  description: string
  triggerType: TriggerType
  triggerValue: string
  timeoutSeconds: number
  confidenceThreshold: number
  checks: SkillCheck[]
  requiredLlmTier: LlmTier | null
  enabled: boolean
  executionCount: number
  lastExecutedAt: string | null
  avgDurationSeconds: number | null
}

/** Configuração de execução do agente */
export interface AgentExecutionConfig {
  maxConcurrentIssues: number
  retryOnFailure: boolean
  maxRetries: number
  cooldownSeconds: number
  notifyOnError: boolean
  notifyOnEscalation: boolean
  autoEscalateAfterSeconds: number
}

/** Metadados do domínio */
export interface DomainInfo {
  id: DomainId
  name: string
  description: string
  position: number
  color: string
}

/** Agente IA completo */
export interface Agent {
  id: string
  domainId: DomainId
  name: string
  slug: string
  description: string
  version: string
  status: AgentStatus
  autonomyLevel: AutonomyLevel
  skills: AgentSkill[]
  authorizedLlms: AuthorizedLlm[]
  prompts: AgentPrompt[]
  executionConfig: AgentExecutionConfig
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  lastActiveAt: string | null
  totalExecutions: number
  successRate: number
}

/** Resumo do agente para listagem */
export interface AgentSummary {
  id: string
  domainId: DomainId
  name: string
  slug: string
  description: string
  version: string
  status: AgentStatus
  autonomyLevel: AutonomyLevel
  skillCount: number
  llmCount: number
  promptCount: number
  tags: string[]
  lastActiveAt: string | null
  totalExecutions: number
  successRate: number
}

/** Payload para criação de agente */
export interface CreateAgentPayload {
  domainId: DomainId
  name: string
  description: string
  autonomyLevel: AutonomyLevel
  tags: string[]
  executionConfig: AgentExecutionConfig
}

/** Payload para atualização de agente */
export interface UpdateAgentPayload {
  name?: string
  description?: string
  status?: AgentStatus
  autonomyLevel?: AutonomyLevel
  tags?: string[]
  executionConfig?: Partial<AgentExecutionConfig>
}

/** Payload para adicionar/atualizar skill */
export interface UpsertSkillPayload {
  code: string
  name: string
  description: string
  triggerType: TriggerType
  triggerValue: string
  timeoutSeconds: number
  confidenceThreshold: number
  checks: Omit<SkillCheck, 'id'>[]
  requiredLlmTier: LlmTier | null
  enabled: boolean
}

/** Payload para adicionar/atualizar LLM autorizado */
export interface UpsertLlmPayload {
  provider: LlmProvider
  modelId: string
  displayName: string
  tier: LlmTier
  maxTokens: number
  temperatureDefault: number
  temperatureRange: [number, number]
  costPer1kInput: number
  costPer1kOutput: number
  isDefault: boolean
  enabled: boolean
}

/** Payload para adicionar/atualizar prompt */
export interface UpsertPromptPayload {
  type: PromptType
  name: string
  description: string
  content: string
  variables: string[]
  isActive: boolean
}

/** Lista de domínios disponíveis */
export const DOMAINS: DomainInfo[] = [
  { id: 'DOM-01', name: 'Discovery', description: 'Classificação de impacto e triagem de demandas', position: 1, color: '#3b82f6' },
  { id: 'DOM-02', name: 'Requirements', description: 'Análise de requisitos, BAR, Use Cases e rastreabilidade', position: 2, color: '#8b5cf6' },
  { id: 'DOM-03', name: 'Architecture', description: 'ADR, esqueleto de código e decisões arquiteturais', position: 3, color: '#f59e0b' },
  { id: 'DOM-04', name: 'Development', description: 'Implementação, PR e testes automatizados', position: 4, color: '#10b981' },
  { id: 'DOM-05', name: 'Quality Assurance', description: 'QA negocial (DOM-05a) e QA técnico (DOM-05b)', position: 5, color: '#ef4444' },
]
