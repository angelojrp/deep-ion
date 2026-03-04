import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { PipelineDemand, DemandTier, MoSCoWPriority } from '@domain/models/po-dashboard'

interface ValueEffortProps {
  demands: PipelineDemand[]
}

const tierSize: Record<DemandTier, number> = {
  T0: 24,
  T1: 32,
  T2: 40,
  T3: 48,
}

const tierColors: Record<DemandTier, string> = {
  T0: 'bg-info/70 border-info',
  T1: 'bg-success/70 border-success',
  T2: 'bg-warning/70 border-warning',
  T3: 'bg-error/70 border-error',
}

const moscowWeight: Record<MoSCoWPriority, number> = {
  must: 100,
  should: 66,
  could: 33,
  wont: 10,
}

function ValueEffort({ demands }: ValueEffortProps) {
  const { t } = useTranslation()

  const activeDemands = demands.filter((d) => d.status !== 'done')

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.valueEffort.title')}
    >
      <h3 className="mb-1 text-base font-semibold text-text">
        {t('poDashboard.valueEffort.title')}
      </h3>
      <p className="mb-4 text-[10px] text-text-muted">
        {t('poDashboard.valueEffort.description')}
      </p>

      {/* Chart area */}
      <div className="relative h-64 rounded-[var(--radius-md)] border border-border bg-surface-2 p-4">
        {/* Axis labels */}
        <span className="absolute left-2 top-2 text-[9px] font-semibold uppercase text-text-muted">
          {t('poDashboard.valueEffort.highValue')}
        </span>
        <span className="absolute bottom-2 left-2 text-[9px] font-semibold uppercase text-text-muted">
          {t('poDashboard.valueEffort.lowValue')}
        </span>
        <span className="absolute bottom-2 right-2 text-[9px] font-semibold uppercase text-text-muted">
          {t('poDashboard.valueEffort.highEffort')}
        </span>
        <span className="absolute bottom-2 left-1/4 text-[9px] font-semibold uppercase text-text-muted">
          {t('poDashboard.valueEffort.lowEffort')}
        </span>

        {/* Quadrant lines */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border" />
        <div className="absolute top-1/2 left-4 right-4 h-px bg-border" />

        {/* Quadrant labels */}
        <span className="absolute left-6 top-6 text-[8px] font-bold uppercase text-success/60">
          {t('poDashboard.valueEffort.quickWins')}
        </span>
        <span className="absolute right-6 top-6 text-[8px] font-bold uppercase text-warning/60">
          {t('poDashboard.valueEffort.strategic')}
        </span>
        <span className="absolute left-6 bottom-6 text-[8px] font-bold uppercase text-text-muted/40">
          {t('poDashboard.valueEffort.fillIns')}
        </span>
        <span className="absolute right-6 bottom-6 text-[8px] font-bold uppercase text-error/60">
          {t('poDashboard.valueEffort.avoid')}
        </span>

        {/* Bubble plots */}
        {activeDemands.map((d, i) => {
          const value = moscowWeight[d.moscowPriority]
          const effort = tierEffort(d.tier, d.ageDays)
          const size = tierSize[d.tier]

          // Map to chart coordinates (percentages)
          const x = mapRange(effort, 0, 100, 10, 90)
          const y = mapRange(value, 0, 100, 90, 10) // Invert Y: high value = top

          return (
            <div
              key={d.id}
              className={cn(
                'absolute flex items-center justify-center rounded-full border text-[8px] font-bold text-white',
                tierColors[d.tier],
                d.status === 'blocked' && 'ring-2 ring-error ring-offset-1',
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10 + i,
              }}
              title={`${d.id}: ${d.title}\n${d.tier} · ${d.moscowPriority} · ${d.ageDays}d`}
            >
              {d.id.slice(-3)}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {(['T0', 'T1', 'T2', 'T3'] as DemandTier[]).map((tier) => (
          <div key={tier} className="flex items-center gap-1">
            <span className={cn('inline-block h-3 w-3 rounded-full border', tierColors[tier])} aria-hidden="true" />
            <span className="text-[10px] text-text-muted">{tier}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full ring-2 ring-error ring-offset-1 bg-transparent" aria-hidden="true" />
          <span className="text-[10px] text-text-muted">{t('poDashboard.valueEffort.blocked')}</span>
        </div>
      </div>
    </div>
  )
}

function tierEffort(tier: DemandTier, ageDays: number): number {
  const base: Record<DemandTier, number> = { T0: 5, T1: 20, T2: 50, T3: 80 }
  return Math.min(base[tier] + ageDays * 3, 100)
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

export { ValueEffort }
