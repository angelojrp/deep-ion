import { useQuery } from '@tanstack/react-query'
import { agentAdapter } from '@infrastructure/api/adapters/agentAdapter'

export const useAgentStatus = (tenant: string) =>
  useQuery({
    queryKey: ['agents', tenant],
    queryFn: () => agentAdapter.listByTenant(tenant)
  })