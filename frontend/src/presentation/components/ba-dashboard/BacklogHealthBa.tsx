import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Archive, AlertTriangle, Copy, UserX } from 'lucide-react'
import type { BacklogHealthBaData } from '@domain/models/ba-dashboard'

interface BacklogHealthBaProps {
  data: BacklogHealthBaData
}

function BacklogHealthBa({ data }: BacklogHealthBaProps) {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.backlog.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Archive size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.backlog.title')}
        </h3>
      </div>

      {/* Summary metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
          <span className="block text-2xl font-bold text-text">{data.avgAgeDays}d</span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.backlog.avgAge')}</span>
        </div>
        <div className={cn('rounded-[var(--radius-md)] px-3 py-2', data.staleDemandsCount > 0 ? 'bg-warning-light' : 'bg-success-light')}>
          <span className={cn('block text-2xl font-bold', data.staleDemandsCount > 0 ? 'text-warning' : 'text-success')}>
            {data.staleDemandsCount}
          </span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.backlog.stale')}</span>
        </div>
      </div>

      {/* Stale demands */}
      {data.staleDemands.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <AlertTriangle size={12} aria-hidden="true" />
            {t('baDashboard.backlog.staleDemands')}
          </h4>
          <div className="space-y-1.5">
            {data.staleDemands.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text">{d.title}</p>
                  <p className="text-[10px] text-text-muted">{d.id}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-warning">{d.ageDays}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicates detected */}
      {data.duplicatesDetected.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <Copy size={12} aria-hidden="true" />
            {t('baDashboard.backlog.duplicates')}
          </h4>
          <div className="space-y-1.5">
            {data.duplicatesDetected.map((d) => (
              <div key={d.id} className="rounded-[var(--radius-md)] border border-info-border bg-info-light px-3 py-2">
                <p className="text-xs font-medium text-text">{d.title}</p>
                <p className="text-[10px] text-text-muted">
                  {t('baDashboard.backlog.duplicateOf')}: {d.duplicateOfTitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive stakeholders */}
      {data.inactiveStakeholders.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <UserX size={12} aria-hidden="true" />
            {t('baDashboard.backlog.inactiveStakeholders')}
          </h4>
          <div className="space-y-1.5">
            {data.inactiveStakeholders.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-text">{s.name}</p>
                  <p className="text-[10px] text-text-muted">{s.role}</p>
                </div>
                <span className="text-xs font-bold text-text-muted">{s.lastActivityDays}d</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { BacklogHealthBa }
export type { BacklogHealthBaProps }
