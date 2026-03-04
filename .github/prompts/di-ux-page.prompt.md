```prompt
---
agent: ux-engineer
description: "Criar página React completa com mock de API (MSW + JSON fixture), hook TanStack Query, 4 estados (loading/empty/data/error) e testes"
name: "di-ux-page"
argument-hint: "Nome da página e descrição funcional (ex: 'TransactionsPage — listagem de transações com filtro por status e período')"
---

Assuma o papel de **UX Engineer Frontend**.

> Objetivo: criar uma página React completa, do mock de API ao componente de página, com todos os estados e testes.

---

## Pré-condição

Antes de criar a página:
1. Ler `architecture/blueprints/frontend-react-spa.yaml` para confirmar convenções
2. Verificar páginas existentes em `frontend/src/presentation/pages/` para manter padrão
3. Verificar mocks existentes em `frontend/src/infrastructure/api/mocks/` para reusar ou estender
4. Verificar componentes ui existentes em `frontend/src/presentation/components/ui/`
5. Verificar hooks existentes em `frontend/src/application/hooks/`

---

## Fluxo Obrigatório (Mock-First)

Executar na seguinte ordem — não pular etapas:

### Etapa 1 — Fixture JSON (dados mock)

Criar arquivo JSON em `frontend/src/infrastructure/api/mocks/fixtures/{resource}.json`:
- Dados realistas de fintech (BRL, nomes brasileiros, CPF mascarado)
- Mínimo 5 registros com variação de estados
- Incluir dados para cenário de lista vazia (gerenciado pelo handler)

```json
[
  {
    "id": "uuid-1",
    "descricao": "Transferência PIX",
    "valor": 1500.00,
    "status": "confirmada",
    "data": "2026-01-15T10:30:00Z",
    "categoria": "transferencia"
  }
]
```

### Etapa 2 — Handler MSW

Adicionar handlers em `frontend/src/infrastructure/api/mocks/handlers.ts`:
- GET list (com suporte a query params para filtros)
- GET by id
- POST create (se aplicável)
- PUT/PATCH update (se aplicável)
- DELETE (se aplicável)

```typescript
import { http, HttpResponse } from 'msw'
import data from './fixtures/{resource}.json'

// Adicionar ao array handlers[]
http.get('/api/{resource}', ({ request }) => {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const filtered = status ? data.filter(d => d.status === status) : data
  return HttpResponse.json(filtered)
}),
```

### Etapa 3 — Types / Models

Criar ou atualizar tipo em `frontend/src/domain/models/{Resource}.ts`:
- Interface TypeScript para a entidade
- Enum ou union type para status

```typescript
export interface Transaction {
  id: string
  descricao: string
  valor: number
  status: TransactionStatus
  data: string
  categoria: string
}

export type TransactionStatus = 'confirmada' | 'pendente' | 'cancelada'
```

### Etapa 4 — API Adapter

Criar adapter em `frontend/src/infrastructure/api/adapters/{resource}Api.ts`:
- Funções que fazem fetch para os endpoints
- Tipagem de retorno

```typescript
import type { Transaction } from '@domain/models/Transaction'

const API_BASE = '/api/transactions'

export async function fetchTransactions(status?: string): Promise<Transaction[]> {
  const url = status ? `${API_BASE}?status=${status}` : API_BASE
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
```

### Etapa 5 — Hook (TanStack Query)

Criar hook em `frontend/src/application/hooks/use{Resource}.ts`:
- `useQuery` para fetch de dados
- Retornar estados: `data`, `isLoading`, `isError`, `error`, `refetch`

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '@infrastructure/api/adapters/transactionsApi'

export function useTransactions(status?: string) {
  return useQuery({
    queryKey: ['transactions', { status }],
    queryFn: () => fetchTransactions(status),
  })
}
```

### Etapa 6 — Página com 4 estados

Criar página em `frontend/src/presentation/pages/{PageName}.tsx`:

**Estados obrigatórios:**

| Estado | Quando | O que mostrar |
|---|---|---|
| **loading** | `isLoading === true` | Skeleton/shimmer placeholders |
| **error** | `isError === true` | Mensagem de erro + botão retry |
| **empty** | `data.length === 0` | Empty state amigável + CTA |
| **data** | `data.length > 0` | Lista/grid com dados populados |

```tsx
import { useTranslation } from 'react-i18next'
import { useTransactions } from '@application/hooks/useTransactions'

function TransactionsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useTransactions()

  if (isLoading) return <TransactionsSkeletons />
  if (isError) return <ErrorState onRetry={refetch} message={t('transactions.error')} />
  if (!data?.length) return <EmptyState message={t('transactions.empty')} />

  return (
    <main aria-label={t('transactions.pageLabel')}>
      {/* lista de dados */}
    </main>
  )
}

export { TransactionsPage }
```

### Etapa 7 — Rotas

Adicionar rota lazy em `frontend/src/presentation/routes/`:

```typescript
const TransactionsPage = lazy(() =>
  import('@presentation/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage }))
)
```

> **Nota:** `React.lazy` exige default export no dynamic import. Usar `.then(m => ({ default: m.NamedExport }))` para manter named exports.

### Etapa 8 — i18n

Adicionar chaves de tradução em `frontend/src/shared/i18n/`:
- pt-BR (obrigatório, idioma padrão)
- en (se estrutura já existir)

### Etapa 9 — Testes

Criar testes em `frontend/src/presentation/pages/{PageName}.test.tsx`:
- Testar os 4 estados: loading, error, empty, data
- Mock do hook com `vi.mock()`
- Verificar acessibilidade (aria-labels, roles)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@application/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}))

describe('TransactionsPage', () => {
  it('shows loading skeletons', () => { /* ... */ })
  it('shows error state with retry', () => { /* ... */ })
  it('shows empty state', () => { /* ... */ })
  it('shows data list', () => { /* ... */ })
})
```

---

## Validação Final

Após criar todos os arquivos, executar:

```bash
cd frontend && npm run typecheck && npm run test -- --reporter=verbose
```

Corrigir qualquer erro antes de finalizar.

---

## Resumo de Saída

Ao finalizar, listar todos os arquivos criados/editados:

| Arquivo | Ação | Descrição |
|---|---|---|
| `mocks/fixtures/{resource}.json` | criado | Fixture JSON com dados mock |
| `mocks/handlers.ts` | editado | Novos handlers MSW |
| `domain/models/{Resource}.ts` | criado | Interface TypeScript |
| `api/adapters/{resource}Api.ts` | criado | API adapter |
| `hooks/use{Resource}.ts` | criado | Hook TanStack Query |
| `pages/{PageName}.tsx` | criado | Página com 4 estados |
| `i18n/{locale}.json` | editado | Chaves de tradução |
| `pages/{PageName}.test.tsx` | criado | Testes da página |
```
