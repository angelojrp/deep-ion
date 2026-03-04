import { http, HttpResponse } from 'msw'
import fixture from './fixtures/blueprints-management.json'

type FixtureData = {
  blueprints: Array<{
    id: string
    name: string
    description: string
    category: 'backend' | 'frontend' | 'batch' | 'fullstack'
    creationMode: 'manual' | 'assisted'
    currentVersion: string
    manualYaml: string
    linkedProjects: Array<{ projectId: string; projectName: string; version: string }>
    versions: Array<{
      version: string
      status: 'active' | 'in-use' | 'superseded'
      createdAt: string
      notes: string
    }>
    history: Array<{
      id: string
      date: string
      author: string
      action: string
      detail: string
    }>
    updatedAt: string
  }>
}

const data = fixture as FixtureData

function nextPatchVersion(version: string): string {
  const parts = version.split('.').map((item) => Number.parseInt(item, 10))
  if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) return '1.0.1'
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
}

export const blueprintsManagementHandlers = [
  http.get('/api/blueprints-management', () => {
    return HttpResponse.json(data.blueprints)
  }),

  http.post('/api/blueprints-management', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      description?: string
      category?: 'backend' | 'frontend' | 'batch' | 'fullstack'
      creationMode?: 'manual' | 'assisted'
      manualYaml?: string
      cloneSourceId?: string
    }

    if (!body.name || !body.description || !body.category || !body.creationMode) {
      return new HttpResponse(null, { status: 400 })
    }

    const source = body.cloneSourceId
      ? data.blueprints.find((item) => item.id === body.cloneSourceId)
      : undefined

    const now = new Date().toISOString()
    const created = {
      id: `bp-${crypto.randomUUID().slice(0, 8)}`,
      name: source ? `${body.name} (clone)` : body.name,
      description: body.description,
      category: body.category,
      creationMode: body.creationMode,
      currentVersion: '1.0.0',
      manualYaml: body.manualYaml ?? source?.manualYaml ?? 'blueprintName: novo-blueprint\n',
      linkedProjects: [],
      versions: [
        {
          version: '1.0.0',
          status: 'active' as const,
          createdAt: now,
          notes: source ? 'Blueprint criado por clonagem.' : 'Blueprint criado.',
        },
      ],
      history: [
        {
          id: `hist-${crypto.randomUUID().slice(0, 8)}`,
          date: now,
          author: 'Arquiteto Responsável',
          action: source ? 'Clonagem' : 'Criação',
          detail: source
            ? `Clone a partir de ${source.name}.`
            : 'Novo blueprint criado.',
        },
      ],
      updatedAt: now,
    }

    data.blueprints.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/blueprints-management/:id', async ({ params, request }) => {
    const blueprint = data.blueprints.find((item) => item.id === params.id)
    if (!blueprint) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = (await request.json()) as {
      name?: string
      description?: string
      category?: 'backend' | 'frontend' | 'batch' | 'fullstack'
      editMode?: 'manual' | 'assisted'
      manualYaml?: string
      publishNewVersion?: boolean
    }

    const now = new Date().toISOString()
    blueprint.name = body.name ?? blueprint.name
    blueprint.description = body.description ?? blueprint.description
    blueprint.category = body.category ?? blueprint.category
    blueprint.creationMode = body.editMode ?? blueprint.creationMode
    blueprint.manualYaml = body.manualYaml ?? blueprint.manualYaml

    if (body.publishNewVersion) {
      const newVersion = nextPatchVersion(blueprint.currentVersion)
      blueprint.currentVersion = newVersion

      blueprint.versions = blueprint.versions.map((version) => {
        if (version.status === 'active') {
          return {
            ...version,
            status: 'superseded' as const,
          }
        }
        return version
      })

      blueprint.versions.unshift({
        version: newVersion,
        status: blueprint.linkedProjects.length > 0 ? 'in-use' : 'active',
        createdAt: now,
        notes: 'Nova versão publicada via edição.',
      })
    }

    blueprint.history.unshift({
      id: `hist-${crypto.randomUUID().slice(0, 8)}`,
      date: now,
      author: 'Arquiteto Responsável',
      action: body.publishNewVersion ? 'Publicação de versão' : 'Edição',
      detail: body.publishNewVersion
        ? 'Publicada nova versão sem migração automática de projetos.'
        : 'Dados do blueprint atualizados.',
    })
    blueprint.updatedAt = now

    return HttpResponse.json(blueprint)
  }),

  http.post('/api/blueprints-management/:id/clone', ({ params }) => {
    const blueprint = data.blueprints.find((item) => item.id === params.id)
    if (!blueprint) {
      return new HttpResponse(null, { status: 404 })
    }

    const now = new Date().toISOString()
    const cloned = {
      ...blueprint,
      id: `bp-${crypto.randomUUID().slice(0, 8)}`,
      name: `${blueprint.name} (clone)`,
      linkedProjects: [],
      currentVersion: '1.0.0',
      versions: [
        {
          version: '1.0.0',
          status: 'active' as const,
          createdAt: now,
          notes: `Clone de ${blueprint.name}.`,
        },
      ],
      history: [
        {
          id: `hist-${crypto.randomUUID().slice(0, 8)}`,
          date: now,
          author: 'Arquiteto Responsável',
          action: 'Clonagem',
          detail: `Blueprint clonado de ${blueprint.name}.`,
        },
      ],
      updatedAt: now,
    }

    data.blueprints.unshift(cloned)
    return HttpResponse.json(cloned, { status: 201 })
  }),
]
