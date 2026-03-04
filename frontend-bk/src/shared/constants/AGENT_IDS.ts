export interface AgentDefinition {
  id: string
  label: string
  description: string
}

export const AGENT_IDS: AgentDefinition[] = [
  { id: '01', label: 'DOM-01', description: 'Discovery' },
  { id: '02', label: 'DOM-02', description: 'Requirements' },
  { id: '03', label: 'DOM-03', description: 'Architecture' },
  { id: '04', label: 'DOM-04', description: 'Development' },
  { id: '05a', label: 'DOM-05a', description: 'Business QA' },
  { id: '05b', label: 'DOM-05b', description: 'Technical QA' }
]