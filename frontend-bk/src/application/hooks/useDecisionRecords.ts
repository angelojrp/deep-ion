import { useQuery } from '@tanstack/react-query'
import { decisionRecordAdapter } from '@infrastructure/api/adapters/decisionRecordAdapter'
import { queryKeys } from '@infrastructure/http/queryKeys'

export const useDecisionRecords = (tenant: string) =>
  useQuery({
    queryKey: queryKeys.decisionRecords(tenant),
    queryFn: () => decisionRecordAdapter.listByTenant(tenant)
  })