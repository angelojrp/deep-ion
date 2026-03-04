export interface BudgetConfig {
  tenantId: string
  monthlyLimitUsd: number
  usedUsd: number
  alertThreshold: number
}