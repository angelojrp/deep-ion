import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Flame } from 'lucide-react'
import type { EscalationsData } from '@domain/models/ba-dashboard'

interface EscalationsPanelProps {
  data: EscalationsData
}

function EscalationsPanel({ data }: EscalationsPanelProps) {
  const { t } = useTranslation()

  const maxEscalations = Math.max(...data.historyByProject.map((p) => p.escalations), 1)

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.escalations.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Flame size={18} className="text-error" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.escalations.title')}
        </h3>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className={cn('rounded-[var(--radius-md)] px-3 py-2 text-center', data.pendingCount > 0 ? 'bg-error-light' : 'bg-success-light')}>
          <span className={cn('block text-2xl font-bold', data.pendingCount > 0 ? 'text-error' : 'text-success')}>
            {data.pendingCount}
          </span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.escalations.pending')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-success-light px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-success">{data.resolvedCount}</span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.escalations.resolved')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.avgResolutionTimeDays.toFixed(1)}d</span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.escalations.avgTime')}</span>
        </div>
      </div>

      {/* Low confidence demands */}
      {data.lowConfidenceDemands.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('baDashboard.escalations.lowConfidence')}
          </h4>
          <div className="space-y-1.5">
            {data.lowConfidenceDemands.map((demand) => (
              <div
                key={demand.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text">{demand.title}</p>
                  <p className="text-[10px] text-text-muted">{demand.project}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-sm font-bold text-error">
                    {(demand.confidenceScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-text-muted">score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History by project */}
      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('baDashboard.escalations.byProject')}
        </h4>
        <div className="space-y-2">
          {data.historyByProject.map((proj) => (
            <div key={proj.project}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text">{proj.project}</span>
                <span className="font-bold text-text">{proj.escalations}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-error transition-all"
                  style={{ width: `${(proj.escalations / maxEscalations) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { EscalationsPanel }
export type { EscalationsPanelProps }
