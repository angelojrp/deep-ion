/* ──────────────────────────────────────────────────────────
 * Pipeline — Domain Models
 * Configuração e manutenção de pipelines (global ou por projeto)
 * Tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

import type { DomainId, LlmProvider } from './agent'

/** Classificação de complexidade da demanda */
export type TierClassification = 'T0' | 'T1' | 'T2' | 'T3'

/** Escopo do pipeline — global (padrão para todos) ou vinculado a um projeto */
export type PipelineScope = 'global' | 'project'

/** Modo de execução do agente no pipeline */
export type ExecutionMode = 'realtime' | 'batch'

/** Status do pipeline */
export type PipelineStatus = 'active' | 'draft' | 'archived'

/* ─── Critérios de Tier ─── */

/** Critério individual para classificação de tier */
export interface TierCriterion {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string
  description: string
}

/** Configuração completa de um tier */
export interface TierConfig {
  tier: TierClassification
  name: string
  description: string
  color: string
  criteria: TierCriterion[]
  maxLeadTimeDays: number
  slaHours: number
  autoApproveGates: boolean
}

/* ─── Modelo LLM para o Pipeline ─── */

/** Modelo LLM atribuído a um tier/domínio no pipeline */
export interface PipelineLlmConfig {
  id: string
  provider: LlmProvider
  modelId: string
  displayName: string
  costPer1kInput: number
  costPer1kOutput: number
}

/* ─── Atribuição de Agente no Pipeline ─── */

/** Configuração de agente atribuído a um domínio+tier no pipeline */
export interface PipelineAgentAssignment {
  id: string
  domainId: DomainId
  tier: TierClassification
  agentId: string
  agentName: string
  agentSlug: string
  llmConfig: PipelineLlmConfig
  executionMode: ExecutionMode
  enabled: boolean
}

/* ─── Pipeline completo ─── */

/** Entidade principal: configuração de pipeline */
export interface PipelineConfig {
  id: string
  name: string
  description: string
  scope: PipelineScope
  projectId: string | null
  projectName: string | null
  status: PipelineStatus
  tiers: TierConfig[]
  assignments: PipelineAgentAssignment[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

/** Resumo para listagem */
export interface PipelineSummary {
  id: string
  name: string
  description: string
  scope: PipelineScope
  projectId: string | null
  projectName: string | null
  status: PipelineStatus
  tierCount: number
  assignmentCount: number
  domainsConfigured: number
  updatedAt: string
}

/* ─── Payloads ─── */

/** Payload para criar pipeline */
export interface CreatePipelinePayload {
  name: string
  description: string
  scope: PipelineScope
  projectId?: string
}

/** Payload para atualizar pipeline */
export interface UpdatePipelinePayload {
  name?: string
  description?: string
  status?: PipelineStatus
}

/** Payload para atualizar configuração de tiers */
export interface UpdateTiersPayload {
  tiers: Omit<TierConfig, 'criteria'>[]
}

/** Payload para atualizar critérios de um tier */
export interface UpdateTierCriteriaPayload {
  criteria: Omit<TierCriterion, 'id'>[]
}

/** Payload para criar/atualizar atribuição de agente */
export interface UpsertAgentAssignmentPayload {
  domainId: DomainId
  tier: TierClassification
  agentId: string
  llmConfig: {
    provider: LlmProvider
    modelId: string
    displayName: string
    costPer1kInput: number
    costPer1kOutput: number
  }
  executionMode: ExecutionMode
  enabled: boolean
}

/* ─── Constantes ─── */

/** Configuração padrão de tiers */
export const DEFAULT_TIERS: TierConfig[] = [
  {
    tier: 'T0',
    name: 'Hotfix',
    description: 'Correções críticas em produção — bypass de gates',
    color: '#ef4444',
    criteria: [],
    maxLeadTimeDays: 1,
    slaHours: 4,
    autoApproveGates: true,
  },
  {
    tier: 'T1',
    name: 'Quick Win',
    description: 'Ajustes simples sem impacto arquitetural',
    color: '#f59e0b',
    criteria: [],
    maxLeadTimeDays: 3,
    slaHours: 24,
    autoApproveGates: false,
  },
  {
    tier: 'T2',
    name: 'Feature',
    description: 'Funcionalidades com escopo definido e impacto moderado',
    color: '#3b82f6',
    criteria: [],
    maxLeadTimeDays: 10,
    slaHours: 72,
    autoApproveGates: false,
  },
  {
    tier: 'T3',
    name: 'Epic',
    description: 'Entregas complexas, multi-sprint, com impacto arquitetural',
    color: '#8b5cf6',
    criteria: [],
    maxLeadTimeDays: 30,
    slaHours: 168,
    autoApproveGates: false,
  },
]

/** Estimativa de economia em modo batch (%) */
export const BATCH_SAVINGS_PERCENT = 40

/** Informações sobre os domínios para o pipeline */
export const PIPELINE_DOMAINS: { id: DomainId; name: string; description: string; icon: string }[] = [
  { id: 'DOM-01', name: 'Discovery', description: 'Classificação e triagem', icon: '🔍' },
  { id: 'DOM-02', name: 'Requirements', description: 'Análise de requisitos', icon: '📋' },
  { id: 'DOM-03', name: 'Architecture', description: 'Decisões arquiteturais', icon: '🏗️' },
  { id: 'DOM-04', name: 'Development', description: 'Implementação e PR', icon: '💻' },
  { id: 'DOM-05', name: 'Quality Assurance', description: 'QA negocial e técnico', icon: '✅' },
]
