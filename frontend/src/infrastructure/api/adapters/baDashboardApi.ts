import type { BaDashboardData } from '@domain/models/ba-dashboard'

const BA_DASHBOARD_URL = '/api/ba-dashboard'

export async function fetchBaDashboard(): Promise<BaDashboardData> {
  const response = await fetch(BA_DASHBOARD_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch BA dashboard: ${response.status}`)
  }
  return response.json() as Promise<BaDashboardData>
}
