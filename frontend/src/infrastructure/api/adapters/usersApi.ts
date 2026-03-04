import type {
  User,
  UserSummary,
  CreateUserPayload,
  UpdateProfilePayload,
  UserRole,
} from '@domain/models/user'

const USERS_URL = '/api/users'
const PROFILE_URL = '/api/profile'

export interface RoleOption {
  value: UserRole
  label: string
}

export async function fetchUsers(): Promise<UserSummary[]> {
  const response = await fetch(USERS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`)
  }
  return response.json() as Promise<UserSummary[]>
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${USERS_URL}/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`)
  }
  return response.json() as Promise<User>
}

export async function fetchAvailableRoles(): Promise<RoleOption[]> {
  const response = await fetch(`${USERS_URL}/roles`)
  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`)
  }
  return response.json() as Promise<RoleOption[]>
}

export async function createUser(payload: CreateUserPayload): Promise<User & { inviteEmailSent: boolean }> {
  const response = await fetch(USERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status}`)
  }
  return response.json() as Promise<User & { inviteEmailSent: boolean }>
}

export async function resendInvite(id: string): Promise<{ success: boolean; email: string }> {
  const response = await fetch(`${USERS_URL}/${id}/resend-invite`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to resend invite: ${response.status}`)
  }
  return response.json() as Promise<{ success: boolean; email: string }>
}

export async function fetchProfile(): Promise<User> {
  const response = await fetch(PROFILE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`)
  }
  return response.json() as Promise<User>
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await fetch(PROFILE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`)
  }
  return response.json() as Promise<User>
}

export async function uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await fetch(`${PROFILE_URL}/photo`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`Failed to upload photo: ${response.status}`)
  }
  return response.json() as Promise<{ photoUrl: string }>
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${USERS_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`)
  }
}
