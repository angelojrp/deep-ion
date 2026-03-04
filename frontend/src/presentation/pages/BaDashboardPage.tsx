import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useBaDashboard } from '@application/hooks/useBaDashboard'
import {
  AlertBar,
  BriefsSummary,
  DiscoveryPipeline,
  ArtifactQuality,
  ImpactClassification,
  EscalationsPanel,
  BacklogHealthBa,
  QuickActions,
} from '@presentation/components/ba-dashboard'
import { StatCard } from '@presentation/components/dashboard'
import {
  FileText,
  GitBranch,
  AlertTriangle,
  Flame,
  Archive,
  Filter,
} from 'lucide-react'

type FilterProject = string | 'all'
type FilterTier = string | 'all'
type FilterBriefStatus = string | 'all'

function BaDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useBaDashboard()

  const [_filterProject, setFilterProject] = useState<FilterProject>('all')
  const [_filterTier, setFilterTier] = useState<FilterTier>('all')
  const [_filterBriefStatus, setFilterBriefStatus] = useState<FilterBriefStatus>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <Header
        title={t('baDashboard.pageTitle')}
        subtitle={t('baDashboard.pageSubtitle')}
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
                aria-label={t('baDashboard.filters.toggle')}
              >
                <Filter size={14} aria-hidden="true" />
                {t('baDashboard.filters.title')}
              </button>
              <span className="text-[10px] text-text-muted">
                {t('baDashboard.lastUpdated')}: {new Date(data.updatedAt).toLocaleString('pt-BR')}
              </span>
            </div>

            {filtersOpen && (
              <div className="flex flex-wrap gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterProject(e.target.value)}
                  aria-label={t('baDashboard.filters.project')}
                >
                  <option value="all">{t('baDashboard.filters.allProjects')}</option>
                  <option value="motor-credito">Motor de Crédito v2</option>
                  <option value="antifraude">Antifraude Transacional</option>
                  <option value="onboarding">Portal de Onboarding PJ</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterTier(e.target.value)}
                  aria-label={t('baDashboard.filters.tier')}
                >
                  <option value="all">{t('baDashboard.filters.allTiers')}</option>
                  <option value="T0">T0</option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                </select>
                <select
                  className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5 text-xs text-text"
                  onChange={(e) => setFilterBriefStatus(e.target.value)}
                  aria-label={t('baDashboard.filters.briefStatus')}
                >
                  <option value="all">{t('baDashboard.filters.allStatuses')}</option>
                  <option value="draft">{t('baDashboard.briefs.status.draft')}</option>
                  <option value="final">{t('baDashboard.briefs.status.final')}</option>
                  <option value="refining">{t('baDashboard.briefs.status.refining')}</option>
                </select>
              </div>
            )}

            {/* Top-level KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                label={t('baDashboard.kpi.totalBriefs')}
                value={data.briefsVision.totalDraft + data.briefsVision.totalFinal + data.briefsVision.totalRefining}
                icon={<FileText size={16} />}
              />
              <StatCard
                label={t('baDashboard.kpi.briefsFinal')}
                value={data.briefsVision.totalFinal}
                icon={<FileText size={16} />}
                variant="success"
              />
              <StatCard
                label={t('baDashboard.kpi.inDiscovery')}
                value={data.discoveryPipeline.demandsInDom01 + data.discoveryPipeline.demandsInDom02}
                icon={<GitBranch size={16} />}
              />
              <StatCard
                label={t('baDashboard.kpi.stuckDemands')}
                value={data.discoveryPipeline.stuckDemands}
                icon={<AlertTriangle size={16} />}
                variant={data.discoveryPipeline.stuckDemands > 0 ? 'warning' : 'success'}
              />
              <StatCard
                label={t('baDashboard.kpi.pendingEscalations')}
                value={data.escalations.pendingCount}
                icon={<Flame size={16} />}
                variant={data.escalations.pendingCount > 0 ? 'error' : 'success'}
              />
              <StatCard
                label={t('baDashboard.kpi.backlogAge')}
                value={`${data.backlogHealth.avgAgeDays}d`}
                icon={<Archive size={16} />}
              />
            </div>

            {/* Quick actions */}
            <QuickActions />

            {/* Main grid: 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                <BriefsSummary data={data.briefsVision} />
                <ArtifactQuality data={data.artifactQuality} />
                <BacklogHealthBa data={data.backlogHealth} />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <DiscoveryPipeline data={data.discoveryPipeline} />
                <ImpactClassification data={data.impactClassification} />
                <EscalationsPanel data={data.escalations} />
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { BaDashboardPage }
