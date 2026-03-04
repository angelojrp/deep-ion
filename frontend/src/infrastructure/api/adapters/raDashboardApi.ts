import type { RaDashboardData } from '@domain/models/ra-dashboard'

const RA_DASHBOARD_URL = '/api/ra-dashboard'

export async function fetchRaDashboard(): Promise<RaDashboardData> {
  const response = await fetch(RA_DASHBOARD_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch RA dashboard: ${response.status}`)
  }
  return response.json() as Promise<RaDashboardData>
}
