import { useQuery } from '@tanstack/react-query'

export const useLlmModels = (tenant: string) =>
  useQuery({
    queryKey: ['llm-models', tenant],
    queryFn: () =>
      Promise.resolve([{ id: 'm-1', provider: 'copilot', name: 'gpt-5.3-codex', tier: 'pro', costPerToken: 0.0, enabled: true }])
  })