import { useQuery } from '@tanstack/react-query'
import { fetchBaDashboard } from '@infrastructure/api/adapters/baDashboardApi'
import type { BaDashboardData } from '@domain/models/ba-dashboard'

const BA_DASHBOARD_QUERY_KEY = ['ba-dashboard'] as const

export function useBaDashboard() {
  return useQuery<BaDashboardData>({
    queryKey: BA_DASHBOARD_QUERY_KEY,
    queryFn: fetchBaDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
