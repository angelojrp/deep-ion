import type { DecisionRecord } from '@domain/models/decisionRecord'
import { httpGet } from '@infrastructure/http/httpClient'

export const decisionRecordAdapter = {
  listByTenant: (tenant: string): Promise<DecisionRecord[]> =>
    httpGet<DecisionRecord[]>(`/api/tenants/${tenant}/decision-records`)
}