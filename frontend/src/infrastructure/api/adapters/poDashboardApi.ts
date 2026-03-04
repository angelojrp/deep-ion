import type { PoDashboardData } from '@domain/models/po-dashboard'

const PO_DASHBOARD_URL = '/api/po-dashboard'

export async function fetchPoDashboard(): Promise<PoDashboardData> {
  const response = await fetch(PO_DASHBOARD_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch PO dashboard: ${response.status}`)
  }
  return response.json() as Promise<PoDashboardData>
}
