import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useRaDashboard } from '@application/hooks/useRaDashboard'
import {
  AlertBar,
  UseCasesSummary,
  BusinessRulesSummary,
  TraceabilityPanel,
  SpecQualityPanel,
  AuditDom05aPanel,
  ConflictsDuplicatesPanel,
  ChangeImpactPanel,
  RequirementsDebtPanel,
  QuickActions,
} from '@presentation/components/ra-dashboard'
import { StatCard } from '@presentation/components/dashboard'
import {
  FileText,
  BookOpen,
  Network,
  Award,
  ShieldCheck,
  Landmark,
  Filter,
} from 'lucide-react'

type FilterProject = string | 'all'
type FilterModule = string | 'all'
type FilterUCStatus = string | 'all'

function RaDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useRaDashboard()

  const [_filterProject, setFilterProject] = useState<FilterProject>('all')
  const [_filterModule, setFilterModule] = useState<FilterModule>('all')
  const [_filterUCStatus, setFilterUCStatus] = useState<FilterUCStatus>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <Header
        title={t('raDashboard.pageTitle')}
        subtitle={t('raDashboard.pageSubtitle')}
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
            {/* Alert bar */}
            <AlertBar alerts={data.alerts} />

            {/* Filters row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors"
                aria-expanded={filtersOpen}
                aria-label={t('raDashboard.filters.toggle')}
              >
                <Filter size={14} aria-hidden="true" />
                {t('raDashboard.filters.title')}
              </button>
              <span className="text-[10px] text-text-muted">
                {t('raDashboard.lastUpdated')}: {new Date(data.updatedAt).toLocaleString('pt-BR')}
              </span>
            </div>

            {filtersOpen && (
              <div className="flex flex-wrap gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterProject(e.target.value)}
                  aria-label={t('raDashboard.filters.project')}
                >
                  <option value="all">{t('raDashboard.filters.allProjects')}</option>
                  <option value="motor-credito">Motor de Crédito v2</option>
                  <option value="antifraude">Antifraude Transacional</option>
                  <option value="onboarding">Portal de Onboarding PJ</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterModule(e.target.value)}
                  aria-label={t('raDashboard.filters.module')}
                >
                  <option value="all">{t('raDashboard.filters.allModules')}</option>
                  <option value="motor-credito">Motor de Crédito</option>
                  <option value="onboarding">Onboarding PJ</option>
                  <option value="antifraude">Antifraude</option>
                  <option value="infra">Infraestrutura</option>
                  <option value="portal">Portal Admin</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterUCStatus(e.target.value)}
                  aria-label={t('raDashboard.filters.ucStatus')}
                >
                  <option value="all">{t('raDashboard.filters.allStatuses')}</option>
                  <option value="draft">{t('raDashboard.useCases.status.draft')}</option>
                  <option value="validated">{t('raDashboard.useCases.status.validated')}</option>
                  <option value="implemented">{t('raDashboard.useCases.status.implemented')}</option>
                </select>
              </div>
            )}

            {/* Top-level KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                label={t('raDashboard.kpi.totalUCs')}
                value={data.useCases.totalDraft + data.useCases.totalValidated + data.useCases.totalImplemented}
                icon={<FileText size={16} />}
              />
              <StatCard
                label={t('raDashboard.kpi.totalRNs')}
                value={data.businessRules.total}
                icon={<BookOpen size={16} />}
              />
              <StatCard
                label={t('raDashboard.kpi.traceability')}
                value={`${data.traceability.coveragePercent}%`}
                icon={<Network size={16} />}
                variant={data.traceability.coveragePercent >= 80 ? 'success' : 'warning'}
              />
              <StatCard
                label={t('raDashboard.kpi.investScore')}
                value={data.specQuality.avgInvestScore.toFixed(1)}
                icon={<Award size={16} />}
                variant={data.specQuality.avgInvestScore >= 7 ? 'success' : 'warning'}
              />
              <StatCard
                label={t('raDashboard.kpi.gate2Approval')}
                value={`${Math.round(data.auditDom05a.gate2ApprovalRate * 100)}%`}
                icon={<ShieldCheck size={16} />}
                variant={data.auditDom05a.gate2ApprovalRate >= 0.85 ? 'success' : 'warning'}
              />
              <StatCard
                label={t('raDashboard.kpi.debtIndex')}
                value={`${Math.round(data.requirementsDebt.debtIndex * 100)}%`}
                icon={<Landmark size={16} />}
                variant={data.requirementsDebt.debtIndex <= 0.15 ? 'success' : data.requirementsDebt.debtIndex <= 0.25 ? 'warning' : 'error'}
              />
            </div>

            {/* Quick actions */}
            <QuickActions />

            {/* Main grid: 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                <UseCasesSummary data={data.useCases} />
                <TraceabilityPanel data={data.traceability} />
                <AuditDom05aPanel data={data.auditDom05a} />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <BusinessRulesSummary data={data.businessRules} />
                <SpecQualityPanel data={data.specQuality} />
                <ConflictsDuplicatesPanel data={data.conflictsDuplicates} />
              </div>
            </div>

            {/* Full-width bottom panels */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChangeImpactPanel data={data.changeImpact} />
              <RequirementsDebtPanel data={data.requirementsDebt} />
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { RaDashboardPage }
