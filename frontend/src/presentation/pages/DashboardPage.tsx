import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { usePoDashboard } from '@application/hooks/usePoDashboard'
import {
  StatCard,
  PipelineKanban,
  DeliveryMetrics,
  BacklogHealth,
  BusinessQuality,
  ComplianceRisks,
  RoadmapProgress,
  ValueEffort,
} from '@presentation/components/dashboard'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  ShieldCheck,
  Target,
} from 'lucide-react'

function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = usePoDashboard()

  return (
    <>
      <Header
        title={t('poDashboard.pageTitle')}
        subtitle={t('poDashboard.pageSubtitle')}
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
            {/* Top-level KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                label={t('poDashboard.kpi.activeDemands')}
                value={data.backlog.totalActive}
                icon={<Activity size={16} />}
              />
              <StatCard
                label={t('poDashboard.kpi.blocked')}
                value={data.backlog.totalBlocked}
                icon={<AlertTriangle size={16} />}
                variant={data.backlog.totalBlocked > 0 ? 'error' : 'success'}
              />
              <StatCard
                label={t('poDashboard.kpi.flowEfficiency')}
                value={`${Math.round(data.delivery.flowEfficiency * 100)}%`}
                icon={<BarChart3 size={16} />}
                variant={data.delivery.flowEfficiency >= 0.4 ? 'success' : 'warning'}
              />
              <StatCard
                label={t('poDashboard.kpi.leadTime')}
                value={`${data.delivery.leadTimeDays.toFixed(1)}d`}
                icon={<Clock size={16} />}
              />
              <StatCard
                label={t('poDashboard.kpi.predictability')}
                value={`${Math.round(data.delivery.predictability * 100)}%`}
                icon={<Target size={16} />}
                variant={data.delivery.predictability >= 0.85 ? 'success' : 'warning'}
              />
              <StatCard
                label={t('poDashboard.kpi.compliance')}
                value={`${Math.round(data.compliance.auditedDecisionRecordsPercent * 100)}%`}
                icon={<ShieldCheck size={16} />}
                variant={data.compliance.auditedDecisionRecordsPercent >= 0.9 ? 'success' : 'warning'}
              />
            </div>

            {/* Pipeline Kanban — full width */}
            <PipelineKanban
              stageCounts={data.pipeline.stageCounts}
              demands={data.pipeline.demands}
            />

            {/* Delivery + Value/Effort — side by side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DeliveryMetrics data={data.delivery} />
              <ValueEffort demands={data.pipeline.demands} />
            </div>

            {/* Backlog Health + Business Quality — side by side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BacklogHealth data={data.backlog} />
              <BusinessQuality data={data.quality} />
            </div>

            {/* Compliance + Roadmap — side by side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ComplianceRisks data={data.compliance} />
              <RoadmapProgress data={data.roadmap} />
            </div>

            {/* Last updated */}
            <div className="text-right text-[10px] text-text-muted">
              {t('poDashboard.lastUpdated')}: {new Date(data.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export { DashboardPage }
