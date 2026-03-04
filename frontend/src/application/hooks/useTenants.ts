import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTenants,
  fetchTenant,
  createTenant,
  updateTenant,
  deactivateTenant,
  reactivateTenant,
  checkSlugAvailability,
} from '@infrastructure/api/adapters/tenantsApi'
import type {
  Tenant,
  TenantListResponse,
  CreateTenantPayload,
  UpdateTenantPayload,
} from '@domain/models/tenant'

const TENANTS_QUERY_KEY = ['tenants'] as const

interface UseTenantsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export function useTenants(params: UseTenantsParams = {}) {
  return useQuery<TenantListResponse>({
    queryKey: [...TENANTS_QUERY_KEY, params],
    queryFn: () => fetchTenants(params),
    staleTime: 30_000,
  })
}

export function useTenant(id: string) {
  return useQuery<Tenant>({
    queryKey: [...TENANTS_QUERY_KEY, id],
    queryFn: () => fetchTenant(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => createTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTenantPayload }) =>
      updateTenant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY })
    },
  })
}

export function useDeactivateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY })
    },
  })
}

export function useReactivateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivateTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY })
    },
  })
}

export function useCheckSlug(slug: string) {
  return useQuery({
    queryKey: ['check-slug', slug],
    queryFn: () => checkSlugAvailability(slug),
    enabled: slug.length >= 2,
    staleTime: 10_000,
  })
}
