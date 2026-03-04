import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ChangeImpactData } from '@domain/models/ra-dashboard'

interface ChangeImpactPanelProps {
  data: ChangeImpactData
  className?: string
}

function ChangeImpactPanel({ data, className }: ChangeImpactPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.changeImpact.title')}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-text">{t('raDashboard.changeImpact.title')}</h3>
        </div>
        {data.unreviewedCount > 0 && (
          <span className="rounded-full bg-error-light border border-error-border px-2 py-0.5 text-[10px] font-medium text-error">
            {t('raDashboard.changeImpact.unreviewed', { count: data.unreviewedCount })}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {data.recentChanges.map((change) => (
          <div
            key={change.id}
            className={cn(
              'rounded-[var(--radius-md)] border px-3 py-2.5',
              change.reviewed
                ? 'border-border bg-surface-2'
                : 'border-error-border bg-error-light',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-text">{change.artifactId}</span>
                  <span className="text-[10px] text-text-muted">— {change.artifactTitle}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-text-muted">
                  {change.changedBy} · {new Date(change.changedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {change.reviewed ? (
                <CheckCircle2 size={14} className="shrink-0 text-success" aria-label={t('raDashboard.changeImpact.reviewed')} />
              ) : (
                <AlertCircle size={14} className="shrink-0 text-error" aria-label={t('raDashboard.changeImpact.notReviewed')} />
              )}
            </div>

            {/* Impact summary */}
            <div className="mt-2 flex flex-wrap gap-2">
              {change.affectedRNs > 0 && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {change.affectedRNs} RNs
                </span>
              )}
              {change.affectedStories > 0 && (
                <span className="rounded bg-info-light px-1.5 py-0.5 text-[10px] font-medium text-info">
                  {change.affectedStories} stories
                </span>
              )}
              {change.affectedScreens > 0 && (
                <span className="rounded bg-warning-light px-1.5 py-0.5 text-[10px] font-medium text-warning">
                  {change.affectedScreens} {t('raDashboard.changeImpact.screens')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChangeImpactPanel }
export type { ChangeImpactPanelProps }
