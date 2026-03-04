import { useQuery } from '@tanstack/react-query'
import { pipelineAdapter } from '@infrastructure/api/adapters/pipelineAdapter'
import { queryKeys } from '@infrastructure/http/queryKeys'

export const usePipelineRuns = (tenant: string) =>
  useQuery({
    queryKey: queryKeys.pipelineRuns(tenant),
    queryFn: () => pipelineAdapter.listByTenant(tenant)
  })