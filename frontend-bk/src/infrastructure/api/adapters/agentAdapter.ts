import type { Agent } from '@domain/models/agent'
import { httpGet } from '@infrastructure/http/httpClient'

export const agentAdapter = {
  listByTenant: (tenant: string): Promise<Agent[]> => httpGet<Agent[]>(`/api/tenants/${tenant}/agents`)
}