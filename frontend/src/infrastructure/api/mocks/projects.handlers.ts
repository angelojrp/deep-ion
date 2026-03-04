import { http, HttpResponse } from 'msw'
import data from './fixtures/projects.json'

export const projectsHandlers = [
  // List available blueprints
  http.get('/api/blueprints', () => {
    return HttpResponse.json(data.availableBlueprints)
  }),

  // List all projects
  http.get('/api/projects', () => {
    const summaries = data.projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      repositoryProvider: p.repository.provider,
      multiModule: p.repository.multiModule,
      aiProvidersCount: p.aiProviders.length,
      membersCount: p.members.length,
      modulesCount: p.architecture?.modules?.length ?? 0,
      updatedAt: p.updatedAt,
    }))
    return HttpResponse.json(summaries)
  }),

  // Get project detail
  http.get('/api/projects/:id', ({ params }) => {
    const project = data.projects.find((p) => p.id === params.id)
    if (!project) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  // List tenant members (available for assignment)
  http.get('/api/tenant-members', () => {
    return HttpResponse.json(data.tenantMembers)
  }),

  // Get tenant global config (repo + AI providers)
  http.get('/api/tenant-config', () => {
    return HttpResponse.json(data.tenantGlobalConfig)
  }),

  // Create project
  http.post('/api/projects', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const repository = body.repository as Record<string, unknown> | undefined
    const documentation = body.documentation as Record<string, unknown> | undefined
    const aiProviders = Array.isArray(body.aiProviders)
      ? (body.aiProviders as Record<string, unknown>[]).map((ap, i) => ({
          id: `aip-new-${i}`,
          provider: ap.provider,
          endpointUrl: ap.endpointUrl ?? null,
          apiKeyMasked: typeof ap.apiKey === 'string' ? `${(ap.apiKey as string).slice(0, 4)}****` : '****',
          defaultModel: ap.defaultModel,
          rateLimitTokensPerMin: ap.rateLimitTokensPerMin ?? null,
          rateLimitRequestsPerDay: ap.rateLimitRequestsPerDay ?? null,
        }))
      : []
    const memberPayloads = Array.isArray(body.members)
      ? (body.members as { id: string; roles: string[] }[])
      : []
    const resolvedMembers = memberPayloads.map((m) => {
      const found = data.tenantMembers.find((tm) => tm.id === m.id)
      return { id: m.id, name: found?.name ?? 'Desconhecido', roles: m.roles }
    })

    const hasRepo = repository?.repositoryPath
    const hasAi = aiProviders.length > 0
    const projectStatus = hasRepo && hasAi ? 'active' : 'configuring'

    const architecturePayload = body.architecture as { modules?: { name: string; blueprintId: string; folderPath?: string; repositoryPath?: string }[] } | undefined
    const architectureModules = Array.isArray(architecturePayload?.modules)
      ? architecturePayload.modules.map((m, i) => ({
          id: `mod-new-${i}`,
          name: m.name,
          blueprintId: m.blueprintId,
          folderPath: m.folderPath ?? null,
          repositoryPath: m.repositoryPath ?? null,
        }))
      : []

    const newProject = {
      id: `proj-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-acme',
      name: body.name,
      slug: body.slug,
      description: body.description,
      status: projectStatus,
      repository: {
        provider: repository?.provider ?? 'github',
        useGlobalConfig: repository?.useGlobalConfig ?? true,
        serverUrl: repository?.serverUrl ?? null,
        accessTokenMasked: repository?.accessToken ? '****' : null,
        repositoryPath: repository?.repositoryPath ?? null,
        multiModule: repository?.multiModule ?? 'none',
      },
      architecture: {
        modules: architectureModules,
      },
      documentation: {
        type: documentation?.type ?? 'embedded',
        repositoryPath: documentation?.repositoryPath ?? null,
      },
      aiProviders,
      members: resolvedMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(newProject, { status: 201 })
  }),

  // Update project
  http.put('/api/projects/:id', async ({ params, request }) => {
    const project = data.projects.find((p) => p.id === params.id)
    if (!project) {
      return new HttpResponse(null, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const updated = { ...project, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updated)
  }),

  // Delete project
  http.delete('/api/projects/:id', ({ params }) => {
    const project = data.projects.find((p) => p.id === params.id)
    if (!project) {
      return new HttpResponse(null, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
