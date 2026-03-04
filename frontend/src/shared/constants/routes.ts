export const ROUTES = {
  DASHBOARD: '/',
  BA_DASHBOARD: '/ba-dashboard',
  RA_DASHBOARD: '/ra-dashboard',
  UX_DASHBOARD: '/ux-dashboard',
  TENANTS: '/tenants',
  TENANTS_NEW: '/tenants/new',
  TENANT_DETAIL: '/tenants/:id',
  PROJECTS: '/projects',
  PROJECTS_NEW: '/projects/new',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_EDIT: '/projects/:id/edit',
  BLUEPRINTS: '/blueprints',
  USERS: '/users',
  PROFILE: '/profile',
  CHATBOT: '/chatbot',
  SETTINGS: '/settings',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
