import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@presentation/components/layout/AppShell'
import { ROUTES } from '@shared/constants/routes'

const DashboardPage = lazy(() =>
  import('@presentation/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const TenantsPage = lazy(() =>
  import('@presentation/pages/TenantsPage').then((m) => ({ default: m.TenantsPage })),
)
const ProjectsPage = lazy(() =>
  import('@presentation/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('@presentation/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const ProjectFormPage = lazy(() =>
  import('@presentation/pages/ProjectFormPage').then((m) => ({ default: m.ProjectFormPage })),
)
const BlueprintsPage = lazy(() =>
  import('@presentation/pages/BlueprintsPage').then((m) => ({ default: m.BlueprintsPage })),
)
const SettingsPage = lazy(() =>
  import('@presentation/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const BaDashboardPage = lazy(() =>
  import('@presentation/pages/BaDashboardPage').then((m) => ({ default: m.BaDashboardPage })),
)
const RaDashboardPage = lazy(() =>
  import('@presentation/pages/RaDashboardPage').then((m) => ({ default: m.RaDashboardPage })),
)
const UxDashboardPage = lazy(() =>
  import('@presentation/pages/UxDashboardPage').then((m) => ({ default: m.UxDashboardPage })),
)
const ChatbotPage = lazy(() =>
  import('@presentation/pages/ChatbotPage').then((m) => ({ default: m.ChatbotPage })),
)
const UsersPage = lazy(() =>
  import('@presentation/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const UserProfilePage = lazy(() =>
  import('@presentation/pages/UserProfilePage').then((m) => ({ default: m.UserProfilePage })),
)
const NotFoundPage = lazy(() =>
  import('@presentation/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function LoadingFallback() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-sm text-text-muted animate-pulse">{t('common.loading')}</p>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BA_DASHBOARD,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BaDashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.RA_DASHBOARD,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RaDashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.UX_DASHBOARD,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UxDashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.TENANTS,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TenantsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROJECTS,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROJECTS_NEW,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectFormPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROJECT_DETAIL,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROJECT_EDIT,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectFormPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BLUEPRINTS,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BlueprintsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CHATBOT,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatbotPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.USERS,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UserProfilePage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export { AppRouter }
