import type {
  Project,
  ProjectSummary,
  CreateProjectPayload,
  UpdateProjectPayload,
  TenantMember,
  BlueprintInfo,
} from '@domain/models/project'

const PROJECTS_URL = '/api/projects'
const TENANT_MEMBERS_URL = '/api/tenant-members'
const TENANT_CONFIG_URL = '/api/tenant-config'
const BLUEPRINTS_URL = '/api/blueprints'

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const response = await fetch(PROJECTS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`)
  }
  return response.json() as Promise<ProjectSummary[]>
}

export async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`${PROJECTS_URL}/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.status}`)
  }
  return response.json() as Promise<Project>
}

export async function fetchTenantMembers(): Promise<TenantMember[]> {
  const response = await fetch(TENANT_MEMBERS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch tenant members: ${response.status}`)
  }
  return response.json() as Promise<TenantMember[]>
}

export async function fetchBlueprints(): Promise<BlueprintInfo[]> {
  const response = await fetch(BLUEPRINTS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch blueprints: ${response.status}`)
  }
  return response.json() as Promise<BlueprintInfo[]>
}

export interface TenantGlobalConfig {
  repository: {
    provider: string
    serverUrl: string | null
    accessTokenMasked: string
  }
  aiProviders: {
    provider: string
    endpointUrl: string | null
    apiKeyMasked: string
    defaultModel: string
  }[]
}

export async function fetchTenantConfig(): Promise<TenantGlobalConfig> {
  const response = await fetch(TENANT_CONFIG_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch tenant config: ${response.status}`)
  }
  return response.json() as Promise<TenantGlobalConfig>
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const response = await fetch(PROJECTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`)
  }
  return response.json() as Promise<Project>
}

export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
  const response = await fetch(`${PROJECTS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.status}`)
  }
  return response.json() as Promise<Project>
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${PROJECTS_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.status}`)
  }
}
