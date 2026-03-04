export interface ApiKeyConfig {
  id: string
  service: 'github' | 'openai' | 'anthropic' | 'copilot'
  maskedKey: string
  lastRotated: string
}