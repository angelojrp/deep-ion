import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@application/hooks/useAuth'

interface RoleGuardProps extends PropsWithChildren {
  requiredRole: string
}

export const RoleGuard = ({ requiredRole, children }: RoleGuardProps): JSX.Element => {
  const { roles } = useAuth()

  if (!roles.includes(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}