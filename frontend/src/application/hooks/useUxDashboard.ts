import { useQuery } from '@tanstack/react-query'
import { fetchUxDashboard } from '@infrastructure/api/adapters/uxDashboardApi'
import type { UxDashboardData } from '@domain/models/ux-dashboard'

const UX_DASHBOARD_QUERY_KEY = ['ux-dashboard'] as const

export function useUxDashboard() {
  return useQuery<UxDashboardData>({
    queryKey: UX_DASHBOARD_QUERY_KEY,
    queryFn: fetchUxDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
