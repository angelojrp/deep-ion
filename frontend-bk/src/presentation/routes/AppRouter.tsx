import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@presentation/components/layout/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { TenantRoute } from './TenantRoute'

const LandingPage = lazy(async () => import('@presentation/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginCallbackPage = lazy(async () =>
  import('@presentation/pages/LoginCallbackPage').then((m) => ({ default: m.LoginCallbackPage }))
)
const GlobalAdminPage = lazy(async () =>
  import('@presentation/pages/GlobalAdminPage').then((m) => ({ default: m.GlobalAdminPage }))
)
const TenantHomePage = lazy(async () => import('@presentation/pages/TenantHomePage').then((m) => ({ default: m.TenantHomePage })))
const TenantAdminPage = lazy(async () =>
  import('@presentation/pages/TenantAdminPage').then((m) => ({ default: m.TenantAdminPage }))
)
const AgentDashboardPage = lazy(async () =>
  import('@presentation/pages/AgentDashboardPage').then((m) => ({ default: m.AgentDashboardPage }))
)
const NotFoundPage = lazy(async () => import('@presentation/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export const AppRouter = (): JSX.Element => {
  return (
    <Suspense fallback={<div className="p-4">Carregando...</div>}>
      <AppShell>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route element={<LoginCallbackPage />} path="/login" />

          <Route
            element={
              <ProtectedRoute>
                <RoleGuard requiredRole="deep-ion-admin">
                  <GlobalAdminPage />
                </RoleGuard>
              </ProtectedRoute>
            }
            path="/admin"
          />

          <Route
            element={
              <ProtectedRoute>
                <TenantRoute />
              </ProtectedRoute>
            }
            path="/:tenant"
          >
            <Route element={<TenantHomePage />} index />
            <Route
              element={
                <RoleGuard requiredRole="tenant-admin">
                  <TenantAdminPage />
                </RoleGuard>
              }
              path="admin"
            />
            <Route element={<AgentDashboardPage />} path="dom-:agentId" />
          </Route>

          <Route element={<Navigate to="/" replace />} path="*" />
          <Route element={<NotFoundPage />} path="/not-found" />
        </Routes>
      </AppShell>
    </Suspense>
  )
}