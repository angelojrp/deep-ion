import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Landmark, AlertCircle, Clock } from 'lucide-react'
import type { RequirementsDebtData } from '@domain/models/ra-dashboard'

interface RequirementsDebtPanelProps {
  data: RequirementsDebtData
  className?: string
}

function RequirementsDebtPanel({ data, className }: RequirementsDebtPanelProps) {
  const { t } = useTranslation()

  const debtPct = Math.round(data.debtIndex * 100)

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.debt.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Landmark size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.debt.title')}</h3>
      </div>

      {/* Debt index */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className={cn(
          'rounded-[var(--radius-md)] border px-3 py-2 text-center',
          debtPct > 20 ? 'border-error-border bg-error-light' : debtPct > 10 ? 'border-warning-border bg-warning-light' : 'border-success-border bg-success-light',
        )}>
          <span className={cn(
            'block text-2xl font-bold',
            debtPct > 20 ? 'text-error' : debtPct > 10 ? 'text-warning' : 'text-success',
          )}>
            {debtPct}%
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.debt.debtIndex')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.toDetail.length}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.debt.toDetail')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.placeholderRules.length}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.debt.placeholders')}</span>
        </div>
      </div>

      {/* Items to detail */}
      {data.toDetail.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <AlertCircle size={12} aria-hidden="true" />
            {t('raDashboard.debt.toDetailTitle')}
          </h4>
          <div className="space-y-1.5">
            {data.toDetail.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5">
                <span className="text-xs text-text">
                  <span className="font-medium">{item.id}</span> — {item.title}
                </span>
                <span className={cn(
                  'shrink-0 text-[10px] font-medium',
                  (item.daysOpen ?? 0) > 10 ? 'text-error' : 'text-warning',
                )}>
                  {item.daysOpen}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder rules */}
      {data.placeholderRules.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-warning">
            {t('raDashboard.debt.placeholderRules')}
          </h4>
          <div className="space-y-1.5">
            {data.placeholderRules.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-1.5">
                <p className="text-xs font-medium text-text">{item.id} — {item.title}</p>
                <p className="mt-0.5 text-[10px] text-text-muted font-mono">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incomplete over X days */}
      {data.incompleteOverXDays.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <Clock size={12} aria-hidden="true" />
            {t('raDashboard.debt.incompleteOverDays')}
          </h4>
          <div className="space-y-1.5">
            {data.incompleteOverXDays.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-1.5">
                <span className="text-xs text-text">
                  <span className="font-medium">{item.id}</span> — {item.title}
                </span>
                <span className={cn(
                  'shrink-0 text-[10px] font-medium',
                  (item.daysIncomplete ?? 0) > 10 ? 'text-error' : 'text-warning',
                )}>
                  {item.daysIncomplete}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { RequirementsDebtPanel }
export type { RequirementsDebtPanelProps }
