import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { BarChart3, AlertTriangle } from 'lucide-react'
import type { ImpactClassificationData, ImpactTier } from '@domain/models/ba-dashboard'

interface ImpactClassificationProps {
  data: ImpactClassificationData
}

const tierColors: Record<ImpactTier, string> = {
  T0: 'bg-info',
  T1: 'bg-success',
  T2: 'bg-warning',
  T3: 'bg-error',
}

const tierTextColors: Record<ImpactTier, string> = {
  T0: 'text-info',
  T1: 'text-success',
  T2: 'text-warning',
  T3: 'text-error',
}

function ImpactClassification({ data }: ImpactClassificationProps) {
  const { t } = useTranslation()

  const totalCount = data.distribution.reduce((a, b) => a + b.count, 0)

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.impact.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.impact.title')}
        </h3>
      </div>

      {/* Distribution bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex h-6 overflow-hidden rounded-full" role="img" aria-label={t('baDashboard.impact.distribution')}>
            {data.distribution.map((item) => (
              <div
                key={item.tier}
                className={cn('flex items-center justify-center text-[10px] font-bold text-white', tierColors[item.tier as ImpactTier])}
                style={{ width: `${item.percentage}%` }}
                title={`${item.tier}: ${item.count} (${item.percentage}%)`}
              >
                {item.percentage >= 10 && `${item.tier}`}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-3">
            {data.distribution.map((item) => (
              <div key={item.tier} className="flex items-center gap-1">
                <span className={cn('inline-block h-2 w-2 rounded-full', tierColors[item.tier as ImpactTier])} aria-hidden="true" />
                <span className="text-[10px] text-text-muted">
                  {item.tier}: {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend mini chart */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('baDashboard.impact.trend')}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]" role="table">
            <thead>
              <tr className="text-text-muted">
                <th className="py-1 text-left font-medium">{t('baDashboard.impact.month')}</th>
                {(['T0', 'T1', 'T2', 'T3'] as ImpactTier[]).map((tier) => (
                  <th key={tier} className={cn('py-1 text-center font-medium', tierTextColors[tier])}>{tier}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.trend.map((row) => (
                <tr key={row.month} className="border-t border-border/50">
                  <td className="py-1 font-medium text-text">{row.month}</td>
                  <td className="py-1 text-center text-info">{row.T0}</td>
                  <td className="py-1 text-center text-success">{row.T1}</td>
                  <td className="py-1 text-center text-warning">{row.T2}</td>
                  <td className="py-1 text-center text-error">{row.T3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active T3 demands */}
      {data.activeT3Demands.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <AlertTriangle size={12} aria-hidden="true" />
            {t('baDashboard.impact.activeT3')}
          </h4>
          <div className="space-y-1.5">
            {data.activeT3Demands.map((demand) => (
              <div
                key={demand.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text">{demand.title}</p>
                  <p className="text-[10px] text-text-muted">{demand.assignee}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-error">{demand.daysActive}d</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { ImpactClassification }
export type { ImpactClassificationProps }
