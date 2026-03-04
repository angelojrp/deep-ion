import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { ShieldCheck, XCircle } from 'lucide-react'
import type { ArtifactQualityData } from '@domain/models/ba-dashboard'

interface ArtifactQualityProps {
  data: ArtifactQualityData
}

function ArtifactQuality({ data }: ArtifactQualityProps) {
  const { t } = useTranslation()

  const metrics = [
    {
      key: 'completeness',
      value: data.avgCompleteness,
      label: t('baDashboard.quality.avgCompleteness'),
      target: 0.80,
      format: 'percent' as const,
    },
    {
      key: 'reworkRate',
      value: data.reworkRate,
      label: t('baDashboard.quality.reworkRate'),
      target: 0.10,
      format: 'percent' as const,
      invertColor: true,
    },
  ]

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.quality.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.quality.title')}
        </h3>
      </div>

      {/* Metric bars */}
      <div className="mb-4 space-y-3">
        {metrics.map((m) => {
          const pct = Math.round(m.value * 100)
          const meetsTarget = m.invertColor ? m.value <= m.target : m.value >= m.target
          const targetPct = Math.round(m.target * 100)

          return (
            <div key={m.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text">{m.label}</span>
                <span className={cn('font-bold', meetsTarget ? 'text-success' : 'text-warning')}>
                  {pct}%
                </span>
              </div>
              <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn('h-full rounded-full transition-all', meetsTarget ? 'bg-success' : 'bg-warning')}
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-text-muted"
                  style={{ left: `${targetPct}%` }}
                  title={`${t('baDashboard.quality.target')}: ${targetPct}%`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Gate 2 rejected */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-text">{t('baDashboard.quality.gate2Rejected')}</span>
          <span className={cn('font-bold', data.gate2RejectedCount > 0 ? 'text-error' : 'text-success')}>
            {data.gate2RejectedCount}
          </span>
        </div>
        {data.gate2RejectedBriefs.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {data.gate2RejectedBriefs.map((brief) => (
              <div
                key={brief.id}
                className="flex items-start gap-2 rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2"
              >
                <XCircle size={14} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text">{brief.name}</p>
                  <p className="text-[10px] text-text-muted">{brief.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last audit results */}
      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('baDashboard.quality.lastAudit')}
        </h4>
        <div className="space-y-2">
          {data.lastAuditResults.map((audit) => (
            <div key={audit.demandId} className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
              <p className="truncate text-xs font-medium text-text">{audit.demandName}</p>
              <div className="mt-1 flex gap-4 text-[10px] text-text-muted">
                <span>
                  {t('baDashboard.quality.completenessLabel')}:{' '}
                  <strong className={cn(audit.completeness >= 0.8 ? 'text-success' : 'text-warning')}>
                    {Math.round(audit.completeness * 100)}%
                  </strong>
                </span>
                <span>
                  {t('baDashboard.quality.consistencyLabel')}:{' '}
                  <strong className={cn(audit.consistency >= 0.8 ? 'text-success' : 'text-warning')}>
                    {Math.round(audit.consistency * 100)}%
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { ArtifactQuality }
export type { ArtifactQualityProps }
