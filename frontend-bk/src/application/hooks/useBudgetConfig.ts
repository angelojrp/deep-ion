import { useQuery } from '@tanstack/react-query'

export const useBudgetConfig = (tenant: string) =>
  useQuery({
    queryKey: ['budget', tenant],
    queryFn: () => Promise.resolve({ tenantId: tenant, monthlyLimitUsd: 1000, usedUsd: 120, alertThreshold: 80 })
  })