export interface Agent {
  id: string
  domId: string
  status: 'running' | 'idle' | 'error'
  lastRun: string
  currentIssue: number | null
}