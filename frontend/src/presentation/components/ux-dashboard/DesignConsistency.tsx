import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Palette, Check, X, AlertTriangle } from 'lucide-react'
import type { DesignConsistencyData } from '@domain/models/ux-dashboard'

interface DesignConsistencyProps {
  data: DesignConsistencyData
  className?: string
}

const severityColors = {
  high: 'bg-error-light text-error border-error-border',
  medium: 'bg-warning-light text-warning border-warning-border',
  low: 'bg-info-light text-info border-info-border',
}

function DesignConsistency({ data, className }: DesignConsistencyProps) {
  const { t } = useTranslation()

  const reusePercent = Math.round(data.componentReuseRate * 100)

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.consistency.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Palette size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.consistency.title')}
        </h3>
      </div>

      {/* Reuse rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">{t('uxDashboard.consistency.reuseRate')}</span>
          <span className={cn('text-xs font-bold', reusePercent >= 80 ? 'text-success' : 'text-warning')}>
            {reusePercent}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              reusePercent >= 80 ? 'bg-success' : reusePercent >= 60 ? 'bg-warning' : 'bg-error',
            )}
            style={{ width: `${reusePercent}%` }}
            role="progressbar"
            aria-valuenow={reusePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('uxDashboard.consistency.reuseRate')}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-4 space-y-1.5">
        {[
          { label: t('uxDashboard.consistency.colorPalette'), ok: data.colorPaletteCompliant },
          { label: t('uxDashboard.consistency.typography'), ok: data.typographyCompliant },
          { label: t('uxDashboard.consistency.icons'), ok: data.iconsStandardized },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            {item.ok ? (
              <Check size={14} className="text-success" aria-hidden="true" />
            ) : (
              <X size={14} className="text-error" aria-hidden="true" />
            )}
            <span className={item.ok ? 'text-text' : 'text-error'}>{item.label}</span>
          </div>
        ))}
        {data.navigationInconsistencies > 0 && (
          <div className="flex items-center gap-2 text-xs text-warning">
            <AlertTriangle size={14} aria-hidden="true" />
            <span>{t('uxDashboard.consistency.navInconsistencies', { count: data.navigationInconsistencies })}</span>
          </div>
        )}
      </div>

      {/* Deviations */}
      {data.designSystemDeviations.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.consistency.deviations')} ({data.designSystemDeviations.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {data.designSystemDeviations.map((dev) => (
              <div
                key={dev.id}
                className={cn(
                  'rounded-[var(--radius-md)] border px-3 py-2',
                  severityColors[dev.severity],
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{dev.component}</span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {dev.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] opacity-80">{dev.deviation}</p>
                <p className="text-[10px] opacity-60">{dev.prototypeName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { DesignConsistency }
export type { DesignConsistencyProps }
