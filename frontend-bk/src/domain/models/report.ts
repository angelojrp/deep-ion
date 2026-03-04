export interface Report {
  id: string
  type: string
  period: string
  data: Record<string, unknown>
  generatedAt: string
}