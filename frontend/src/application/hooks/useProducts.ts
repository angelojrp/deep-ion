import { useQuery } from '@tanstack/react-query'
import { fetchProducts, fetchProduct } from '@infrastructure/api/adapters/productsApi'
import type { Product, ProductListResponse } from '@domain/models/product'

const PRODUCTS_KEY = ['products'] as const

interface UseProductsParams {
  page?: number
  pageSize?: number
  search?: string
  categoria?: string
}

export function useProducts(params: UseProductsParams = {}) {
  return useQuery<ProductListResponse>({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => fetchProducts(params),
  })
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  })
}
