import type {
  Blueprint,
  CreateBlueprintPayload,
  UpdateBlueprintPayload,
} from '@domain/models/blueprint'

const BLUEPRINTS_URL = '/api/blueprints-management'

export async function fetchBlueprintsManagement(): Promise<Blueprint[]> {
  const response = await fetch(BLUEPRINTS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch blueprints: ${response.status}`)
  }
  return response.json() as Promise<Blueprint[]>
}

export async function createBlueprint(payload: CreateBlueprintPayload): Promise<Blueprint> {
  const response = await fetch(BLUEPRINTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create blueprint: ${response.status}`)
  }
  return response.json() as Promise<Blueprint>
}

export async function updateBlueprint(id: string, payload: UpdateBlueprintPayload): Promise<Blueprint> {
  const response = await fetch(`${BLUEPRINTS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to update blueprint: ${response.status}`)
  }
  return response.json() as Promise<Blueprint>
}

export async function cloneBlueprint(id: string): Promise<Blueprint> {
  const response = await fetch(`${BLUEPRINTS_URL}/${id}/clone`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to clone blueprint: ${response.status}`)
  }
  return response.json() as Promise<Blueprint>
}
