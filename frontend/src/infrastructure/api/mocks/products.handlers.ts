import { http, HttpResponse } from 'msw'
import data from './fixtures/products.json'
import type { Product } from '@domain/models/product'

const products: Product[] = [...data] as Product[]

export const productsHandlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '12')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const categoria = url.searchParams.get('categoria') ?? ''

    let filtered = [...products]

    if (categoria) {
      filtered = filtered.filter((p) => p.categoria === categoria)
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(search) ||
          p.marca.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search)),
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize).map((p) => ({
      id: p.id,
      nome: p.nome,
      slug: p.slug,
      descricaoCurta: p.descricaoCurta,
      preco: p.preco,
      precoPromocional: p.precoPromocional,
      categoria: p.categoria,
      marca: p.marca,
      statusEstoque: p.statusEstoque,
      avaliacaoMedia: p.avaliacaoMedia,
      totalAvaliacoes: p.totalAvaliacoes,
      fotoPrincipal: p.fotos.find((f) => f.principal)?.url ?? p.fotos[0]?.url ?? '',
    }))

    return HttpResponse.json({ items, total, page, pageSize, totalPages })
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = products.find((p) => p.id === params.id)
    return product
      ? HttpResponse.json(product)
      : new HttpResponse(null, { status: 404 })
  }),
]
