export interface LlmModel {
  id: string
  provider: 'openai' | 'anthropic' | 'copilot' | 'local'
  name: string
  tier: string
  costPerToken: number
  enabled: boolean
}