import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@application/hooks/useAuth'

export const ProtectedRoute = ({ children }: PropsWithChildren): JSX.Element => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }

  return <>{children}</>
}