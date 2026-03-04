export const queryKeys = {
  tenants: ['tenants'] as const,
  tenant: (slug: string) => ['tenant', slug] as const,
  pendingGates: (tenant: string) => ['pending-gates', tenant] as const,
  agents: (tenant: string) => ['agents', tenant] as const,
  decisionRecords: (tenant: string) => ['decision-records', tenant] as const,
  pipelineRuns: (tenant: string) => ['pipeline-runs', tenant] as const
}