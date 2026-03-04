import type { UxDashboardData } from '@domain/models/ux-dashboard'

const UX_DASHBOARD_URL = '/api/ux-dashboard'

export async function fetchUxDashboard(): Promise<UxDashboardData> {
  const response = await fetch(UX_DASHBOARD_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch UX dashboard: ${response.status}`)
  }
  return response.json() as Promise<UxDashboardData>
}
