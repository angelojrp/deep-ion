import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { BookOpen, AlertCircle, AlertTriangle, XOctagon } from 'lucide-react'
import type { BusinessRulesData } from '@domain/models/ra-dashboard'

interface BusinessRulesSummaryProps {
  data: BusinessRulesData
  className?: string
}

function BusinessRulesSummary({ data, className }: BusinessRulesSummaryProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]', className)}
      role="region"
      aria-label={t('raDashboard.businessRules.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <BookOpen size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">{t('raDashboard.businessRules.title')}</h3>
      </div>

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text">{data.total}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.businessRules.total')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-success-light border border-success-border px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-success">{data.active}</span>
          <span className="text-[10px] text-success uppercase tracking-wider">{t('raDashboard.businessRules.status.active')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-text-muted">{data.deprecated}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t('raDashboard.businessRules.status.deprecated')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-warning-light border border-warning-border px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-warning">{data.inReview}</span>
          <span className="text-[10px] text-warning uppercase tracking-wider">{t('raDashboard.businessRules.status.inReview')}</span>
        </div>
      </div>

      {/* RNs by module */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('raDashboard.businessRules.byModule')}
        </h4>
        <div className="space-y-1.5">
          {data.byModule.map((m) => {
            const maxCount = Math.max(...data.byModule.map((x) => x.count))
            return (
              <div key={m.module} className="flex items-center gap-2">
                <span className="w-28 truncate text-[11px] text-text-muted">{m.module}</span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded-sm bg-primary/60 transition-all"
                    style={{ width: `${(m.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-text">{m.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Without exception flow */}
      {data.withoutExceptionFlow.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <AlertCircle size={12} aria-hidden="true" />
            {t('raDashboard.businessRules.withoutFE', { count: data.withoutExceptionFlow.length })}
          </h4>
          <div className="space-y-1.5">
            {data.withoutExceptionFlow.map((rn) => (
              <div key={rn.id} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-1.5">
                <span className="text-xs font-medium text-text">{rn.id} — {rn.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orphaned RNs */}
      {data.orphaned.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-warning">
            <AlertTriangle size={12} aria-hidden="true" />
            {t('raDashboard.businessRules.orphaned', { count: data.orphaned.length })}
          </h4>
          <div className="space-y-1.5">
            {data.orphaned.map((rn) => (
              <div key={rn.id} className="rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-1.5">
                <span className="text-xs font-medium text-text">{rn.id} — {rn.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradictions */}
      {data.contradictions.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-error">
            <XOctagon size={12} aria-hidden="true" />
            {t('raDashboard.businessRules.contradictions', { count: data.contradictions.length })}
          </h4>
          <div className="space-y-1.5">
            {data.contradictions.map((c, i) => (
              <div key={i} className="rounded-[var(--radius-md)] border border-error-border bg-error-light px-3 py-2">
                <div className="flex items-center gap-1 text-xs font-medium text-text">
                  <span>{c.ruleA.id}</span>
                  <span className="text-text-muted">vs</span>
                  <span>{c.ruleB.id}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-text-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { BusinessRulesSummary }
export type { BusinessRulesSummaryProps }
