import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Archive, AlertTriangle } from 'lucide-react'
import type { DesignDebtData } from '@domain/models/ux-dashboard'

interface DesignDebtPanelProps {
  data: DesignDebtData
  className?: string
}

const priorityBadge = {
  high: 'bg-error-light text-error border-error-border',
  medium: 'bg-warning-light text-warning border-warning-border',
  low: 'bg-info-light text-info border-info-border',
}

function DesignDebtPanel({ data, className }: DesignDebtPanelProps) {
  const { t } = useTranslation()

  const debtPercent = Math.round(data.debtIndex * 100)

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.designDebt.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Archive size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.designDebt.title')}
        </h3>
      </div>

      {/* Debt index */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className={cn(
            'block text-2xl font-bold',
            debtPercent <= 10 ? 'text-success' : debtPercent <= 25 ? 'text-warning' : 'text-error',
          )}>
            {debtPercent}%
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.designDebt.debtIndex')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.screensWithDebtTags}</span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.designDebt.screensWithTags')}</span>
        </div>
      </div>

      {/* Approved with caveats */}
      {data.approvedWithCaveats.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-warning">
            <AlertTriangle size={12} aria-hidden="true" />
            {t('uxDashboard.designDebt.approvedWithCaveats')} ({data.approvedWithCaveats.length})
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {data.approvedWithCaveats.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2"
              >
                <p className="text-xs font-medium text-warning">{c.prototypeName}</p>
                <p className="text-[10px] text-warning/70">{c.caveat}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backlog */}
      {data.backlogItems.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.designDebt.backlog')} ({data.backlogItems.length})
          </h4>
          <div className="space-y-1.5">
            {data.backlogItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-surface-2 px-3 py-2"
              >
                <span className={cn(
                  'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase',
                  priorityBadge[item.priority],
                )}>
                  {item.priority}
                </span>
                <span className="flex-1 text-xs text-text truncate">{item.title}</span>
                <span className="shrink-0 text-[10px] text-text-muted">{item.wave}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { DesignDebtPanel }
export type { DesignDebtPanelProps }
