import { useQuery } from '@tanstack/react-query'

export const useGlobalMetrics = () =>
  useQuery({
    queryKey: ['global-metrics'],
    queryFn: () => Promise.resolve({ totalTenants: 1, llmUsageUsd: 120 })
  })