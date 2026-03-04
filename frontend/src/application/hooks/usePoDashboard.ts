import { useQuery } from '@tanstack/react-query'
import { fetchPoDashboard } from '@infrastructure/api/adapters/poDashboardApi'
import type { PoDashboardData } from '@domain/models/po-dashboard'

const PO_DASHBOARD_QUERY_KEY = ['po-dashboard'] as const

export function usePoDashboard() {
  return useQuery<PoDashboardData>({
    queryKey: PO_DASHBOARD_QUERY_KEY,
    queryFn: fetchPoDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
