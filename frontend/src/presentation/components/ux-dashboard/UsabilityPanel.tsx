import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { MousePointerClick, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { UsabilityData } from '@domain/models/ux-dashboard'

interface UsabilityPanelProps {
  data: UsabilityData
  className?: string
}

function UsabilityPanel({ data, className }: UsabilityPanelProps) {
  const { t } = useTranslation()

  const feedbackPercent = data.totalActions > 0
    ? Math.round((data.feedbackCovered / data.totalActions) * 100)
    : 0

  const statesData = [
    {
      key: 'empty',
      label: t('uxDashboard.usability.emptyState'),
      value: data.statesCoverage.withEmptyState,
      total: data.statesCoverage.totalScreens,
    },
    {
      key: 'error',
      label: t('uxDashboard.usability.errorState'),
      value: data.statesCoverage.withErrorState,
      total: data.statesCoverage.totalScreens,
    },
    {
      key: 'loading',
      label: t('uxDashboard.usability.loadingState'),
      value: data.statesCoverage.withLoadingState,
      total: data.statesCoverage.totalScreens,
    },
  ]

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.usability.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <MousePointerClick size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.usability.title')}
        </h3>
      </div>

      {/* Score & Click depth */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className={cn(
            'block text-2xl font-bold',
            data.avgHeuristicScore >= 8 ? 'text-success' : data.avgHeuristicScore >= 6 ? 'text-warning' : 'text-error',
          )}>
            {data.avgHeuristicScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.usability.heuristicScore')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className={cn(
            'block text-2xl font-bold',
            data.avgClickDepth <= 3 ? 'text-success' : 'text-warning',
          )}>
            {data.avgClickDepth.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.usability.clickDepth')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{feedbackPercent}%</span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.usability.feedbackCoverage')}</span>
        </div>
      </div>

      {/* States coverage */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {t('uxDashboard.usability.statesCoverage')}
        </h4>
        <div className="space-y-2">
          {statesData.map((s) => {
            const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-text-muted">{s.label}</span>
                  <span className="text-xs font-medium text-text">{s.value}/{s.total}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-error',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dead ends */}
      {data.deadEndFlows.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-error">
            <XCircle size={12} aria-hidden="true" />
            {t('uxDashboard.usability.deadEnds')} ({data.deadEndFlows.length})
          </h4>
          <div className="space-y-1.5">
            {data.deadEndFlows.map((de) => (
              <div
                key={de.id}
                className="flex items-start gap-2 rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2"
              >
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-error">{de.screenName}</p>
                  <p className="text-[10px] text-error/70">{de.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.deadEndFlows.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>{t('uxDashboard.usability.noDeadEnds')}</span>
        </div>
      )}
    </div>
  )
}

export { UsabilityPanel }
export type { UsabilityPanelProps }
