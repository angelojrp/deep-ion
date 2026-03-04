export interface AuthUser {
  id: string
  name: string
  roles: string[]
}

export const authProvider = {
  login: async (): Promise<void> => Promise.resolve(),
  logout: async (): Promise<void> => Promise.resolve(),
  getCurrentUser: async (): Promise<AuthUser | null> =>
    Promise.resolve({ id: 'u-1', name: 'Demo User', roles: ['deep-ion-admin', 'tenant-admin', 'tenant-member'] })
}