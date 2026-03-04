import type { PendingGate } from '@domain/models/pendingGate'
import { httpGet } from '@infrastructure/http/httpClient'

export const pendingGateAdapter = {
  listByTenant: (tenant: string): Promise<PendingGate[]> =>
    httpGet<PendingGate[]>(`/api/tenants/${tenant}/gates/pending`)
}