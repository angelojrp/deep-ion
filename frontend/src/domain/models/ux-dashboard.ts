/* ──────────────────────────────────────────────────────────
 * UX Dashboard — Domain Models (USR-09: Analista de UX)
 * Tipos puros sem dependência de framework
 * ────────────────────────────────────────────────────────── */

/** Status de um protótipo */
export type PrototypeStatus = 'draft' | 'final' | 'approved' | 'rejected'

/** Plataforma-alvo */
export type PlatformType = 'web' | 'mobile' | 'web+mobile'

/** Severidade de alerta */
export type AlertSeverity = 'critical' | 'warning' | 'info'

/* ─── Protótipos (3.1) ─── */

export interface PrototypeSummaryData {
  totalDraft: number
  totalFinal: number
  totalApproved: number
  totalRejected: number
  pendingGateUx: number
  avgTimeInGateDays: number
  approvalFirstReviewRate: number
  throughputPerWeek: WeeklyThroughput[]
}

export interface WeeklyThroughput {
  week: string
  label: string
  approved: number
  rejected: number
}

/* ─── Questões de UX (3.2) ─── */

export interface UxQuestion {
  id: string
  prototypeId: string
  prototypeName: string
  question: string
  status: 'open' | 'resolved'
  createdAt: string
}

export interface UxQuestionsData {
  openQuestions: UxQuestion[]
  avgResolutionTimeDays: number
  recurrentPatterns: RecurrentPattern[]
}

export interface RecurrentPattern {
  pattern: string
  count: number
  percentage: number
}

/* ─── Cobertura de Telas (3.3) ─── */

export interface ScreenCoverageData {
  ucsWithPrototype: number
  ucsWithoutPrototype: number
  totalScreensGenerated: number
  totalScreensPlanned: number
  screensWithoutMobile: number
  breakpointCoverage: BreakpointCoverage[]
}

export interface BreakpointCoverage {
  prototypeId: string
  prototypeName: string
  desktop: boolean
  tablet: boolean
  mobile: boolean
}

/* ─── Consistência de Design (3.4) ─── */

export interface DesignConsistencyData {
  componentReuseRate: number
  designSystemDeviations: DesignDeviation[]
  navigationInconsistencies: number
  colorPaletteCompliant: boolean
  typographyCompliant: boolean
  iconsStandardized: boolean
}

export interface DesignDeviation {
  id: string
  prototypeId: string
  prototypeName: string
  component: string
  deviation: string
  severity: 'high' | 'medium' | 'low'
}

/* ─── Acessibilidade (3.5) ─── */

export interface AccessibilityData {
  avgWcagScore: number
  violations: AccessibilityViolation[]
  screensWithoutA11yCheck: number
  keyboardNavValidated: number
  totalScreens: number
  ariaLandmarksValidated: number
}

export interface AccessibilityViolation {
  id: string
  screenName: string
  prototypeId: string
  type: 'contrast' | 'alt-text' | 'focus' | 'aria' | 'other'
  description: string
  severity: 'critical' | 'major' | 'minor'
}

/* ─── Usabilidade (3.6) ─── */

export interface UsabilityData {
  avgHeuristicScore: number
  avgClickDepth: number
  deadEndFlows: DeadEndFlow[]
  feedbackCovered: number
  totalActions: number
  statesCoverage: StatesCoverage
}

export interface DeadEndFlow {
  id: string
  screenName: string
  prototypeId: string
  description: string
}

export interface StatesCoverage {
  withEmptyState: number
  withErrorState: number
  withLoadingState: number
  totalScreens: number
}

/* ─── Feedback Loop (3.7) ─── */

export interface FeedbackLoopData {
  avgDraftToFinalDays: number
  avgRoundTrips: number
  approvalFirstReviewRate: number
  rejectionPatterns: RejectionPattern[]
  aiQualityScore: number
}

export interface RejectionPattern {
  reason: string
  count: number
  percentage: number
}

/* ─── Design Debt (3.8) ─── */

export interface DesignDebtData {
  approvedWithCaveats: CaveatItem[]
  screensWithDebtTags: number
  backlogItems: DesignDebtBacklogItem[]
  debtIndex: number
}

export interface CaveatItem {
  id: string
  prototypeId: string
  prototypeName: string
  caveat: string
  createdAt: string
}

export interface DesignDebtBacklogItem {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  wave: string
}

/* ─── Protótipos Pendentes de Ação ─── */

export interface PendingPrototype {
  id: string
  ucId: string
  ucName: string
  status: PrototypeStatus
  cycle: number
  maxCycles: number
  platform: PlatformType
  wcagScore: number
  lastUpdatedAt: string
}

/* ─── Alertas ─── */

export interface AlertItem {
  id: string
  message: string
  severity: AlertSeverity
  category: 'gate-ux' | 'cycle' | 'a11y' | 'coverage' | 'debt'
  createdAt: string
}

/* ─── Dashboard Aggregate ─── */

export interface UxDashboardData {
  prototypeSummary: PrototypeSummaryData
  uxQuestions: UxQuestionsData
  screenCoverage: ScreenCoverageData
  designConsistency: DesignConsistencyData
  accessibility: AccessibilityData
  usability: UsabilityData
  feedbackLoop: FeedbackLoopData
  designDebt: DesignDebtData
  pendingPrototypes: PendingPrototype[]
  alerts: AlertItem[]
  updatedAt: string
}
