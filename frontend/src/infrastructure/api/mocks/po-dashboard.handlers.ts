import { http, HttpResponse } from 'msw'
import dashboardData from './fixtures/po-dashboard.json'

export const poDashboardHandlers = [
  http.get('/api/po-dashboard', () => {
    return HttpResponse.json(dashboardData)
  }),
]
