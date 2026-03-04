import type {
  Agent,
  AgentSummary,
  CreateAgentPayload,
  UpdateAgentPayload,
  DomainId,
  UpsertSkillPayload,
  UpsertLlmPayload,
  UpsertPromptPayload,
  AgentSkill,
  AuthorizedLlm,
  AgentPrompt,
} from '@domain/models/agent'

const AGENTS_URL = '/api/agents'

export async function fetchAgents(domainId?: DomainId): Promise<AgentSummary[]> {
  const url = domainId ? `${AGENTS_URL}?domainId=${domainId}` : AGENTS_URL
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch agents: ${response.status}`)
  return response.json() as Promise<AgentSummary[]>
}

export async function fetchAgent(id: string): Promise<Agent> {
  const response = await fetch(`${AGENTS_URL}/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch agent: ${response.status}`)
  return response.json() as Promise<Agent>
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  const response = await fetch(AGENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to create agent: ${response.status}`)
  return response.json() as Promise<Agent>
}

export async function updateAgent(id: string, payload: UpdateAgentPayload): Promise<Agent> {
  const response = await fetch(`${AGENTS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to update agent: ${response.status}`)
  return response.json() as Promise<Agent>
}

export async function deleteAgent(id: string): Promise<void> {
  const response = await fetch(`${AGENTS_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(`Failed to delete agent: ${response.status}`)
}

export async function addSkill(agentId: string, payload: UpsertSkillPayload): Promise<AgentSkill> {
  const response = await fetch(`${AGENTS_URL}/${agentId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to add skill: ${response.status}`)
  return response.json() as Promise<AgentSkill>
}

export async function addLlm(agentId: string, payload: UpsertLlmPayload): Promise<AuthorizedLlm> {
  const response = await fetch(`${AGENTS_URL}/${agentId}/llms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to add LLM: ${response.status}`)
  return response.json() as Promise<AuthorizedLlm>
}

export async function addPrompt(agentId: string, payload: UpsertPromptPayload): Promise<AgentPrompt> {
  const response = await fetch(`${AGENTS_URL}/${agentId}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Failed to add prompt: ${response.status}`)
  return response.json() as Promise<AgentPrompt>
}
