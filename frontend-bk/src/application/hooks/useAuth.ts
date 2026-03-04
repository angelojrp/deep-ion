import { useAuthStore } from '@application/stores/authStore'

export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const roles = useAuthStore((state) => state.roles)

  return {
    isAuthenticated,
    roles
  }
}