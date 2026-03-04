import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { DeliveryMetrics as DeliveryMetricsType } from '@domain/models/po-dashboard'

interface DeliveryMetricsProps {
  data: DeliveryMetricsType
}

function DeliveryMetrics({ data }: DeliveryMetricsProps) {
  const { t } = useTranslation()

  const flowPct = Math.round(data.flowEfficiency * 100)
  const predPct = Math.round(data.predictability * 100)

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.delivery.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.delivery.title')}
      </h3>

      {/* Cycle time by tier */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.delivery.cycleTime')}
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {data.cycleTimeByTier.map((ct) => {
            const isOnTarget = ct.avgDays <= ct.targetDays
            return (
              <div
                key={ct.tier}
                className={cn(
                  'rounded-[var(--radius-md)] border p-3 text-center',
                  isOnTarget
                    ? 'border-success-border bg-success-light'
                    : 'border-warning-border bg-warning-light',
                )}
              >
                <span className="block text-xs font-bold text-text-muted">{ct.tier}</span>
                <span className="block text-lg font-bold text-text">
                  {ct.avgDays < 1
                    ? `${Math.round(ct.avgDays * 24)}h`
                    : `${ct.avgDays.toFixed(1)}d`}
                </span>
                <span className="block text-[10px] text-text-muted">
                  p85: {ct.p85Days < 1
                    ? `${Math.round(ct.p85Days * 24)}h`
                    : `${ct.p85Days.toFixed(1)}d`}
                </span>
                <span className={cn(
                  'mt-1 inline-block text-[10px] font-semibold',
                  isOnTarget ? 'text-success' : 'text-warning',
                )}>
                  {isOnTarget ? '✓' : '⚠'} {t('poDashboard.delivery.target')}:{' '}
                  {ct.targetDays < 1
                    ? `${Math.round(ct.targetDays * 24)}h`
                    : `${ct.targetDays.toFixed(1)}d`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile
          label={t('poDashboard.delivery.leadTime')}
          value={`${data.leadTimeDays.toFixed(1)}d`}
          sublabel={t('poDashboard.delivery.leadTimeBench')}
        />
        <MetricTile
          label={t('poDashboard.delivery.flowEfficiency')}
          value={`${flowPct}%`}
          sublabel={flowPct >= 40 ? t('poDashboard.delivery.aboveTarget') : t('poDashboard.delivery.belowTarget')}
          variant={flowPct >= 40 ? 'success' : 'warning'}
        />
        <MetricTile
          label={t('poDashboard.delivery.predictability')}
          value={`${predPct}%`}
          sublabel={`Monte Carlo > 85%`}
          variant={predPct >= 85 ? 'success' : 'warning'}
        />
        <MetricTile
          label={t('poDashboard.delivery.throughput')}
          value={`${data.throughputWeekly.at(-1)?.completed ?? 0}`}
          sublabel={t('poDashboard.delivery.perWeek')}
        />
      </div>

      {/* Throughput trend */}
      <div className="mt-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.delivery.throughputTrend')}
        </h4>
        <div className="flex items-end gap-1.5" role="img" aria-label={t('poDashboard.delivery.throughputTrend')}>
          {data.throughputWeekly.map((w) => {
            const maxVal = Math.max(...data.throughputWeekly.map((x) => Math.max(x.completed, x.started)))
            const completedH = (w.completed / maxVal) * 64
            const startedH = (w.started / maxVal) * 64
            return (
              <div key={w.week} className="flex flex-1 flex-col items-center gap-0.5">
                <div className="flex items-end gap-0.5">
                  <div
                    className="w-3 rounded-t bg-primary/70"
                    style={{ height: `${startedH}px` }}
                    title={`${t('poDashboard.delivery.started')}: ${w.started}`}
                  />
                  <div
                    className="w-3 rounded-t bg-success"
                    style={{ height: `${completedH}px` }}
                    title={`${t('poDashboard.delivery.completed')}: ${w.completed}`}
                  />
                </div>
                <span className="text-[9px] text-text-muted">{w.week.slice(-3)}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex justify-center gap-4">
          <LegendDot color="bg-primary/70" label={t('poDashboard.delivery.started')} />
          <LegendDot color="bg-success" label={t('poDashboard.delivery.completed')} />
        </div>
      </div>
    </div>
  )
}

/* ─── Internal sub-components ─── */

interface MetricTileProps {
  label: string
  value: string
  sublabel: string
  variant?: 'default' | 'success' | 'warning'
}

function MetricTile({ label, value, sublabel, variant = 'default' }: MetricTileProps) {
  return (
    <div className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-center">
      <span className="block text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span className={cn(
        'block text-xl font-bold',
        variant === 'success' && 'text-success',
        variant === 'warning' && 'text-warning',
        variant === 'default' && 'text-text',
      )}>
        {value}
      </span>
      <span className="block text-[10px] text-text-muted">{sublabel}</span>
    </div>
  )
}

interface LegendDotProps {
  color: string
  label: string
}

function LegendDot({ color, label }: LegendDotProps) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn('inline-block h-2 w-2 rounded-full', color)} aria-hidden="true" />
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  )
}

export { DeliveryMetrics }
