import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  roles: string[]
  setAuthenticated: (value: boolean) => void
  setRoles: (roles: string[]) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  roles: ['deep-ion-admin', 'tenant-admin', 'tenant-member'],
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setRoles: (roles) => set({ roles })
}))