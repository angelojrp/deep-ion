/* ──────────────────────────────────────────────────────────
 * BA Dashboard — Domain Models (USR-07: Analista de Negócios)
 * Tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

/** Status de um brief */
export type BriefStatus = 'draft' | 'final' | 'refining'

/** Status de documento de visão */
export type VisionStatus = 'draft' | 'final'

/** Tier de impacto da demanda */
export type ImpactTier = 'T0' | 'T1' | 'T2' | 'T3'

/** Fases do pipeline de descoberta */
export type DiscoveryPhase = 'DOM-01' | 'DOM-02' | 'Gate-2'

/* ─── Briefs & Visão (3.1) ─── */

export interface BriefItem {
  id: string
  projectName: string
  title: string
  status: BriefStatus
  refinementCycles: number
  maxRefinementCycles: number
  openQuestions: string[]
  daysInDraft: number
  completenessScore: number
  gate2Rejected: boolean
  createdAt: string
}

export interface VisionDocument {
  id: string
  projectName: string
  status: VisionStatus
  openQuestions: string[]
}

export interface BriefsVisionData {
  totalDraft: number
  totalFinal: number
  totalRefining: number
  avgRefinementCycles: number
  avgDaysInDraft: number
  briefsWithOpenQuestions: BriefItem[]
  pendingVisionDocs: VisionDocument[]
}

/* ─── Pipeline de Descoberta (3.2) ─── */

export interface PhaseTime {
  phase: DiscoveryPhase
  avgDays: number
}

export interface WeeklyDiscoveryThroughput {
  week: string
  label: string
  entered: number
  exited: number
}

export interface DiscoveryPipelineData {
  demandsInDom01: number
  demandsInDom02: number
  demandsInGate2: number
  stuckDemands: number
  stuckDemandsList: Array<{ id: string; title: string; phase: DiscoveryPhase; daysStuck: number }>
  avgTimeByPhase: PhaseTime[]
  weeklyThroughput: WeeklyDiscoveryThroughput[]
}

/* ─── Qualidade de Artefatos (3.3) ─── */

export interface AuditResult {
  demandId: string
  demandName: string
  completeness: number
  consistency: number
  auditedAt: string
}

export interface RejectedBrief {
  id: string
  name: string
  rejectedAt: string
  reason: string
}

export interface ArtifactQualityData {
  avgCompleteness: number
  gate2RejectedCount: number
  gate2RejectedBriefs: RejectedBrief[]
  reworkRate: number
  lastAuditResults: AuditResult[]
}

/* ─── Classificação de Impacto T0–T3 (3.4) ─── */

export interface TierDistributionItem {
  tier: ImpactTier
  count: number
  percentage: number
}

export interface TierTrend {
  month: string
  T0: number
  T1: number
  T2: number
  T3: number
}

export interface ActiveT3Demand {
  id: string
  title: string
  daysActive: number
  assignee: string
}

export interface ImpactClassificationData {
  distribution: TierDistributionItem[]
  trend: TierTrend[]
  activeT3Demands: ActiveT3Demand[]
}

/* ─── Escaladas & Confidence Score (3.5) ─── */

export interface LowConfidenceDemand {
  id: string
  title: string
  confidenceScore: number
  escalatedAt: string
  project: string
}

export interface EscalationsByProject {
  project: string
  escalations: number
}

export interface EscalationsData {
  lowConfidenceDemands: LowConfidenceDemand[]
  avgResolutionTimeDays: number
  resolvedCount: number
  pendingCount: number
  historyByProject: EscalationsByProject[]
}

/* ─── Backlog Health (3.7) ─── */

export interface StaleDemand {
  id: string
  title: string
  ageDays: number
  lastMovedAt: string
}

export interface DetectedDuplicate {
  id: string
  title: string
  duplicateOfId: string
  duplicateOfTitle: string
}

export interface InactiveStakeholder {
  name: string
  role: string
  lastActivityDays: number
}

export interface BacklogHealthBaData {
  avgAgeDays: number
  staleDemandsCount: number
  staleDemands: StaleDemand[]
  duplicatesDetected: DetectedDuplicate[]
  inactiveStakeholders: InactiveStakeholder[]
}

/* ─── Alertas (Seção 6) ─── */

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface AlertItem {
  id: string
  message: string
  severity: AlertSeverity
  category: 'brief' | 'pipeline' | 'escalation' | 'gate'
  createdAt: string
}

/* ─── Dashboard Aggregate ─── */

export interface BaDashboardData {
  briefsVision: BriefsVisionData
  discoveryPipeline: DiscoveryPipelineData
  artifactQuality: ArtifactQualityData
  impactClassification: ImpactClassificationData
  escalations: EscalationsData
  backlogHealth: BacklogHealthBaData
  alerts: AlertItem[]
  updatedAt: string
}
