import { useQuery } from '@tanstack/react-query'
import { skillLogAdapter } from '@infrastructure/api/adapters/skillLogAdapter'

export const useSkillLogs = (tenant: string, agentId: string) =>
  useQuery({
    queryKey: ['skill-logs', tenant, agentId],
    queryFn: () => skillLogAdapter.listByAgent(tenant, agentId)
  })