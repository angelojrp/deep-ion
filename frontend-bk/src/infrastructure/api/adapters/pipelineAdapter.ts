import type { PipelineRun } from '@domain/models/pipelineRun'
import { httpGet } from '@infrastructure/http/httpClient'

export const pipelineAdapter = {
  listByTenant: (tenant: string): Promise<PipelineRun[]> =>
    httpGet<PipelineRun[]>(`/api/tenants/${tenant}/pipeline-runs`)
}