import type { RequestHandler } from 'msw'
import { poDashboardHandlers } from './po-dashboard.handlers'
import { baDashboardHandlers } from './ba-dashboard.handlers'
import { raDashboardHandlers } from './ra-dashboard.handlers'
import { uxDashboardHandlers } from './ux-dashboard.handlers'
import { chatbotHandlers } from './chatbot.handlers'
import { projectsHandlers } from './projects.handlers'
import { blueprintsManagementHandlers } from './blueprints-management.handlers'
import { usersHandlers } from './users.handlers'
import { agentsHandlers } from './agents.handlers'
import { pipelinesHandlers } from './pipelines.handlers'
import { projectKickoffHandlers } from './project-kickoff.handlers'
import { tenantsHandlers } from './tenants.handlers'
import { productsHandlers } from './products.handlers'

export const handlers: RequestHandler[] = [
  ...poDashboardHandlers,
  ...baDashboardHandlers,
  ...raDashboardHandlers,
  ...uxDashboardHandlers,
  ...chatbotHandlers,
  ...projectsHandlers,
  ...blueprintsManagementHandlers,
  ...usersHandlers,
  ...agentsHandlers,
  ...pipelinesHandlers,
  ...projectKickoffHandlers,
  ...tenantsHandlers,
  ...productsHandlers,
]
