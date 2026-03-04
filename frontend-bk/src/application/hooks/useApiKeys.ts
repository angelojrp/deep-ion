import { useQuery } from '@tanstack/react-query'

export const useApiKeys = (tenant: string) =>
  useQuery({
    queryKey: ['api-keys', tenant],
    queryFn: () => Promise.resolve([{ id: 'k-1', service: 'github', maskedKey: 'ghp_****1234', lastRotated: '2026-03-01' }])
  })