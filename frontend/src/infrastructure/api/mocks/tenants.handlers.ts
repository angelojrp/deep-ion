import { http, HttpResponse } from 'msw'
import data from './fixtures/tenants.json'
import type { Tenant } from '@domain/models/tenant'

// Mutable copy for mock CRUD operations
const tenants: Tenant[] = [...data] as Tenant[]

export const tenantsHandlers = [
  // List tenants (paginated + search + filter)
  http.get('/api/tenants', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const statusFilter = url.searchParams.get('status') ?? ''

    let filtered = [...tenants]

    // Filter by status
    if (statusFilter && statusFilter !== 'TODOS') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    // Search by name or slug
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.nome.toLowerCase().includes(search) ||
          t.slug.toLowerCase().includes(search),
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize).map((t) => ({
      tenant_id: t.tenant_id,
      nome: t.nome,
      slug: t.slug,
      status: t.status,
      criado_em: t.criado_em,
      membros_ativos: t.membros_ativos,
    }))

    return HttpResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages,
    })
  }),

  // Get tenant detail
  http.get('/api/tenants/:id', ({ params }) => {
    const tenant = tenants.find((t) => t.tenant_id === params.id)
    if (!tenant) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(tenant)
  }),

  // Create tenant
  http.post('/api/tenants', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    // Check slug uniqueness
    const slugExists = tenants.some((t) => t.slug === body.slug)
    if (slugExists) {
      return HttpResponse.json(
        { error: 'SLUG_DUPLICADO', message: 'Este slug já está em uso.' },
        { status: 409 },
      )
    }

    const newTenant: Tenant = {
      tenant_id: `01HXYZ${crypto.randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`,
      nome: body.nome as string,
      slug: body.slug as string,
      status: 'ATIVO',
      criado_em: new Date().toISOString(),
      email_admin: body.email_admin as string,
      primeiro_nome_admin: body.primeiro_nome_admin as string,
      sobrenome_admin: body.sobrenome_admin as string,
      telefones_admin: (body.telefones_admin as string[]) ?? [],
      membros_ativos: 0,
    }

    tenants.unshift(newTenant)

    return HttpResponse.json(newTenant, { status: 201 })
  }),

  // Update tenant (name only)
  http.patch('/api/tenants/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const idx = tenants.findIndex((t) => t.tenant_id === params.id)
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    if (body.nome) {
      tenants[idx] = { ...tenants[idx], nome: body.nome as string }
    }

    return HttpResponse.json(tenants[idx])
  }),

  // Deactivate tenant
  http.post('/api/tenants/:id/deactivate', ({ params }) => {
    const idx = tenants.findIndex((t) => t.tenant_id === params.id)
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    tenants[idx] = { ...tenants[idx], status: 'INATIVO', membros_ativos: 0 }

    return HttpResponse.json({ success: true, tenant: tenants[idx] })
  }),

  // Reactivate tenant
  http.post('/api/tenants/:id/reactivate', ({ params }) => {
    const idx = tenants.findIndex((t) => t.tenant_id === params.id)
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    tenants[idx] = { ...tenants[idx], status: 'ATIVO' }

    return HttpResponse.json({ success: true, tenant: tenants[idx] })
  }),

  // Check slug availability
  http.get('/api/tenants/check-slug/:slug', ({ params }) => {
    const exists = tenants.some((t) => t.slug === params.slug)
    return HttpResponse.json({ available: !exists })
  }),
]
