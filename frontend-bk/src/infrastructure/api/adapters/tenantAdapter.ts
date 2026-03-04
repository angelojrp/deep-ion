import type { Tenant } from '@domain/models/tenant'
import { httpGet } from '@infrastructure/http/httpClient'

export const tenantAdapter = {
  list: (): Promise<Tenant[]> => httpGet<Tenant[]>('/api/tenants')
}