import { http, HttpResponse } from 'msw'
import dashboardData from './fixtures/ux-dashboard.json'

export const uxDashboardHandlers = [
  http.get('/api/ux-dashboard', () => {
    return HttpResponse.json(dashboardData)
  }),
]
