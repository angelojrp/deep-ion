import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProjects,
  fetchProject,
  fetchTenantMembers,
  fetchTenantConfig,
  fetchBlueprints,
  createProject,
  updateProject,
  deleteProject,
} from '@infrastructure/api/adapters/projectsApi'
import type { TenantGlobalConfig } from '@infrastructure/api/adapters/projectsApi'
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  Project,
  ProjectSummary,
  TenantMember,
  BlueprintInfo,
} from '@domain/models/project'

const PROJECTS_QUERY_KEY = ['projects'] as const
const TENANT_MEMBERS_QUERY_KEY = ['tenant-members'] as const
const TENANT_CONFIG_QUERY_KEY = ['tenant-config'] as const
const BLUEPRINTS_QUERY_KEY = ['blueprints'] as const

export function useProjects() {
  return useQuery<ProjectSummary[]>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: fetchProjects,
    staleTime: 30_000,
  })
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useTenantMembers() {
  return useQuery<TenantMember[]>({
    queryKey: TENANT_MEMBERS_QUERY_KEY,
    queryFn: fetchTenantMembers,
    staleTime: 300_000,
  })
}

export function useTenantConfig() {
  return useQuery<TenantGlobalConfig>({
    queryKey: TENANT_CONFIG_QUERY_KEY,
    queryFn: fetchTenantConfig,
    staleTime: 300_000,
  })
}

export function useBlueprints() {
  return useQuery<BlueprintInfo[]>({
    queryKey: BLUEPRINTS_QUERY_KEY,
    queryFn: fetchBlueprints,
    staleTime: 300_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, variables.id] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}
