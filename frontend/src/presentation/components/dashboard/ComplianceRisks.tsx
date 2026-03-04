import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { ComplianceRisks as ComplianceRisksType, RiskSeverity, DependencyStatus } from '@domain/models/po-dashboard'

interface ComplianceRisksProps {
  data: ComplianceRisksType
}

const severityStyles: Record<RiskSeverity, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-error/10', text: 'text-error', label: '●' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', label: '●' },
  low: { bg: 'bg-success/10', text: 'text-success', label: '●' },
}

const depStatusStyles: Record<DependencyStatus, { bg: string; text: string }> = {
  healthy: { bg: 'bg-success', text: 'text-success' },
  degraded: { bg: 'bg-warning', text: 'text-warning' },
  blocked: { bg: 'bg-error', text: 'text-error' },
}

function ComplianceRisks({ data }: ComplianceRisksProps) {
  const { t } = useTranslation()

  const complianceIndicators = [
    {
      key: 'lgpd',
      label: t('poDashboard.compliance.lgpdFlags'),
      value: data.activeLgpdFlags,
      variant: data.activeLgpdFlags > 0 ? 'warning' : 'success',
    },
    {
      key: 'audit',
      label: t('poDashboard.compliance.auditedRecords'),
      value: `${Math.round(data.auditedDecisionRecordsPercent * 100)}%`,
      variant: data.auditedDecisionRecordsPercent >= 0.90 ? 'success' : 'warning',
    },
    {
      key: 'violations',
      label: t('poDashboard.compliance.rnViolations'),
      value: data.undetectedRnViolations,
      variant: data.undetectedRnViolations === 0 ? 'success' : 'error',
    },
    {
      key: 't3pending',
      label: t('poDashboard.compliance.t3Pending'),
      value: data.t3PendingGateOver48h,
      variant: data.t3PendingGateOver48h === 0 ? 'success' : 'error',
    },
    {
      key: 'arch',
      label: t('poDashboard.compliance.archViolations'),
      value: `${Math.round(data.archConformanceViolationsPercent * 100)}%`,
      variant: data.archConformanceViolationsPercent <= 0.05 ? 'success' : 'warning',
    },
  ] as const

  type Variant = 'success' | 'warning' | 'error'
  const variantIcon: Record<Variant, string> = { success: '✓', warning: '⚠', error: '✗' }
  const variantColor: Record<Variant, string> = {
    success: 'text-success bg-success-light border-success-border',
    warning: 'text-warning bg-warning-light border-warning-border',
    error: 'text-error bg-error-light border-error-border',
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.compliance.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.compliance.title')}
      </h3>

      {/* Compliance traffic lights */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {complianceIndicators.map((ind) => (
          <div
            key={ind.key}
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2',
              variantColor[ind.variant as Variant],
            )}
          >
            <span className="text-base font-bold" aria-hidden="true">
              {variantIcon[ind.variant as Variant]}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-text">{ind.label}</span>
              <span className={cn('block text-sm font-bold', `${(variantColor[ind.variant as Variant]).split(' ')[0]}`)}>
                {ind.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Business risks */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.compliance.businessRisks')}
        </h4>
        <div className="space-y-1.5">
          {data.businessRisks.map((risk) => {
            const sev = severityStyles[risk.severity]
            return (
              <div
                key={risk.id}
                className={cn('flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2', sev.bg)}
              >
                <span className={cn('text-sm', sev.text)} aria-hidden="true">{sev.label}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-muted">{risk.id}</span>
                    <span className="truncate text-xs font-medium text-text">{risk.name}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {t('poDashboard.compliance.probability')}: {Math.round(risk.probability * 100)}%
                    {' · '}
                    {t(`poDashboard.compliance.status.${risk.status}`)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* External dependencies */}
      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('poDashboard.compliance.dependencies')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.externalDependencies.map((dep) => {
            const st = depStatusStyles[dep.status]
            return (
              <div
                key={dep.name}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1"
              >
                <span className={cn('inline-block h-2 w-2 rounded-full', st.bg)} aria-hidden="true" />
                <span className="text-xs font-medium text-text">{dep.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { ComplianceRisks }
