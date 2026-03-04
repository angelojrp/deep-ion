import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUsers,
  fetchUser,
  fetchAvailableRoles,
  createUser,
  resendInvite,
  deleteUser,
  fetchProfile,
  updateProfile,
  uploadProfilePhoto,
} from '@infrastructure/api/adapters/usersApi'
import type { RoleOption } from '@infrastructure/api/adapters/usersApi'
import type {
  User,
  UserSummary,
  CreateUserPayload,
  UpdateProfilePayload,
} from '@domain/models/user'

const USERS_QUERY_KEY = ['users'] as const
const ROLES_QUERY_KEY = ['available-roles'] as const
const PROFILE_QUERY_KEY = ['profile'] as const

export function useUsers() {
  return useQuery<UserSummary[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
    staleTime: 30_000,
  })
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useAvailableRoles() {
  return useQuery<RoleOption[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: fetchAvailableRoles,
    staleTime: 300_000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => resendInvite(id),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useProfile() {
  return useQuery<User>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
  })
}
