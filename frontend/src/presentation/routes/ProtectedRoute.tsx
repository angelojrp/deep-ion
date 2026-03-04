import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Auth guard stub — passes children through.
 * Keycloak/PKCE integration will be plugged in later.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>
}

export { ProtectedRoute }
