import { useQuery } from '@tanstack/react-query'

export const useRepositories = (tenant: string) =>
  useQuery({
    queryKey: ['repositories', tenant],
    queryFn: () =>
      Promise.resolve([
        { id: 'r-1', owner: 'angelo', name: 'deep-ion', installationId: 1, defaultBranch: 'main', webhookStatus: 'active' }
      ])
  })