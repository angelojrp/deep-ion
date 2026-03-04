import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Accessibility, AlertCircle, Keyboard, Tag } from 'lucide-react'
import type { AccessibilityData } from '@domain/models/ux-dashboard'

interface AccessibilityPanelProps {
  data: AccessibilityData
  className?: string
}

const violationSeverityColors = {
  critical: 'bg-error-light text-error border-error-border',
  major: 'bg-warning-light text-warning border-warning-border',
  minor: 'bg-info-light text-info border-info-border',
}

const violationTypeLabels: Record<string, string> = {
  contrast: 'Contraste',
  'alt-text': 'Texto Alt',
  focus: 'Foco',
  aria: 'ARIA',
  other: 'Outro',
}

function AccessibilityPanel({ data, className }: AccessibilityPanelProps) {
  const { t } = useTranslation()

  const scoreColor = data.avgWcagScore >= 90 ? 'text-success' : data.avgWcagScore >= 70 ? 'text-warning' : 'text-error'
  const keyboardPercent = data.totalScreens > 0 ? Math.round((data.keyboardNavValidated / data.totalScreens) * 100) : 0
  const ariaPercent = data.totalScreens > 0 ? Math.round((data.ariaLandmarksValidated / data.totalScreens) * 100) : 0

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.accessibility.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Accessibility size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.accessibility.title')}
        </h3>
      </div>

      {/* WCAG score */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className={cn('text-3xl font-bold', scoreColor)}>{data.avgWcagScore}%</span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.accessibility.wcagScore')}</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Keyboard size={12} className="text-text-muted" aria-hidden="true" />
            <span className="text-text-muted">{t('uxDashboard.accessibility.keyboardNav')}</span>
            <span className="ml-auto font-bold text-text">{keyboardPercent}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Tag size={12} className="text-text-muted" aria-hidden="true" />
            <span className="text-text-muted">{t('uxDashboard.accessibility.ariaLandmarks')}</span>
            <span className="ml-auto font-bold text-text">{ariaPercent}%</span>
          </div>
        </div>
      </div>

      {/* Screens without check */}
      {data.screensWithoutA11yCheck > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2 text-xs text-warning">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{t('uxDashboard.accessibility.withoutCheck', { count: data.screensWithoutA11yCheck })}</span>
        </div>
      )}

      {/* Violations */}
      {data.violations.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.accessibility.violations')} ({data.violations.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.violations.map((v) => (
              <div
                key={v.id}
                className={cn(
                  'rounded-[var(--radius-md)] border px-3 py-2',
                  violationSeverityColors[v.severity],
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{v.screenName}</span>
                  <span className="rounded bg-white/30 px-1.5 py-0.5 text-[10px] font-bold">
                    {violationTypeLabels[v.type] ?? v.type}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] opacity-80">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { AccessibilityPanel }
export type { AccessibilityPanelProps }
