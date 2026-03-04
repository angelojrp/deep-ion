import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useUxDashboard } from '@application/hooks/useUxDashboard'
import {
  AlertBar,
  PrototypeSummary,
  GateUxPanel,
  ScreenCoverage,
  DesignConsistency,
  AccessibilityPanel,
  UsabilityPanel,
  FeedbackLoopPanel,
  DesignDebtPanel,
  PendingPrototypesTable,
  QuickActions,
} from '@presentation/components/ux-dashboard'
import { StatCard } from '@presentation/components/dashboard'
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Accessibility,
  LayoutGrid,
  RefreshCw,
  Filter,
} from 'lucide-react'

type FilterProject = string | 'all'
type FilterStatus = string | 'all'
type FilterPlatform = string | 'all'
type FilterA11y = string | 'all'

function UxDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useUxDashboard()

  const [_filterProject, setFilterProject] = useState<FilterProject>('all')
  const [_filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [_filterPlatform, setFilterPlatform] = useState<FilterPlatform>('all')
  const [_filterA11y, setFilterA11y] = useState<FilterA11y>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <Header
        title={t('uxDashboard.pageTitle')}
        subtitle={t('uxDashboard.pageSubtitle')}
      />
      <PageContainer>
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-text-muted">{t('common.loading')}</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-[var(--radius-lg)] border border-error-border bg-error-light p-8 text-center">
            <p className="text-sm text-error">{t('common.error')}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              type="button"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Alert bar — notifications acionáveis */}
            <AlertBar alerts={data.alerts} />

            {/* Filters row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors"
                aria-expanded={filtersOpen}
                aria-label={t('uxDashboard.filters.toggle')}
              >
                <Filter size={14} aria-hidden="true" />
                {t('uxDashboard.filters.title')}
              </button>
              <span className="text-[10px] text-text-muted">
                {t('uxDashboard.lastUpdated')}: {new Date(data.updatedAt).toLocaleString('pt-BR')}
              </span>
            </div>

            {filtersOpen && (
              <div className="flex flex-wrap gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterProject(e.target.value)}
                  aria-label={t('uxDashboard.filters.project')}
                >
                  <option value="all">{t('uxDashboard.filters.allProjects')}</option>
                  <option value="motor-credito">Motor de Crédito v2</option>
                  <option value="antifraude">Antifraude Transacional</option>
                  <option value="onboarding">Portal de Onboarding PJ</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label={t('uxDashboard.filters.status')}
                >
                  <option value="all">{t('uxDashboard.filters.allStatuses')}</option>
                  <option value="draft">{t('uxDashboard.prototypes.status.draft')}</option>
                  <option value="final">{t('uxDashboard.prototypes.status.final')}</option>
                  <option value="approved">{t('uxDashboard.prototypes.status.approved')}</option>
                  <option value="rejected">{t('uxDashboard.prototypes.status.rejected')}</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  aria-label={t('uxDashboard.filters.platform')}
                >
                  <option value="all">{t('uxDashboard.filters.allPlatforms')}</option>
                  <option value="web">WEB</option>
                  <option value="mobile">Mobile</option>
                  <option value="web+mobile">WEB + Mobile</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterA11y(e.target.value)}
                  aria-label={t('uxDashboard.filters.accessibility')}
                >
                  <option value="all">{t('uxDashboard.filters.allA11y')}</option>
                  <option value="above">{t('uxDashboard.filters.aboveThreshold')}</option>
                  <option value="below">{t('uxDashboard.filters.belowThreshold')}</option>
                </select>
              </div>
            )}

            {/* Top-level KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                label={t('uxDashboard.kpi.totalPrototypes')}
                value={data.prototypeSummary.totalDraft + data.prototypeSummary.totalFinal + data.prototypeSummary.totalApproved + data.prototypeSummary.totalRejected}
                icon={<Layers size={16} />}
              />
              <StatCard
                label={t('uxDashboard.kpi.pendingGateUx')}
                value={data.prototypeSummary.pendingGateUx}
                icon={<ShieldCheck size={16} />}
                variant={data.prototypeSummary.pendingGateUx > 0 ? 'error' : 'success'}
              />
              <StatCard
                label={t('uxDashboard.kpi.ucCoverage')}
                value={`${Math.round((data.screenCoverage.ucsWithPrototype / (data.screenCoverage.ucsWithPrototype + data.screenCoverage.ucsWithoutPrototype)) * 100)}%`}
                icon={<LayoutGrid size={16} />}
              />
              <StatCard
                label={t('uxDashboard.kpi.wcagScore')}
                value={`${data.accessibility.avgWcagScore}%`}
                icon={<Accessibility size={16} />}
                variant={data.accessibility.avgWcagScore >= 90 ? 'success' : data.accessibility.avgWcagScore >= 70 ? 'warning' : 'error'}
              />
              <StatCard
                label={t('uxDashboard.kpi.a11yViolations')}
                value={data.accessibility.violations.length}
                icon={<AlertTriangle size={16} />}
                variant={data.accessibility.violations.length > 0 ? 'error' : 'success'}
              />
              <StatCard
                label={t('uxDashboard.kpi.firstApprovalRate')}
                value={`${(data.feedbackLoop.approvalFirstReviewRate * 100).toFixed(0)}%`}
                icon={<RefreshCw size={16} />}
                variant={data.feedbackLoop.approvalFirstReviewRate >= 0.7 ? 'success' : 'warning'}
              />
            </div>

            {/* Quick actions */}
            <QuickActions />

            {/* Main grid: 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                <PrototypeSummary data={data.prototypeSummary} />
                <GateUxPanel prototypeSummary={data.prototypeSummary} uxQuestions={data.uxQuestions} />
                <AccessibilityPanel data={data.accessibility} />
                <DesignDebtPanel data={data.designDebt} />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <ScreenCoverage data={data.screenCoverage} />
                <DesignConsistency data={data.designConsistency} />
                <UsabilityPanel data={data.usability} />
                <FeedbackLoopPanel data={data.feedbackLoop} />
              </div>
            </div>

            {/* Full width: Pending Prototypes Table */}
            <PendingPrototypesTable prototypes={data.pendingPrototypes} />
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { UxDashboardPage }
