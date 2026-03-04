import { http, HttpResponse } from 'msw'
import fixtureData from './fixtures/agents.json'
import type { Agent, AgentSummary } from '@domain/models/agent'

const agents: Agent[] = fixtureData.agents as unknown as Agent[]

function toSummary(agent: Agent): AgentSummary {
  return {
    id: agent.id,
    domainId: agent.domainId,
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    version: agent.version,
    status: agent.status,
    autonomyLevel: agent.autonomyLevel,
    skillCount: agent.skills.length,
    llmCount: agent.authorizedLlms.length,
    promptCount: agent.prompts.length,
    tags: agent.tags,
    lastActiveAt: agent.lastActiveAt,
    totalExecutions: agent.totalExecutions,
    successRate: agent.successRate,
  }
}

export const agentsHandlers = [
  http.get('/api/agents', ({ request }) => {
    const url = new URL(request.url)
    const domainId = url.searchParams.get('domainId')
    let filtered = agents
    if (domainId) {
      filtered = filtered.filter((a) => a.domainId === domainId)
    }
    const summaries = filtered.map(toSummary)
    return HttpResponse.json(summaries)
  }),

  http.get('/api/agents/:id', ({ params }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(agent)
  }),

  http.post('/api/agents', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newAgent = {
      ...body,
      id: 'agent-' + crypto.randomUUID().slice(0, 8),
      slug: String(body.name ?? 'new-agent').toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      status: 'inactive',
      skills: [],
      authorizedLlms: [],
      prompts: [],
      tags: body.tags ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
      lastActiveAt: null,
      totalExecutions: 0,
      successRate: 0,
    }
    return HttpResponse.json(newAgent, { status: 201 })
  }),

  http.put('/api/agents/:id', async ({ params, request }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const updated = { ...agent, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updated)
  }),

  http.delete('/api/agents/:id', ({ params }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/agents/:id/skills', async ({ params, request }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const checks = Array.isArray(body.checks) ? body.checks : []
    const newSkill = {
      ...body,
      id: 'skill-' + crypto.randomUUID().slice(0, 8),
      checks: checks.map((c: unknown, i: number) => ({
        ...(c as Record<string, unknown>),
        id: 'chk-' + crypto.randomUUID().slice(0, 6) + '-' + i,
      })),
      executionCount: 0,
      lastExecutedAt: null,
      avgDurationSeconds: null,
    }
    return HttpResponse.json(newSkill, { status: 201 })
  }),

  http.post('/api/agents/:id/llms', async ({ params, request }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const newLlm = { ...body, id: 'llm-' + crypto.randomUUID().slice(0, 8) }
    return HttpResponse.json(newLlm, { status: 201 })
  }),

  http.post('/api/agents/:id/prompts', async ({ params, request }) => {
    const agent = agents.find((a) => a.id === params.id)
    if (!agent) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const newPrompt = {
      ...body,
      id: 'prompt-' + crypto.randomUUID().slice(0, 8),
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(newPrompt, { status: 201 })
  }),
]
