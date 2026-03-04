import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Table, AlertTriangle } from 'lucide-react'
import type { PendingPrototype, PrototypeStatus } from '@domain/models/ux-dashboard'

interface PendingPrototypesTableProps {
  prototypes: PendingPrototype[]
  className?: string
}

const statusBadge: Record<PrototypeStatus, string> = {
  draft: 'bg-warning-light text-warning border-warning-border',
  final: 'bg-info-light text-info border-info-border',
  approved: 'bg-success-light text-success border-success-border',
  rejected: 'bg-error-light text-error border-error-border',
}

function PendingPrototypesTable({ prototypes, className }: PendingPrototypesTableProps) {
  const { t } = useTranslation()

  if (prototypes.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.pendingPrototypes.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Table size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.pendingPrototypes.title')}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.prototype')}</th>
              <th className="py-2 text-left font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.uc')}</th>
              <th className="py-2 text-center font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.status')}</th>
              <th className="py-2 text-center font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.cycle')}</th>
              <th className="py-2 text-center font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.platform')}</th>
              <th className="py-2 text-center font-medium text-text-muted">WCAG</th>
              <th className="py-2 text-right font-medium text-text-muted">{t('uxDashboard.pendingPrototypes.action')}</th>
            </tr>
          </thead>
          <tbody>
            {prototypes.map((proto) => {
              const isLastCycle = proto.cycle >= proto.maxCycles
              return (
                <tr key={proto.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                  <td className="py-2.5 font-medium text-text">{proto.id}</td>
                  <td className="py-2.5">
                    <div>
                      <span className="text-text">{proto.ucId}</span>
                      <p className="text-[10px] text-text-muted truncate max-w-[160px]">{proto.ucName}</p>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={cn(
                      'inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase',
                      statusBadge[proto.status],
                    )}>
                      {t(`uxDashboard.prototypes.status.${proto.status}`)}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={cn(
                      'font-medium',
                      isLastCycle ? 'text-error' : 'text-text',
                    )}>
                      {proto.cycle}/{proto.maxCycles}
                    </span>
                    {isLastCycle && (
                      <AlertTriangle size={10} className="ml-1 inline text-error" aria-label={t('uxDashboard.pendingPrototypes.lastCycle')} />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text">
                      {proto.platform}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={cn(
                      'font-medium',
                      proto.wcagScore >= 90 ? 'text-success' : proto.wcagScore >= 70 ? 'text-warning' : 'text-error',
                    )}>
                      {proto.wcagScore}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    {proto.status === 'draft' && !isLastCycle && (
                      <button
                        type="button"
                        className="rounded-[var(--radius-md)] bg-primary px-2.5 py-1 text-[10px] font-medium text-white hover:bg-primary-dark transition-colors"
                        aria-label={`${t('uxDashboard.pendingPrototypes.review')} ${proto.id}`}
                      >
                        {t('uxDashboard.pendingPrototypes.review')}
                      </button>
                    )}
                    {proto.status === 'draft' && isLastCycle && (
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          className="rounded-[var(--radius-md)] bg-success px-2.5 py-1 text-[10px] font-medium text-white hover:bg-success/90 transition-colors"
                          aria-label={`${t('uxDashboard.pendingPrototypes.approve')} ${proto.id}`}
                        >
                          {t('uxDashboard.pendingPrototypes.approve')}
                        </button>
                        <button
                          type="button"
                          className="rounded-[var(--radius-md)] bg-error px-2.5 py-1 text-[10px] font-medium text-white hover:bg-error/90 transition-colors"
                          aria-label={`${t('uxDashboard.pendingPrototypes.escalate')} ${proto.id}`}
                        >
                          {t('uxDashboard.pendingPrototypes.escalate')}
                        </button>
                      </div>
                    )}
                    {proto.status === 'rejected' && (
                      <button
                        type="button"
                        className="rounded-[var(--radius-md)] bg-surface-2 border border-border px-2.5 py-1 text-[10px] font-medium text-text hover:bg-surface-3 transition-colors"
                        aria-label={`${t('uxDashboard.pendingPrototypes.viewFeedback')} ${proto.id}`}
                      >
                        {t('uxDashboard.pendingPrototypes.viewFeedback')}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { PendingPrototypesTable }
export type { PendingPrototypesTableProps }
