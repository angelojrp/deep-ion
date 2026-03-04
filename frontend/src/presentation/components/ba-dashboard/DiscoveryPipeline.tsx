import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { GitBranch, AlertTriangle, TrendingUp } from 'lucide-react'
import type { DiscoveryPipelineData } from '@domain/models/ba-dashboard'

interface DiscoveryPipelineProps {
  data: DiscoveryPipelineData
}

function DiscoveryPipeline({ data }: DiscoveryPipelineProps) {
  const { t } = useTranslation()

  const phases = [
    { key: 'DOM-01', count: data.demandsInDom01, color: 'bg-info' },
    { key: 'DOM-02', count: data.demandsInDom02, color: 'bg-primary' },
    { key: 'Gate-2', count: data.demandsInGate2, color: 'bg-success' },
  ]

  const maxThroughput = Math.max(
    ...data.weeklyThroughput.flatMap((w) => [w.entered, w.exited]),
    1,
  )

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.pipeline.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <GitBranch size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.pipeline.title')}
        </h3>
      </div>

      {/* Phase counts */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {phases.map((phase) => (
          <div key={phase.key} className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
            <span className="block text-2xl font-bold text-text">{phase.count}</span>
            <span className="text-[10px] font-medium text-text-muted">{phase.key}</span>
          </div>
        ))}
      </div>

      {/* Stuck demands alert */}
      {data.stuckDemands > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2">
          <AlertTriangle size={14} className="shrink-0 text-warning" aria-hidden="true" />
          <span className="text-xs font-medium text-warning">
            {t('baDashboard.pipeline.stuckAlert', { count: data.stuckDemands })}
          </span>
        </div>
      )}

      {/* Stuck demands list */}
      {data.stuckDemandsList.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {data.stuckDemandsList.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-1.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text">{d.title}</p>
                <p className="text-[10px] text-text-muted">{d.phase}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-warning">{d.daysStuck}d</span>
            </div>
          ))}
        </div>
      )}

      {/* Average time by phase */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('baDashboard.pipeline.avgTimeByPhase')}
        </h4>
        <div className="space-y-2">
          {data.avgTimeByPhase.map((p) => {
            const maxDays = Math.max(...data.avgTimeByPhase.map((x) => x.avgDays), 1)
            const widthPct = (p.avgDays / maxDays) * 100
            return (
              <div key={p.phase}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text">{p.phase}</span>
                  <span className="font-bold text-text">{p.avgDays.toFixed(1)}d</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn('h-full rounded-full bg-primary transition-all')}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly throughput */}
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <TrendingUp size={12} aria-hidden="true" />
          {t('baDashboard.pipeline.throughput')}
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {data.weeklyThroughput.map((week) => (
            <div key={week.week} className="text-center">
              <div className="flex h-16 items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t bg-info transition-all"
                  style={{ height: `${(week.entered / maxThroughput) * 100}%` }}
                  title={`${t('baDashboard.pipeline.entered')}: ${week.entered}`}
                />
                <div
                  className="w-3 rounded-t bg-success transition-all"
                  style={{ height: `${(week.exited / maxThroughput) * 100}%` }}
                  title={`${t('baDashboard.pipeline.exited')}: ${week.exited}`}
                />
              </div>
              <span className="mt-1 block text-[10px] text-text-muted">{week.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-info" aria-hidden="true" />
            <span className="text-[10px] text-text-muted">{t('baDashboard.pipeline.entered')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            <span className="text-[10px] text-text-muted">{t('baDashboard.pipeline.exited')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DiscoveryPipeline }
export type { DiscoveryPipelineProps }
