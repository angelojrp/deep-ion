/* ──────────────────────────────────────────────────────────
 * RA Dashboard — Domain Models (USR-08: Analista de Requisitos)
 * Tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

/** Status de um caso de uso */
export type UCStatus = 'draft' | 'validated' | 'implemented' | 'archived'

/** Status de uma regra de negócio */
export type RNStatus = 'active' | 'deprecated' | 'inReview'

/** Status de rastreabilidade */
export type TraceabilityStatus = 'complete' | 'partial' | 'missing'

/** Severidade de alerta */
export type AlertSeverity = 'critical' | 'warning' | 'info'

/** Categoria de alerta */
export type AlertCategory = 'uc' | 'rn' | 'conflict' | 'traceability' | 'quality' | 'impact'

/* ─── Casos de Uso (3.1) ─── */

export interface UCItem {
  id: string
  title: string
  module: string
  createdAt?: string
  modifiedAt?: string
  modifiedBy?: string
}

export interface UCByModule {
  module: string
  count: number
}

export interface UseCasesData {
  totalDraft: number
  totalValidated: number
  totalImplemented: number
  totalArchived: number
  withoutBusinessRules: UCItem[]
  withoutGherkin: UCItem[]
  recentlyModified: UCItem[]
  byModule: UCByModule[]
  avgModelingDays: number
}

/* ─── Regras de Negócio (3.2) ─── */

export interface RNItem {
  id: string
  title: string
  module: string
}

export interface RNContradiction {
  ruleA: { id: string; title: string }
  ruleB: { id: string; title: string }
  description: string
}

export interface RNByModule {
  module: string
  count: number
}

export interface BusinessRulesData {
  total: number
  active: number
  deprecated: number
  inReview: number
  withoutExceptionFlow: RNItem[]
  orphaned: RNItem[]
  contradictions: RNContradiction[]
  byModule: RNByModule[]
}

/* ─── Rastreabilidade (3.3) ─── */

export interface TraceabilityMatrixRow {
  ucId: string
  ucTitle: string
  hasRN: boolean
  hasCriteria: boolean
  hasCode: boolean
  status: TraceabilityStatus
}

export interface BrokenLink {
  sourceId: string
  sourceTitle: string
  targetId: string
  issue: string
}

export interface ModuleCoverage {
  module: string
  coverage: number
}

export interface CoverageTrendPoint {
  week: string
  coverage: number
}

export interface TraceabilityData {
  coveragePercent: number
  matrix: TraceabilityMatrixRow[]
  brokenLinks: BrokenLink[]
  byModule: ModuleCoverage[]
  coverageTrend: CoverageTrendPoint[]
}

/* ─── Qualidade de Especificação (3.4) ─── */

export interface LowScoreStory {
  id: string
  title: string
  score: number
  module: string
  issues: string[]
}

export interface VagueCriterion {
  storyId: string
  storyTitle: string
  criterion: string
  issue: string
}

export interface GherkinCoverage {
  module: string
  covered: number
  total: number
}

export interface SpecQualityData {
  avgInvestScore: number
  storiesBelowThreshold: LowScoreStory[]
  refinedPercent: number
  pendingRefinement: number
  totalStories: number
  vagueCriteria: VagueCriterion[]
  gherkinCoverageByModule: GherkinCoverage[]
}

/* ─── Auditoria DOM-05a (3.5) ─── */

export interface AuditResult {
  demandId: string
  demandName: string
  completeness: number
  consistency: number
  auditedAt: string
}

export interface FailedAuditItem {
  id: string
  name: string
  reason: string
  failedAt: string
}

export interface ComplianceTrendPoint {
  week: string
  approvalRate: number
}

export interface AuditDom05aData {
  lastAuditResult: AuditResult
  failedItems: FailedAuditItem[]
  complianceTrend: ComplianceTrendPoint[]
  gate2ApprovalRate: number
}

/* ─── Conflitos & Duplicatas (3.6) ─── */

export interface RequirementConflict {
  demandA: { id: string; title: string }
  demandB: { id: string; title: string }
  description: string
}

export interface RequirementDuplicate {
  id: string
  title: string
  duplicateOfId: string
  duplicateOfTitle: string
}

export interface ConflictsDuplicatesData {
  conflicts: RequirementConflict[]
  duplicates: RequirementDuplicate[]
}

/* ─── Impacto de Mudanças (3.7) ─── */

export interface ChangeImpactItem {
  id: string
  artifactId: string
  artifactTitle: string
  changedAt: string
  changedBy: string
  affectedRNs: number
  affectedStories: number
  affectedScreens: number
  reviewed: boolean
}

export interface ChangeImpactData {
  recentChanges: ChangeImpactItem[]
  unreviewedCount: number
}

/* ─── Dívida de Requisitos (3.8) ─── */

export interface DebtItem {
  id: string
  title: string
  daysOpen?: number
  daysIncomplete?: number
  text?: string
}

export interface RequirementsDebtData {
  toDetail: DebtItem[]
  placeholderRules: DebtItem[]
  incompleteOverXDays: DebtItem[]
  debtIndex: number
}

/* ─── Alertas ─── */

export interface AlertItem {
  id: string
  message: string
  severity: AlertSeverity
  category: AlertCategory
  createdAt: string
}

/* ─── Dashboard Aggregate ─── */

export interface RaDashboardData {
  useCases: UseCasesData
  businessRules: BusinessRulesData
  traceability: TraceabilityData
  specQuality: SpecQualityData
  auditDom05a: AuditDom05aData
  conflictsDuplicates: ConflictsDuplicatesData
  changeImpact: ChangeImpactData
  requirementsDebt: RequirementsDebtData
  alerts: AlertItem[]
  updatedAt: string
}
