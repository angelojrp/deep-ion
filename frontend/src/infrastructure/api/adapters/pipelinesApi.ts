import type {
  PipelineConfig,
  PipelineSummary,
  PipelineScope,
  CreatePipelinePayload,
  UpdatePipelinePayload,
  UpsertAgentAssignmentPayload,
  PipelineAgentAssignment,
  PipelineLlmConfig,
} from '@domain/models/pipeline'

const PIPELINES_URL = '/api/pipelines'

export async function fetchPipelines(scope?: PipelineScope, projectId?: string): Promise<PipelineSummary[]> {
  const params = new URLSearchParams()
  if (scope) params.set('scope', scope)
  if (projectId) params.set('projectId', projectId)
  const qs = params.toString()
  const url = qs ? `${PIPELINES_URL}?${qs}` : PIPELINES_URL
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch pipelines: ${response.status}`)
  return response.json() as Promise<PipelineSummary[]>
}

export async function fetchPipeline(id: string): Promise<PipelineConfig> {
  const response = await fetch(`${PIPELINES_URL}/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch pipeline: ${response.status}`)
  return response.json() as Promise<PipelineConfig>
}

export async function createPipeline(payload: CreatePipelinePayload): Promise<PipelineConfig> {
  const response = await fetch(PIPELINES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to create pipeline: ${response.status}`)
  return response.json() as Promise<PipelineConfig>
}

export async function updatePipeline(id: string, payload: UpdatePipelinePayload): Promise<PipelineConfig> {
  const response = await fetch(`${PIPELINES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to update pipeline: ${response.status}`)
  return response.json() as Promise<PipelineConfig>
}

export async function deletePipeline(id: string): Promise<void> {
  const response = await fetch(`${PIPELINES_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(`Failed to delete pipeline: ${response.status}`)
}

export async function upsertAssignment(
  pipelineId: string,
  payload: UpsertAgentAssignmentPayload,
): Promise<PipelineAgentAssignment> {
  const response = await fetch(`${PIPELINES_URL}/${pipelineId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to upsert assignment: ${response.status}`)
  return response.json() as Promise<PipelineAgentAssignment>
}

export async function deleteAssignment(pipelineId: string, assignmentId: string): Promise<void> {
  const response = await fetch(`${PIPELINES_URL}/${pipelineId}/assignments/${assignmentId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`Failed to delete assignment: ${response.status}`)
}

export async function fetchLlmCatalog(): Promise<Omit<PipelineLlmConfig, 'id'>[]> {
  const response = await fetch('/api/llms/catalog')
  if (!response.ok) throw new Error(`Failed to fetch LLM catalog: ${response.status}`)
  return response.json() as Promise<Omit<PipelineLlmConfig, 'id'>[]>
}
