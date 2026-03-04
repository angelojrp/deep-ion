```prompt
---
agent: ux-engineer
description: "Criar fixture JSON + handler MSW para novo recurso de API backend. Mock-first approach para desenvolvimento frontend desacoplado."
name: "di-ux-mock"
argument-hint: "Nome do recurso e descrição da API (ex: 'budgets — CRUD de orçamentos com filtro por período e categoria')"
---

Assuma o papel de **UX Engineer Frontend**.

> Objetivo: criar mock completo de API (fixture JSON + handler MSW + types) para um novo recurso, permitindo desenvolvimento frontend 100% desacoplado do backend.

---

## Pré-condição

Antes de criar o mock:
1. Ler mocks existentes em `frontend/src/infrastructure/api/mocks/handlers.ts` para manter padrão
2. Verificar fixtures existentes em `frontend/src/infrastructure/api/mocks/fixtures/`
3. Verificar types existentes em `frontend/src/domain/models/` e `frontend/src/shared/types/`

---

## Estrutura de Saída

### 1. Fixture JSON — Dados Mock Realistas

Criar `frontend/src/infrastructure/api/mocks/fixtures/{resource}.json`

**Regras para dados mock:**
- Mínimo **8 registros** com variação de estados e valores
- IDs como UUID v4 (`"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
- Nomes brasileiros realistas (Maria Silva, João Santos, Ana Oliveira, etc.)
- CPF **sempre mascarado**: `"***.***.456-78"` (LGPD)
- Valores monetários em número (não string): `1234.56`  
- Datas em ISO 8601: `"2026-01-15T10:30:00Z"`
- Status variados para cobrir todos os cenários visuais
- Incluir registros que representem edge cases (valor zero, texto longo, status raro)

**Exemplo:**

```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "descricao": "Transferência PIX - Maria Silva",
    "valor": 1500.00,
    "status": "confirmada",
    "tipo": "transferencia",
    "data": "2026-02-28T14:22:00Z",
    "contraparte": {
      "nome": "Maria Silva",
      "cpf": "***.***.456-78"
    }
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "descricao": "Pagamento de boleto - Energia",
    "valor": 287.43,
    "status": "pendente",
    "tipo": "pagamento",
    "data": "2026-03-01T09:15:00Z",
    "contraparte": {
      "nome": "CEMIG Distribuição",
      "cpf": null
    }
  }
]
```

### 2. TypeScript Types

Criar `frontend/src/domain/models/{Resource}.ts`

```typescript
export interface Resource {
  id: string
  descricao: string
  valor: number
  status: ResourceStatus
  tipo: ResourceTipo
  data: string
  contraparte: Contraparte | null
}

export type ResourceStatus = 'confirmada' | 'pendente' | 'cancelada'
export type ResourceTipo = 'transferencia' | 'pagamento' | 'deposito'

export interface Contraparte {
  nome: string
  cpf: string | null
}
```

### 3. Handler MSW

Adicionar handlers em `frontend/src/infrastructure/api/mocks/handlers.ts`

**Endpoints padrão:**

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/{resource}` | Listar com filtros via query params |
| GET | `/api/{resource}/:id` | Buscar por ID |
| POST | `/api/{resource}` | Criar novo |
| PUT | `/api/{resource}/:id` | Atualizar |
| DELETE | `/api/{resource}/:id` | Deletar |

**Handler com suporte a filtros, paginação e cenários de erro:**

```typescript
import { http, HttpResponse, delay } from 'msw'
import resourceData from './fixtures/{resource}.json'

export const resourceHandlers = [
  // GET list — com filtros e delay simulando rede
  http.get('/api/{resource}', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)

    let data = [...resourceData]

    // Filtro por status
    const status = url.searchParams.get('status')
    if (status) {
      data = data.filter(item => item.status === status)
    }

    // Filtro por tipo
    const tipo = url.searchParams.get('tipo')
    if (tipo) {
      data = data.filter(item => item.tipo === tipo)
    }

    // Paginação simples
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const start = (page - 1) * limit
    const paged = data.slice(start, start + limit)

    return HttpResponse.json({
      data: paged,
      total: data.length,
      page,
      limit,
    })
  }),

  // GET by ID
  http.get('/api/{resource}/:id', async ({ params }) => {
    await delay(200)
    const item = resourceData.find(d => d.id === params.id)
    if (!item) {
      return new HttpResponse(
        JSON.stringify({ error: 'Recurso não encontrado' }),
        { status: 404 }
      )
    }
    return HttpResponse.json(item)
  }),

  // POST create
  http.post('/api/{resource}', async ({ request }) => {
    await delay(400)
    const body = await request.json()
    const newItem = {
      ...body,
      id: crypto.randomUUID(),
      status: 'pendente',
      data: new Date().toISOString(),
    }
    return HttpResponse.json(newItem, { status: 201 })
  }),

  // PUT update
  http.put('/api/{resource}/:id', async ({ params, request }) => {
    await delay(300)
    const body = await request.json()
    const existing = resourceData.find(d => d.id === params.id)
    if (!existing) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({ ...existing, ...body })
  }),

  // DELETE
  http.delete('/api/{resource}/:id', async ({ params }) => {
    await delay(200)
    const existing = resourceData.find(d => d.id === params.id)
    if (!existing) {
      return new HttpResponse(null, { status: 404 })
    }
    // Simular regra de negócio: não pode deletar confirmada
    if (existing.status === 'confirmada') {
      return HttpResponse.json(
        { error: 'Não é possível excluir recurso confirmado' },
        { status: 422 }
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
```

### 4. API Adapter

Criar `frontend/src/infrastructure/api/adapters/{resource}Api.ts`:

```typescript
import type { Resource } from '@domain/models/Resource'

const BASE_URL = '/api/{resource}'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ResourceFilters {
  status?: string
  tipo?: string
  page?: number
  limit?: number
}

export async function fetchResources(
  filters?: ResourceFilters
): Promise<PaginatedResponse<Resource>> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.tipo) params.set('tipo', filters.tipo)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function fetchResourceById(id: string): Promise<Resource> {
  const response = await fetch(`${BASE_URL}/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function createResource(
  data: Omit<Resource, 'id' | 'status' | 'data'>
): Promise<Resource> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function deleteResource(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || `HTTP ${response.status}`)
  }
}
```

---

## Integração com Handlers Existentes

Ao adicionar novos handlers, **importar e espalhar** no array principal:

```typescript
// frontend/src/infrastructure/api/mocks/handlers.ts
import { resourceHandlers } from './resourceHandlers'

export const handlers = [
  // handlers existentes...
  ...resourceHandlers,
]
```

Ou adicionar diretamente no array `handlers` existente — escolher a abordagem que melhor se encaixa no código atual.

---

## Validação Final

Após criar todos os arquivos, executar:

```bash
cd frontend && npm run typecheck
```

Corrigir qualquer erro de tipagem antes de finalizar.

---

## Resumo de Saída

Listar todos os arquivos criados/editados:

| Arquivo | Ação | Descrição |
|---|---|---|
| `mocks/fixtures/{resource}.json` | criado | Fixture com N registros |
| `mocks/handlers.ts` | editado | Handlers MSW adicionados |
| `domain/models/{Resource}.ts` | criado | Types TypeScript |
| `api/adapters/{resource}Api.ts` | criado | Funções de API adapter |
```
