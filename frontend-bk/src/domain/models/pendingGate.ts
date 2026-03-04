export interface PendingGate {
  id: string
  gateNumber: number
  issueNumber: number
  prNumber: number | null
  agentId: string
  summary: string
  classification: 'T0' | 'T1' | 'T2' | 'T3'
  createdAt: string
}