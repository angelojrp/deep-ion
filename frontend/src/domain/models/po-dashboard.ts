/* ──────────────────────────────────────────────────────────
 * PO Dashboard — Domain Models
 * Tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

/** Tier de autonomia da demanda */
export type DemandTier = 'T0' | 'T1' | 'T2' | 'T3'

/** Gate/estágio no pipeline */
export type PipelineStage =
  | 'discovery'
  | 'analysis'
  | 'development'
  | 'gate-1'
  | 'gate-2'
  | 'gate-3'
  | 'gate-4'
  | 'done'

/** Status de uma demand */
export type DemandStatus = 'active' | 'blocked' | 'escalated' | 'done'

/** MoSCoW priority */
export type MoSCoWPriority = 'must' | 'should' | 'could' | 'wont'

/** Severidade de risco */
export type RiskSeverity = 'high' | 'medium' | 'low'

/** Status de risco */
export type RiskStatus = 'active' | 'mitigated' | 'monitoring'

/** Status de dependência externa */
export type DependencyStatus = 'healthy' | 'degraded' | 'blocked'

/* ─── Pipeline ─── */

export interface PipelineDemand {
  id: string
  title: string
  tier: DemandTier
  stage: PipelineStage
  status: DemandStatus
  ageDays: number
  reworkCount: number
  moscowPriority: MoSCoWPriority
  lgpdFlag: boolean
  createdAt: string
  assignee: string
}

export interface PipelineStageCount {
  stage: PipelineStage
  count: number
  blockedCount: number
}

/* ─── Delivery Metrics ─── */

export interface CycleTimeByTier {
  tier: DemandTier
  avgDays: number
  p50Days: number
  p85Days: number
  targetDays: number
}

export interface WeeklyThroughput {
  week: string
  completed: number
  started: number
}

export interface DeliveryMetrics {
  cycleTimeByTier: CycleTimeByTier[]
  leadTimeDays: number
  flowEfficiency: number
  throughputWeekly: WeeklyThroughput[]
  predictability: number
}

/* ─── Backlog Health ─── */

export interface TierDistribution {
  tier: DemandTier
  count: number
  wip: number
}

export interface MoSCoWDistribution {
  priority: MoSCoWPriority
  count: number
  delivered: number
}

export interface StageAgeAverage {
  stage: PipelineStage
  avgDays: number
}

export interface BacklogHealth {
  tierDistribution: TierDistribution[]
  moscowDistribution: MoSCoWDistribution[]
  stageAgeAverage: StageAgeAverage[]
  totalActive: number
  totalBlocked: number
}

/* ─── Business Quality ─── */

export interface BusinessQuality {
  briefGatePassRate: number
  avgConfidenceScore: number
  gherkinCompleteness: number
  openQuestionsCount: number
  traceabilityCoverage: number
  reworkRate: number
}

/* ─── Compliance & Risks ─── */

export interface BusinessRisk {
  id: string
  name: string
  severity: RiskSeverity
  status: RiskStatus
  probability: number
  description: string
}

export interface ExternalDependency {
  name: string
  status: DependencyStatus
  lastCheckedAt: string
}

export interface ComplianceRisks {
  activeLgpdFlags: number
  auditedDecisionRecordsPercent: number
  undetectedRnViolations: number
  t3PendingGateOver48h: number
  archConformanceViolationsPercent: number
  businessRisks: BusinessRisk[]
  externalDependencies: ExternalDependency[]
}

/* ─── Roadmap ─── */

export interface Milestone {
  id: string
  name: string
  targetDate: string
  mustTotal: number
  mustCompleted: number
  overallProgress: number
}

export interface RoadmapStatus {
  milestones: Milestone[]
  remainingCapacityWeeks: number
  weeklyThroughputAvg: number
  businessDebtCount: number
}

/* ─── Dashboard Aggregate ─── */

export interface PoDashboardData {
  pipeline: {
    demands: PipelineDemand[]
    stageCounts: PipelineStageCount[]
  }
  delivery: DeliveryMetrics
  backlog: BacklogHealth
  quality: BusinessQuality
  compliance: ComplianceRisks
  roadmap: RoadmapStatus
  updatedAt: string
}
