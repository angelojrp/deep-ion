import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Swords, Copy } from 'lucide-react'
import type { ConflictsDuplicatesData } from '@domain/models/ra-dashboard'

interface ConflictsDuplicatesPanelProps {
  data: ConflictsDuplicatesData
  className?: string
}

function ConflictsDuplicatesPanel({ data, className }: ConflictsDuplicatesPanelProps) {
  const { t } = useTranslation()

  const hasConflicts = data.conflicts.length > 0
  const hasDuplicates = data.duplicates.length > 0

  if (!hasConflicts && !hasDuplicates) return null

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.conflicts.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Swords size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.conflicts.title')}</h3>
      </div>

      {/* Conflicts */}
      {hasConflicts && (
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <Swords size={12} aria-hidden="true" />
            {t('raDashboard.conflicts.conflictCount', { count: data.conflicts.length })}
          </h4>
          <div className="space-y-2">
            {data.conflicts.map((c, i) => (
              <div key={i} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-text">
                  <span className="rounded bg-error/20 px-1.5 py-0.5 text-error">{c.demandA.id}</span>
                  <span className="text-text-muted">vs</span>
                  <span className="rounded bg-error/20 px-1.5 py-0.5 text-error">{c.demandB.id}</span>
                </div>
                <p className="mt-1 text-[11px] text-text-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicates */}
      {hasDuplicates && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-warning">
            <Copy size={12} aria-hidden="true" />
            {t('raDashboard.conflicts.duplicateCount', { count: data.duplicates.length })}
          </h4>
          <div className="space-y-1.5">
            {data.duplicates.map((d) => (
              <div key={d.id} className="rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2">
                <p className="text-xs font-medium text-text">{d.id} — {d.title}</p>
                <p className="mt-0.5 text-[10px] text-text-muted">
                  {t('raDashboard.conflicts.duplicateOf')} {d.duplicateOfId} — {d.duplicateOfTitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { ConflictsDuplicatesPanel }
export type { ConflictsDuplicatesPanelProps }
