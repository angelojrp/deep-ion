export interface DecisionRecord {
  id: string
  agentId: string
  decision: 'approve' | 'block' | 'escalar'
  confidenceScore: number
  justification: string
  createdAt: string
}