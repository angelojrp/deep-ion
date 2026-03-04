import type {
  Tenant,
  TenantListResponse,
  CreateTenantPayload,
  UpdateTenantPayload,
} from '@domain/models/tenant'

const TENANTS_URL = '/api/tenants'

interface FetchTenantsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export async function fetchTenants(
  params: FetchTenantsParams = {},
): Promise<TenantListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)

  const url = query.toString() ? `${TENANTS_URL}?${query}` : TENANTS_URL
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch tenants: ${response.status}`)
  }
  return response.json() as Promise<TenantListResponse>
}

export async function fetchTenant(id: string): Promise<Tenant> {
  const response = await fetch(`${TENANTS_URL}/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch tenant: ${response.status}`)
  }
  return response.json() as Promise<Tenant>
}

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  const response = await fetch(TENANTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const err = new Error(
      (error as Record<string, string>).message ?? `Failed to create tenant: ${response.status}`,
    )
    ;(err as Error & { code?: string }).code = (error as Record<string, string>).error
    throw err
  }
  return response.json() as Promise<Tenant>
}

export async function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<Tenant> {
  const response = await fetch(`${TENANTS_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to update tenant: ${response.status}`)
  }
  return response.json() as Promise<Tenant>
}

export async function deactivateTenant(
  id: string,
): Promise<{ success: boolean; tenant: Tenant }> {
  const response = await fetch(`${TENANTS_URL}/${id}/deactivate`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to deactivate tenant: ${response.status}`)
  }
  return response.json() as Promise<{ success: boolean; tenant: Tenant }>
}

export async function reactivateTenant(
  id: string,
): Promise<{ success: boolean; tenant: Tenant }> {
  const response = await fetch(`${TENANTS_URL}/${id}/reactivate`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to reactivate tenant: ${response.status}`)
  }
  return response.json() as Promise<{ success: boolean; tenant: Tenant }>
}

export async function checkSlugAvailability(
  slug: string,
): Promise<{ available: boolean }> {
  const response = await fetch(`${TENANTS_URL}/check-slug/${slug}`)
  if (!response.ok) {
    throw new Error(`Failed to check slug: ${response.status}`)
  }
  return response.json() as Promise<{ available: boolean }>
}
