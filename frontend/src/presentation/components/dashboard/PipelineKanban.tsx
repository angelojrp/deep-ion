import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { PipelineStageCount, PipelineDemand, PipelineStage, DemandTier } from '@domain/models/po-dashboard'

interface PipelineKanbanProps {
  stageCounts: PipelineStageCount[]
  demands: PipelineDemand[]
}

const stageOrder: PipelineStage[] = [
  'discovery', 'analysis', 'gate-1', 'gate-2',
  'development', 'gate-3', 'gate-4', 'done',
]

const tierColors: Record<DemandTier, string> = {
  T0: 'bg-info text-white',
  T1: 'bg-success text-white',
  T2: 'bg-warning text-white',
  T3: 'bg-error text-white',
}

function PipelineKanban({ stageCounts, demands }: PipelineKanbanProps) {
  const { t } = useTranslation()

  const countMap = new Map(stageCounts.map((s) => [s.stage, s]))
  const demandsByStage = new Map<PipelineStage, PipelineDemand[]>()
  for (const d of demands) {
    const list = demandsByStage.get(d.stage) ?? []
    list.push(d)
    demandsByStage.set(d.stage, list)
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.pipeline.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.pipeline.title')}
      </h3>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {stageOrder.map((stage) => {
          const info = countMap.get(stage)
          const stageDemands = demandsByStage.get(stage) ?? []
          const blocked = info?.blockedCount ?? 0

          return (
            <div
              key={stage}
              className="min-w-[140px] flex-1 rounded-[var(--radius-md)] bg-surface-2 p-3"
            >
              {/* Stage header */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t(`poDashboard.pipeline.stages.${stage}`)}
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-bold text-primary">
                  {info?.count ?? 0}
                </span>
              </div>

              {/* Blocked indicator */}
              {blocked > 0 && (
                <div className="mb-2 rounded bg-error-light px-2 py-0.5 text-xs font-medium text-error">
                  {t('poDashboard.pipeline.blocked', { count: blocked })}
                </div>
              )}

              {/* Demand cards */}
              <div className="flex flex-col gap-1.5">
                {stageDemands.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      'rounded-[var(--radius-sm)] border border-border bg-surface p-2 text-xs',
                      d.status === 'blocked' && 'border-error/40',
                      d.status === 'escalated' && 'border-warning/40',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn('inline-flex h-4 items-center rounded px-1 text-[10px] font-bold', tierColors[d.tier])}>
                        {d.tier}
                      </span>
                      <span className="truncate font-medium text-text">{d.id}</span>
                    </div>
                    <p className="mt-0.5 truncate text-text-secondary">{d.title}</p>
                    {d.lgpdFlag && (
                      <span className="mt-1 inline-block rounded bg-error/10 px-1.5 py-0.5 text-[10px] font-semibold text-error">
                        LGPD
                      </span>
                    )}
                  </div>
                ))}
                {stageDemands.length > 4 && (
                  <span className="text-center text-[10px] text-text-muted">
                    +{stageDemands.length - 4} {t('poDashboard.pipeline.more')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { PipelineKanban }
