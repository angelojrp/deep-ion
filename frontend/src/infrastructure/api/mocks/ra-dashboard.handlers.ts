import { http, HttpResponse } from 'msw'
import dashboardData from './fixtures/ra-dashboard.json'

export const raDashboardHandlers = [
  http.get('/api/ra-dashboard', () => {
    return HttpResponse.json(dashboardData)
  }),
]
