import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchBlueprintsManagement,
  createBlueprint,
  updateBlueprint,
  cloneBlueprint,
} from '@infrastructure/api/adapters/blueprintsApi'
import type {
  Blueprint,
  CreateBlueprintPayload,
  UpdateBlueprintPayload,
} from '@domain/models/blueprint'

const BLUEPRINTS_MANAGEMENT_QUERY_KEY = ['blueprints-management'] as const

export function useBlueprintsManagement() {
  return useQuery<Blueprint[]>({
    queryKey: BLUEPRINTS_MANAGEMENT_QUERY_KEY,
    queryFn: fetchBlueprintsManagement,
    staleTime: 30_000,
  })
}

export function useCreateBlueprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBlueprintPayload) => createBlueprint(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLUEPRINTS_MANAGEMENT_QUERY_KEY })
    },
  })
}

export function useUpdateBlueprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlueprintPayload }) =>
      updateBlueprint(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLUEPRINTS_MANAGEMENT_QUERY_KEY })
    },
  })
}

export function useCloneBlueprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cloneBlueprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLUEPRINTS_MANAGEMENT_QUERY_KEY })
    },
  })
}
