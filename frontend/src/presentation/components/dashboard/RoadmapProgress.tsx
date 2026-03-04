import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { RoadmapStatus } from '@domain/models/po-dashboard'

interface RoadmapProgressProps {
  data: RoadmapStatus
}

function RoadmapProgress({ data }: RoadmapProgressProps) {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.roadmap.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.roadmap.title')}
      </h3>

      {/* Milestones */}
      <div className="space-y-4">
        {data.milestones.map((ms) => {
          const pct = Math.round(ms.overallProgress * 100)
          const mustPct = ms.mustTotal > 0 ? Math.round((ms.mustCompleted / ms.mustTotal) * 100) : 0
          const isOnTrack = pct >= 50

          return (
            <div key={ms.id} className="rounded-[var(--radius-md)] bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-text">{ms.name}</span>
                  <span className="ml-2 text-xs text-text-muted">
                    {t('poDashboard.roadmap.target')}: {formatDateBR(ms.targetDate)}
                  </span>
                </div>
                <span className={cn(
                  'text-lg font-bold',
                  isOnTrack ? 'text-success' : 'text-warning',
                )}>
                  {pct}%
                </span>
              </div>

              {/* Overall progress bar */}
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isOnTrack ? 'bg-success' : 'bg-warning',
                  )}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${ms.name}: ${pct}%`}
                />
              </div>

              {/* Must-have progress */}
              <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                <span>
                  Must-have: {ms.mustCompleted}/{ms.mustTotal} ({mustPct}%)
                </span>
                <span className={cn(
                  'font-semibold',
                  mustPct >= 60 ? 'text-success' : 'text-warning',
                )}>
                  {mustPct >= 60 ? '✓ ' : '⚠ '}
                  {t(mustPct >= 60 ? 'poDashboard.roadmap.onTrack' : 'poDashboard.roadmap.atRisk')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Capacity & debt */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-md)] bg-info-light border border-info-border p-3 text-center">
          <span className="block text-lg font-bold text-text">{data.remainingCapacityWeeks}</span>
          <span className="text-[10px] text-text-muted">{t('poDashboard.roadmap.weeksRemaining')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-center">
          <span className="block text-lg font-bold text-text">{data.weeklyThroughputAvg.toFixed(1)}</span>
          <span className="text-[10px] text-text-muted">{t('poDashboard.roadmap.avgThroughput')}</span>
        </div>
        <div className={cn(
          'rounded-[var(--radius-md)] p-3 text-center',
          data.businessDebtCount > 0 ? 'bg-warning-light border border-warning-border' : 'bg-surface-2',
        )}>
          <span className={cn('block text-lg font-bold', data.businessDebtCount > 0 ? 'text-warning' : 'text-text')}>
            {data.businessDebtCount}
          </span>
          <span className="text-[10px] text-text-muted">{t('poDashboard.roadmap.businessDebt')}</span>
        </div>
      </div>
    </div>
  )
}

function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export { RoadmapProgress }
