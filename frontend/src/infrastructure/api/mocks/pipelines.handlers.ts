import { http, HttpResponse } from 'msw'
import fixtureData from './fixtures/pipelines.json'
import type { PipelineConfig, PipelineSummary } from '@domain/models/pipeline'

const pipelines: PipelineConfig[] = fixtureData.pipelines as unknown as PipelineConfig[]
const availableLlms = fixtureData.availableLlms

function toSummary(p: PipelineConfig): PipelineSummary {
  const uniqueDomains = new Set(p.assignments.map((a) => a.domainId))
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    scope: p.scope,
    projectId: p.projectId,
    projectName: p.projectName,
    status: p.status,
    tierCount: p.tiers.length,
    assignmentCount: p.assignments.length,
    domainsConfigured: uniqueDomains.size,
    updatedAt: p.updatedAt,
  }
}

export const pipelinesHandlers = [
  /* ── List pipelines ── */
  http.get('/api/pipelines', ({ request }) => {
    const url = new URL(request.url)
    const scope = url.searchParams.get('scope')
    const projectId = url.searchParams.get('projectId')
    let filtered = pipelines
    if (scope) filtered = filtered.filter((p) => p.scope === scope)
    if (projectId) filtered = filtered.filter((p) => p.projectId === projectId)
    return HttpResponse.json(filtered.map(toSummary))
  }),

  /* ── Get single pipeline ── */
  http.get('/api/pipelines/:id', ({ params }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(pipeline)
  }),

  /* ── Create pipeline ── */
  http.post('/api/pipelines', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newPipeline: PipelineConfig = {
      id: 'pipe-' + crypto.randomUUID().slice(0, 8),
      name: String(body.name ?? ''),
      description: String(body.description ?? ''),
      scope: (body.scope as PipelineConfig['scope']) ?? 'global',
      projectId: (body.projectId as string) ?? null,
      projectName: (body.projectName as string) ?? null,
      status: 'draft',
      tiers: [
        { tier: 'T0', name: 'Hotfix', description: 'Correções críticas', color: '#ef4444', criteria: [], maxLeadTimeDays: 1, slaHours: 4, autoApproveGates: true },
        { tier: 'T1', name: 'Quick Win', description: 'Ajustes simples', color: '#f59e0b', criteria: [], maxLeadTimeDays: 3, slaHours: 24, autoApproveGates: false },
        { tier: 'T2', name: 'Feature', description: 'Funcionalidades médias', color: '#3b82f6', criteria: [], maxLeadTimeDays: 10, slaHours: 72, autoApproveGates: false },
        { tier: 'T3', name: 'Epic', description: 'Entregas complexas', color: '#8b5cf6', criteria: [], maxLeadTimeDays: 30, slaHours: 168, autoApproveGates: false },
      ],
      assignments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
    }
    return HttpResponse.json(newPipeline, { status: 201 })
  }),

  /* ── Update pipeline ── */
  http.put('/api/pipelines/:id', async ({ params, request }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const updated = { ...pipeline, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updated)
  }),

  /* ── Delete pipeline ── */
  http.delete('/api/pipelines/:id', ({ params }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  /* ── Update tiers ── */
  http.put('/api/pipelines/:id/tiers', async ({ params, request }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const tiers = Array.isArray(body.tiers) ? body.tiers : pipeline.tiers
    return HttpResponse.json({ ...pipeline, tiers, updatedAt: new Date().toISOString() })
  }),

  /* ── Update tier criteria ── */
  http.put('/api/pipelines/:id/tiers/:tier/criteria', async ({ params, request }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const criteria = Array.isArray(body.criteria)
      ? body.criteria.map((c: Record<string, unknown>, i: number) => ({ ...c, id: `crit-${crypto.randomUUID().slice(0, 6)}-${i}` }))
      : []
    const updatedTiers = pipeline.tiers.map((t) =>
      t.tier === params.tier ? { ...t, criteria } : t,
    )
    return HttpResponse.json({ ...pipeline, tiers: updatedTiers, updatedAt: new Date().toISOString() })
  }),

  /* ── Upsert agent assignment ── */
  http.post('/api/pipelines/:id/assignments', async ({ params, request }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const assignment = {
      ...body,
      id: 'assign-' + crypto.randomUUID().slice(0, 8),
      llmConfig: { ...(body.llmConfig as Record<string, unknown>), id: 'llm-cfg-' + crypto.randomUUID().slice(0, 6) },
    }
    return HttpResponse.json(assignment, { status: 201 })
  }),

  /* ── Delete assignment ── */
  http.delete('/api/pipelines/:id/assignments/:assignmentId', ({ params }) => {
    const pipeline = pipelines.find((p) => p.id === params.id)
    if (!pipeline) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  /* ── Available LLMs catalog ── */
  http.get('/api/llms/catalog', () => {
    return HttpResponse.json(availableLlms)
  }),
]
