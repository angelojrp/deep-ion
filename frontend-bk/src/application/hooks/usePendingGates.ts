import { useQuery } from '@tanstack/react-query'
import { pendingGateAdapter } from '@infrastructure/api/adapters/pendingGateAdapter'
import { queryKeys } from '@infrastructure/http/queryKeys'

export const usePendingGates = (tenant: string) =>
  useQuery({
    queryKey: queryKeys.pendingGates(tenant),
    queryFn: () => pendingGateAdapter.listByTenant(tenant)
  })