import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { FileText, AlertCircle, Clock } from 'lucide-react'
import type { UseCasesData, UCStatus } from '@domain/models/ra-dashboard'

interface UseCasesSummaryProps {
  data: UseCasesData
  className?: string
}

const statusConfig: Record<UCStatus, { key: string; color: string; bg: string }> = {
  draft: { key: 'draft', color: 'bg-warning-light text-warning border-warning-border', bg: 'bg-warning' },
  validated: { key: 'validated', color: 'bg-success-light text-success border-success-border', bg: 'bg-success' },
  implemented: { key: 'implemented', color: 'bg-info-light text-info border-info-border', bg: 'bg-info' },
  archived: { key: 'archived', color: 'bg-surface-2 text-text-muted border-border', bg: 'bg-text-muted' },
}

function UseCasesSummary({ data, className }: UseCasesSummaryProps) {
  const { t } = useTranslation()

  const total = data.totalDraft + data.totalValidated + data.totalImplemented + data.totalArchived
  const statusCounts: { status: UCStatus; count: number }[] = [
    { status: 'draft', count: data.totalDraft },
    { status: 'validated', count: data.totalValidated },
    { status: 'implemented', count: data.totalImplemented },
    { status: 'archived', count: data.totalArchived },
  ]

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.useCases.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <FileText size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.useCases.title')}</h3>
      </div>

      {/* Status counts */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {statusCounts.map(({ status, count }) => (
          <div
            key={status}
            className={cn('rounded-[var(--radius-md)] border px-3 py-2 text-center', statusConfig[status].color)}
          >
            <span className="block text-2xl font-bold">{count}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {t(`raDashboard.useCases.status.${status}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={t('raDashboard.useCases.distribution')}>
            {statusCounts.map(({ status, count }) => (
              <div
                key={status}
                className={cn('transition-all', statusConfig[status].bg)}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${t(`raDashboard.useCases.status.${status}`)}: ${count}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
          <span className="block text-lg font-bold text-text">{data.avgModelingDays.toFixed(1)}d</span>
          <span className="text-[10px] text-text-muted">{t('raDashboard.useCases.avgModelingDays')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
          <span className="block text-lg font-bold text-text">{data.byModule.length}</span>
          <span className="text-[10px] text-text-muted">{t('raDashboard.useCases.modules')}</span>
        </div>
      </div>

      {/* UCs by module bar */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('raDashboard.useCases.byModule')}
        </h4>
        <div className="space-y-1.5">
          {data.byModule.map((m) => {
            const maxCount = Math.max(...data.byModule.map((x) => x.count))
            return (
              <div key={m.module} className="flex items-center gap-2">
                <span className="w-28 truncate text-[11px] text-text-muted">{m.module}</span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded-sm bg-primary/80 transition-all"
                    style={{ width: `${(m.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-text">{m.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* UCs without business rules — alert */}
      {data.withoutBusinessRules.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <AlertCircle size={12} aria-hidden="true" />
            {t('raDashboard.useCases.withoutRN', { count: data.withoutBusinessRules.length })}
          </h4>
          <div className="space-y-1.5">
            {data.withoutBusinessRules.slice(0, 5).map((uc) => (
              <div key={uc.id} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">{uc.id} — {uc.title}</span>
                  <span className="text-[10px] text-text-muted">{uc.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently modified */}
      {data.recentlyModified.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <Clock size={12} aria-hidden="true" />
            {t('raDashboard.useCases.recentlyModified')}
          </h4>
          <div className="space-y-1.5">
            {data.recentlyModified.map((uc) => (
              <div key={uc.id} className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text">{uc.id} — {uc.title}</p>
                    <p className="text-[10px] text-text-muted">{uc.modifiedBy}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-text-muted">
                    {uc.modifiedAt ? new Date(uc.modifiedAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { UseCasesSummary }
export type { UseCasesSummaryProps }
