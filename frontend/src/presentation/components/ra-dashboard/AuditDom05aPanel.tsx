import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { ShieldCheck, XCircle, TrendingUp } from 'lucide-react'
import type { AuditDom05aData } from '@domain/models/ra-dashboard'

interface AuditDom05aPanelProps {
  data: AuditDom05aData
  className?: string
}

function AuditDom05aPanel({ data, className }: AuditDom05aPanelProps) {
  const { t } = useTranslation()

  const approvalPct = Math.round(data.gate2ApprovalRate * 100)

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.audit.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.audit.title')}</h3>
      </div>

      {/* Gate 2 approval rate */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-text-muted">{t('raDashboard.audit.gate2Approval')}</span>
          <span className={cn(
            'text-sm font-bold',
            approvalPct >= 85 ? 'text-success' : approvalPct >= 70 ? 'text-warning' : 'text-error',
          )}>
            {approvalPct}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              approvalPct >= 85 ? 'bg-success' : approvalPct >= 70 ? 'bg-warning' : 'bg-error',
            )}
            style={{ width: `${approvalPct}%` }}
          />
        </div>
      </div>

      {/* Last audit result */}
      <div className="mb-4 rounded-[var(--radius-md)] bg-surface-2 p-3">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('raDashboard.audit.lastResult')}
        </h4>
        <p className="text-xs font-medium text-text">{data.lastAuditResult.demandName}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-text-muted">{t('raDashboard.audit.completeness')}</span>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className={cn('h-full rounded-full', data.lastAuditResult.completeness >= 0.85 ? 'bg-success' : 'bg-warning')}
                  style={{ width: `${data.lastAuditResult.completeness * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-text">{Math.round(data.lastAuditResult.completeness * 100)}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-text-muted">{t('raDashboard.audit.consistency')}</span>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className={cn('h-full rounded-full', data.lastAuditResult.consistency >= 0.9 ? 'bg-success' : 'bg-warning')}
                  style={{ width: `${data.lastAuditResult.consistency * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-text">{Math.round(data.lastAuditResult.consistency * 100)}%</span>
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-[10px] text-text-muted">
          {new Date(data.lastAuditResult.auditedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Compliance trend */}
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <TrendingUp size={12} aria-hidden="true" />
          {t('raDashboard.audit.complianceTrend')}
        </h4>
        <div className="flex items-end gap-1 h-16">
          {data.complianceTrend.map((point) => {
            const pct = point.approvalRate * 100
            return (
              <div key={point.week} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-medium text-text">{Math.round(pct)}%</span>
                <div
                  className={cn(
                    'w-full rounded-t-sm transition-all',
                    pct >= 85 ? 'bg-success' : pct >= 70 ? 'bg-warning' : 'bg-error',
                  )}
                  style={{ height: `${pct * 0.4}px` }}
                  title={`${point.week}: ${Math.round(pct)}%`}
                />
                <span className="text-[8px] text-text-muted">{point.week.replace('2026-', '')}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Failed items */}
      {data.failedItems.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <XCircle size={12} aria-hidden="true" />
            {t('raDashboard.audit.failedItems', { count: data.failedItems.length })}
          </h4>
          <div className="space-y-1.5">
            {data.failedItems.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-1.5">
                <p className="text-xs font-medium text-text">{item.name}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { AuditDom05aPanel }
export type { AuditDom05aPanelProps }
