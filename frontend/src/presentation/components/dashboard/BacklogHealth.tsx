import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { BacklogHealth as BacklogHealthType, DemandTier, MoSCoWPriority } from '@domain/models/po-dashboard'

interface BacklogHealthProps {
  data: BacklogHealthType
}

const tierBg: Record<DemandTier, string> = {
  T0: 'bg-info',
  T1: 'bg-success',
  T2: 'bg-warning',
  T3: 'bg-error',
}

const moscowColors: Record<MoSCoWPriority, string> = {
  must: 'bg-error',
  should: 'bg-warning',
  could: 'bg-info',
  wont: 'bg-text-disabled',
}

function BacklogHealth({ data }: BacklogHealthProps) {
  const { t } = useTranslation()

  const totalTier = data.tierDistribution.reduce((a, b) => a + b.count, 0)
  const totalMoscow = data.moscowDistribution.reduce((a, b) => a + b.count, 0)

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.backlog.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.backlog.title')}
      </h3>

      {/* Summary row */}
      <div className="mb-4 flex gap-4">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-4 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.totalActive}</span>
          <span className="text-[10px] text-text-muted">{t('poDashboard.backlog.active')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-error-light px-4 py-2 text-center">
          <span className="block text-2xl font-bold text-error">{data.totalBlocked}</span>
          <span className="text-[10px] text-text-muted">{t('poDashboard.backlog.blocked')}</span>
        </div>
      </div>

      {/* Tier distribution bar */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.backlog.tierDistribution')}
        </h4>
        <div className="flex h-6 overflow-hidden rounded-full" role="img" aria-label={t('poDashboard.backlog.tierDistribution')}>
          {data.tierDistribution.map((td) => (
            <div
              key={td.tier}
              className={cn('flex items-center justify-center text-[10px] font-bold text-white', tierBg[td.tier])}
              style={{ width: `${(td.count / totalTier) * 100}%` }}
              title={`${td.tier}: ${td.count} (WIP: ${td.wip})`}
            >
              {td.count > 0 && td.tier}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-3">
          {data.tierDistribution.map((td) => (
            <div key={td.tier} className="flex items-center gap-1">
              <span className={cn('inline-block h-2 w-2 rounded-full', tierBg[td.tier])} aria-hidden="true" />
              <span className="text-[10px] text-text-muted">
                {td.tier}: {td.count} ({t('poDashboard.backlog.wip')}: {td.wip})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MoSCoW distribution */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.backlog.moscowDistribution')}
        </h4>
        <div className="space-y-2">
          {data.moscowDistribution.map((m) => {
            const pct = totalMoscow > 0 ? (m.count / totalMoscow) * 100 : 0
            const deliveredPct = m.count > 0 ? (m.delivered / m.count) * 100 : 0
            return (
              <div key={m.priority}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text">
                    {t(`poDashboard.backlog.moscow.${m.priority}`)}
                  </span>
                  <span className="text-text-muted">
                    {m.delivered}/{m.count} ({Math.round(deliveredPct)}%)
                  </span>
                </div>
                <div className="mt-0.5 flex h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn('rounded-full', moscowColors[m.priority])}
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="rounded-full bg-success/50"
                    style={{ width: `${deliveredPct}%`, marginLeft: '-100%', position: 'relative' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Age by stage */}
      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.backlog.ageByStage')}
        </h4>
        <div className="flex items-end gap-1" role="img" aria-label={t('poDashboard.backlog.ageByStage')}>
          {data.stageAgeAverage.map((sa) => {
            const maxAge = Math.max(...data.stageAgeAverage.map((x) => x.avgDays))
            const h = maxAge > 0 ? (sa.avgDays / maxAge) * 56 : 0
            const isHigh = sa.avgDays > 3
            return (
              <div key={sa.stage} className="flex flex-1 flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-text-muted">{sa.avgDays.toFixed(1)}d</span>
                <div
                  className={cn(
                    'w-full rounded-t',
                    isHigh ? 'bg-warning' : 'bg-primary/60',
                  )}
                  style={{ height: `${Math.max(h, 4)}px` }}
                  title={`${t(`poDashboard.pipeline.stages.${sa.stage}`)}: ${sa.avgDays.toFixed(1)}d`}
                />
                <span className="text-[8px] leading-tight text-text-muted text-center">
                  {t(`poDashboard.pipeline.stages.${sa.stage}`).slice(0, 6)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { BacklogHealth }
