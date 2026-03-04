import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Award, AlertTriangle, BarChart3 } from 'lucide-react'
import type { SpecQualityData } from '@domain/models/ra-dashboard'

interface SpecQualityPanelProps {
  data: SpecQualityData
  className?: string
}

function SpecQualityPanel({ data, className }: SpecQualityPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.specQuality.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Award size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.specQuality.title')}</h3>
      </div>

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className={cn(
          'rounded-[var(--radius-md)] border px-3 py-2 text-center',
          data.avgInvestScore >= 7 ? 'border-success-border bg-success-light' : 'border-warning-border bg-warning-light',
        )}>
          <span className={cn(
            'block text-2xl font-bold',
            data.avgInvestScore >= 7 ? 'text-success' : 'text-warning',
          )}>
            {data.avgInvestScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.specQuality.investScore')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.refinedPercent}%</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.specQuality.refined')}</span>
        </div>
        <div className={cn(
          'rounded-[var(--radius-md)] border px-3 py-2 text-center',
          data.storiesBelowThreshold.length > 0 ? 'border-warning-border bg-warning-light' : 'border-success-border bg-success-light',
        )}>
          <span className={cn(
            'block text-2xl font-bold',
            data.storiesBelowThreshold.length > 0 ? 'text-warning' : 'text-success',
          )}>
            {data.storiesBelowThreshold.length}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.specQuality.belowThreshold')}</span>
        </div>
      </div>

      {/* Refinement progress */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-text-muted">{t('raDashboard.specQuality.refinementProgress')}</span>
          <span className="text-xs font-medium text-text">{data.totalStories - data.pendingRefinement}/{data.totalStories}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${data.refinedPercent}%` }}
          />
        </div>
      </div>

      {/* Gherkin coverage by module */}
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <BarChart3 size={12} aria-hidden="true" />
          {t('raDashboard.specQuality.gherkinCoverage')}
        </h4>
        <div className="space-y-1.5">
          {data.gherkinCoverageByModule.map((m) => {
            const pct = m.total > 0 ? Math.round((m.covered / m.total) * 100) : 0
            return (
              <div key={m.module} className="flex items-center gap-2">
                <span className="w-28 truncate text-[11px] text-text-muted">{m.module}</span>
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-sm bg-surface-2">
                    <div
                      className={cn(
                        'h-full rounded-sm transition-all',
                        pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-error',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-14 text-right text-[11px] text-text-muted">{m.covered}/{m.total}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stories below threshold */}
      {data.storiesBelowThreshold.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-warning">
            <AlertTriangle size={12} aria-hidden="true" />
            {t('raDashboard.specQuality.storiesBelowTitle')}
          </h4>
          <div className="space-y-1.5">
            {data.storiesBelowThreshold.map((s) => (
              <div key={s.id} className="rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text">{s.id} — {s.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.issues.map((issue) => (
                        <span key={issue} className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning">{issue}</span>
                      ))}
                    </div>
                  </div>
                  <span className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
                    s.score < 5 ? 'bg-error-light text-error' : 'bg-warning-light text-warning',
                  )}>
                    {s.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vague criteria */}
      {data.vagueCriteria.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('raDashboard.specQuality.vagueCriteria')}
          </h4>
          <div className="space-y-1.5">
            {data.vagueCriteria.map((vc) => (
              <div key={`${vc.storyId}-${vc.criterion}`} className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5">
                <p className="text-xs text-text"><span className="font-medium">{vc.storyId}</span>: &ldquo;{vc.criterion}&rdquo;</p>
                <p className="text-[10px] text-text-muted mt-0.5">{vc.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { SpecQualityPanel }
export type { SpecQualityPanelProps }
