import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAgents,
  fetchAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  addSkill,
  addLlm,
  addPrompt,
} from '@infrastructure/api/adapters/agentsApi'
import type {
  Agent,
  AgentSummary,
  CreateAgentPayload,
  UpdateAgentPayload,
  DomainId,
  UpsertSkillPayload,
  UpsertLlmPayload,
  UpsertPromptPayload,
} from '@domain/models/agent'

const AGENTS_KEY = ['agents'] as const

export function useAgents(domainId?: DomainId) {
  return useQuery<AgentSummary[]>({
    queryKey: domainId ? [...AGENTS_KEY, { domainId }] : [...AGENTS_KEY],
    queryFn: () => fetchAgents(domainId),
    staleTime: 30_000,
  })
}

export function useAgent(id: string | null) {
  return useQuery<Agent>({
    queryKey: [...AGENTS_KEY, id],
    queryFn: () => fetchAgent(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => createAgent(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: AGENTS_KEY }) },
  })
}

export function useUpdateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgentPayload }) =>
      updateAgent(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY })
      qc.invalidateQueries({ queryKey: [...AGENTS_KEY, variables.id] })
    },
  })
}

export function useDeleteAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: AGENTS_KEY }) },
  })
}

export function useAddSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ agentId, payload }: { agentId: string; payload: UpsertSkillPayload }) =>
      addSkill(agentId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...AGENTS_KEY, variables.agentId] })
    },
  })
}

export function useAddLlm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ agentId, payload }: { agentId: string; payload: UpsertLlmPayload }) =>
      addLlm(agentId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...AGENTS_KEY, variables.agentId] })
    },
  })
}

export function useAddPrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ agentId, payload }: { agentId: string; payload: UpsertPromptPayload }) =>
      addPrompt(agentId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...AGENTS_KEY, variables.agentId] })
    },
  })
}
