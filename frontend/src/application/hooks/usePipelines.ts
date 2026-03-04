import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPipelines,
  fetchPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  upsertAssignment,
  deleteAssignment,
  fetchLlmCatalog,
} from '@infrastructure/api/adapters/pipelinesApi'
import type {
  PipelineConfig,
  PipelineSummary,
  PipelineScope,
  CreatePipelinePayload,
  UpdatePipelinePayload,
  UpsertAgentAssignmentPayload,
  PipelineLlmConfig,
} from '@domain/models/pipeline'

const PIPELINES_KEY = ['pipelines'] as const
const LLM_CATALOG_KEY = ['llm-catalog'] as const

export function usePipelines(scope?: PipelineScope, projectId?: string) {
  return useQuery<PipelineSummary[]>({
    queryKey: [...PIPELINES_KEY, { scope, projectId }],
    queryFn: () => fetchPipelines(scope, projectId),
    staleTime: 30_000,
  })
}

export function usePipeline(id: string | null) {
  return useQuery<PipelineConfig>({
    queryKey: [...PIPELINES_KEY, id],
    queryFn: () => fetchPipeline(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useLlmCatalog() {
  return useQuery<Omit<PipelineLlmConfig, 'id'>[]>({
    queryKey: [...LLM_CATALOG_KEY],
    queryFn: () => fetchLlmCatalog(),
    staleTime: 300_000,
  })
}

export function useCreatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePipelinePayload) => createPipeline(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIPELINES_KEY })
    },
  })
}

export function useUpdatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePipelinePayload }) =>
      updatePipeline(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: PIPELINES_KEY })
      qc.invalidateQueries({ queryKey: [...PIPELINES_KEY, variables.id] })
    },
  })
}

export function useDeletePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePipeline(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIPELINES_KEY })
    },
  })
}

export function useUpsertAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pipelineId, payload }: { pipelineId: string; payload: UpsertAgentAssignmentPayload }) =>
      upsertAssignment(pipelineId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...PIPELINES_KEY, variables.pipelineId] })
    },
  })
}

export function useDeleteAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pipelineId, assignmentId }: { pipelineId: string; assignmentId: string }) =>
      deleteAssignment(pipelineId, assignmentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...PIPELINES_KEY, variables.pipelineId] })
    },
  })
}
