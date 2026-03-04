import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Layers } from 'lucide-react'
import type { PrototypeSummaryData, PrototypeStatus } from '@domain/models/ux-dashboard'

interface PrototypeSummaryProps {
  data: PrototypeSummaryData
  className?: string
}

const statusConfig: Record<PrototypeStatus, { color: string; bg: string }> = {
  draft: { color: 'bg-warning-light text-warning border-warning-border', bg: 'bg-warning' },
  final: { color: 'bg-info-light text-info border-info-border', bg: 'bg-info' },
  approved: { color: 'bg-success-light text-success border-success-border', bg: 'bg-success' },
  rejected: { color: 'bg-error-light text-error border-error-border', bg: 'bg-error' },
}

function PrototypeSummary({ data, className }: PrototypeSummaryProps) {
  const { t } = useTranslation()

  const statuses: { key: PrototypeStatus; count: number }[] = [
    { key: 'draft', count: data.totalDraft },
    { key: 'final', count: data.totalFinal },
    { key: 'approved', count: data.totalApproved },
    { key: 'rejected', count: data.totalRejected },
  ]

  const total = data.totalDraft + data.totalFinal + data.totalApproved + data.totalRejected

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.prototypes.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Layers size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.prototypes.title')}
        </h3>
      </div>

      {/* Status cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statuses.map(({ key, count }) => (
          <div
            key={key}
            className={cn(
              'rounded-[var(--radius-md)] border px-3 py-2 text-center',
              statusConfig[key].color,
            )}
          >
            <span className="block text-2xl font-bold">{count}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {t(`uxDashboard.prototypes.status.${key}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={t('uxDashboard.prototypes.distribution')}>
            {statuses.map(({ key, count }) => (
              <div
                key={key}
                className={cn('transition-all', statusConfig[key].bg)}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${t(`uxDashboard.prototypes.status.${key}`)}: ${count}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Throughput chart (simple bars) */}
      {data.throughputPerWeek.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.prototypes.throughput')}
          </h4>
          <div className="flex items-end gap-2">
            {data.throughputPerWeek.map((week) => {
              const maxVal = Math.max(...data.throughputPerWeek.map((w) => w.approved + w.rejected), 1)
              const approvedH = (week.approved / maxVal) * 48
              const rejectedH = (week.rejected / maxVal) * 48
              return (
                <div key={week.week} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-full rounded-t bg-success"
                      style={{ height: `${approvedH}px`, minWidth: '16px' }}
                      title={`${t('uxDashboard.prototypes.status.approved')}: ${week.approved}`}
                    />
                    {week.rejected > 0 && (
                      <div
                        className="w-full rounded-b bg-error"
                        style={{ height: `${rejectedH}px`, minWidth: '16px' }}
                        title={`${t('uxDashboard.prototypes.status.rejected')}: ${week.rejected}`}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-text-muted">{week.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { PrototypeSummary }
export type { PrototypeSummaryProps }
