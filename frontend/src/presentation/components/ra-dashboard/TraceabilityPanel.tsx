import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Network, CheckCircle2, AlertTriangle, XCircle, LinkIcon } from 'lucide-react'
import type { TraceabilityData, TraceabilityStatus } from '@domain/models/ra-dashboard'

interface TraceabilityPanelProps {
  data: TraceabilityData
  className?: string
}

const statusIcon: Record<TraceabilityStatus, { Icon: typeof CheckCircle2; color: string }> = {
  complete: { Icon: CheckCircle2, color: 'text-success' },
  partial: { Icon: AlertTriangle, color: 'text-warning' },
  missing: { Icon: XCircle, color: 'text-error' },
}

function TraceabilityPanel({ data, className }: TraceabilityPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.traceability.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Network size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.traceability.title')}</h3>
      </div>

      {/* Coverage KPI */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-text-muted">{t('raDashboard.traceability.coverage')}</span>
            <span className={cn(
              'text-sm font-bold',
              data.coveragePercent >= 80 ? 'text-success' : data.coveragePercent >= 60 ? 'text-warning' : 'text-error',
            )}>
              {data.coveragePercent}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                data.coveragePercent >= 80 ? 'bg-success' : data.coveragePercent >= 60 ? 'bg-warning' : 'bg-error',
              )}
              style={{ width: `${data.coveragePercent}%` }}
            />
          </div>
        </div>
        {data.brokenLinks.length > 0 && (
          <div className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-1.5 text-center">
            <span className="block text-lg font-bold text-error">{data.brokenLinks.length}</span>
            <span className="text-[10px] text-error">{t('raDashboard.traceability.brokenLinks')}</span>
          </div>
        )}
      </div>

      {/* Coverage by module — heatmap */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('raDashboard.traceability.byModule')}
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.byModule.map((m) => (
            <div
              key={m.module}
              className={cn(
                'rounded-[var(--radius-md)] border px-3 py-2 text-center',
                m.coverage >= 85 ? 'border-success-border bg-success-light' :
                m.coverage >= 70 ? 'border-warning-border bg-warning-light' :
                'border-error-border bg-error-light',
              )}
            >
              <span className={cn(
                'block text-lg font-bold',
                m.coverage >= 85 ? 'text-success' : m.coverage >= 70 ? 'text-warning' : 'text-error',
              )}>
                {m.coverage}%
              </span>
              <span className="text-[10px] text-text-muted truncate block">{m.module}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Traceability matrix */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('raDashboard.traceability.matrix')}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1.5 text-left font-medium text-text-muted">{t('raDashboard.traceability.uc')}</th>
                <th className="py-1.5 text-center font-medium text-text-muted">{t('raDashboard.traceability.rn')}</th>
                <th className="py-1.5 text-center font-medium text-text-muted">{t('raDashboard.traceability.criteria')}</th>
                <th className="py-1.5 text-center font-medium text-text-muted">{t('raDashboard.traceability.code')}</th>
                <th className="py-1.5 text-center font-medium text-text-muted">{t('raDashboard.traceability.statusLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => {
                const { Icon, color } = statusIcon[row.status]
                return (
                  <tr key={row.ucId} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 text-text">
                      <span className="font-medium">{row.ucId}</span>
                      <span className="hidden sm:inline text-text-muted"> — {row.ucTitle}</span>
                    </td>
                    <td className="py-1.5 text-center">
                      {row.hasRN ? (
                        <CheckCircle2 size={14} className="mx-auto text-success" aria-label={t('common.yes')} />
                      ) : (
                        <XCircle size={14} className="mx-auto text-error" aria-label={t('common.no')} />
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      {row.hasCriteria ? (
                        <CheckCircle2 size={14} className="mx-auto text-success" aria-label={t('common.yes')} />
                      ) : (
                        <XCircle size={14} className="mx-auto text-error" aria-label={t('common.no')} />
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      {row.hasCode ? (
                        <CheckCircle2 size={14} className="mx-auto text-success" aria-label={t('common.yes')} />
                      ) : (
                        <span className="mx-auto block text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      <Icon size={14} className={cn('mx-auto', color)} aria-label={row.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broken links */}
      {data.brokenLinks.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <LinkIcon size={12} aria-hidden="true" />
            {t('raDashboard.traceability.brokenLinksTitle')}
          </h4>
          <div className="space-y-1.5">
            {data.brokenLinks.map((bl) => (
              <div key={`${bl.sourceId}-${bl.targetId}`} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-1.5">
                <div className="flex items-center gap-1 text-xs text-text">
                  <span className="font-medium">{bl.sourceId}</span>
                  <span className="text-text-muted">→</span>
                  <span className="font-medium">{bl.targetId}</span>
                </div>
                <p className="text-[10px] text-text-muted">{bl.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { TraceabilityPanel }
export type { TraceabilityPanelProps }
