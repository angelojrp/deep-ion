import { useQuery } from '@tanstack/react-query'
import { fetchRaDashboard } from '@infrastructure/api/adapters/raDashboardApi'
import type { RaDashboardData } from '@domain/models/ra-dashboard'

const RA_DASHBOARD_QUERY_KEY = ['ra-dashboard'] as const

export function useRaDashboard() {
  return useQuery<RaDashboardData>({
    queryKey: RA_DASHBOARD_QUERY_KEY,
    queryFn: fetchRaDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
