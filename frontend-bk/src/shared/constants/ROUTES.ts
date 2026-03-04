export const ROUTES = {
  home: '/',
  login: '/login',
  admin: '/admin',
  tenantHome: '/:tenant/',
  tenantAdmin: '/:tenant/admin',
  agentDashboard: '/:tenant/dom-:agentId'
} as const

export const toTenantRoute = (slug: string): string => `/${slug}/`
export const toTenantAdminRoute = (slug: string): string => `/${slug}/admin`
export const toAgentRoute = (slug: string, agentId: string): string => `/${slug}/dom-${agentId}`