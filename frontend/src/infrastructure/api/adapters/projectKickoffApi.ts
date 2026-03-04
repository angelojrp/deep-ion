import type {
  ProjectKickoff,
  StartKickoffPayload,
  ReviewDocumentPayload,
} from '@domain/models/project-kickoff'
import type { ProjectSummary } from '@domain/models/project'

const KICKOFFS_URL = '/api/project-kickoffs'
const PENDING_PROJECTS_URL = '/api/projects/pending'

/** Payload para criação rápida de projeto pendente */
export interface CreatePendingProjectPayload {
  name: string
  slug: string
  description: string
}

export async function fetchPendingProjects(): Promise<ProjectSummary[]> {
  const response = await fetch(PENDING_PROJECTS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch pending projects: ${response.status}`)
  }
  return response.json() as Promise<ProjectSummary[]>
}

export async function createPendingProject(
  payload: CreatePendingProjectPayload,
): Promise<ProjectSummary> {
  const response = await fetch(PENDING_PROJECTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create pending project: ${response.status}`)
  }
  return response.json() as Promise<ProjectSummary>
}

export async function fetchKickoffs(): Promise<ProjectKickoff[]> {
  const response = await fetch(KICKOFFS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch kickoffs: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff[]>
}

export async function fetchKickoff(projectId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${projectId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch kickoff: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function startKickoff(payload: StartKickoffPayload): Promise<ProjectKickoff> {
  const response = await fetch(KICKOFFS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to start kickoff: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function generateVision(kickoffId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/generate-vision`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to generate vision: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function reviewVision(
  kickoffId: string,
  payload: ReviewDocumentPayload,
): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/review-vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to review vision: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function updateVisionSection(
  kickoffId: string,
  sectionId: string,
  content: string,
): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/vision-sections/${sectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update vision section: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function checkArchitecture(kickoffId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/check-architecture`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to check architecture: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function completeArchitectureTask(kickoffId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/complete-architecture-task`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to complete architecture task: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function generateArchitecture(kickoffId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/generate-architecture`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to generate architecture: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function reviewArchitecture(
  kickoffId: string,
  payload: ReviewDocumentPayload,
): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/review-architecture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to review architecture: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function updateArchitectureSection(
  kickoffId: string,
  sectionId: string,
  content: string,
): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/architecture-sections/${sectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update architecture section: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}

export async function generateScaffold(kickoffId: string): Promise<ProjectKickoff> {
  const response = await fetch(`${KICKOFFS_URL}/${kickoffId}/generate-scaffold`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to generate scaffold: ${response.status}`)
  }
  return response.json() as Promise<ProjectKickoff>
}
