import type { Product, ProductListResponse } from '@domain/models/product'

const PRODUCTS_URL = '/api/products'

interface FetchProductsParams {
  page?: number
  pageSize?: number
  search?: string
  categoria?: string
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.search) query.set('search', params.search)
  if (params.categoria) query.set('categoria', params.categoria)

  const url = query.toString() ? `${PRODUCTS_URL}?${query}` : PRODUCTS_URL
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }
  return response.json()
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${PRODUCTS_URL}/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`)
  }
  return response.json()
}
