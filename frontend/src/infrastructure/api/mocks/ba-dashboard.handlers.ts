import { http, HttpResponse } from 'msw'
import dashboardData from './fixtures/ba-dashboard.json'

export const baDashboardHandlers = [
  http.get('/api/ba-dashboard', () => {
    return HttpResponse.json(dashboardData)
  }),
]
