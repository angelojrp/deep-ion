export interface PipelineRun {
  id: string
  issueNumber: number
  classification: 'T0' | 'T1' | 'T2' | 'T3'
  currentStage: string
  gates: string[]
  startedAt: string
}