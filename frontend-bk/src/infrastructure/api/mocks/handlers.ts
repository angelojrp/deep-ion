import { http, HttpResponse } from 'msw'
import tenants from './fixtures/tenants.json'
import agents from './fixtures/agents.json'
import pendingGates from './fixtures/pending-gates.json'
import pipelineRuns from './fixtures/pipeline-runs.json'
import decisionRecords from './fixtures/decision-records.json'
import skillLogs from './fixtures/skill-logs.json'

export const handlers = [
  http.get('/api/tenants', () => HttpResponse.json(tenants)),
  http.get('/api/tenants/:tenant/agents', () => HttpResponse.json(agents)),
  http.get('/api/tenants/:tenant/gates/pending', () => HttpResponse.json(pendingGates)),
  http.get('/api/tenants/:tenant/pipeline-runs', () => HttpResponse.json(pipelineRuns)),
  http.get('/api/tenants/:tenant/decision-records', () => HttpResponse.json(decisionRecords)),
  http.get('/api/tenants/:tenant/agents/:agentId/logs', () => HttpResponse.json(skillLogs)),
  http.post('/api/gates/approve', () => HttpResponse.json({ success: true }))
]