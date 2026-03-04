import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Monitor, Tablet, Smartphone, LayoutGrid } from 'lucide-react'
import type { ScreenCoverageData } from '@domain/models/ux-dashboard'

interface ScreenCoverageProps {
  data: ScreenCoverageData
  className?: string
}

function ScreenCoverage({ data, className }: ScreenCoverageProps) {
  const { t } = useTranslation()

  const ucCoveragePercent = data.ucsWithPrototype + data.ucsWithoutPrototype > 0
    ? Math.round((data.ucsWithPrototype / (data.ucsWithPrototype + data.ucsWithoutPrototype)) * 100)
    : 0

  const screenProgress = data.totalScreensPlanned > 0
    ? Math.round((data.totalScreensGenerated / data.totalScreensPlanned) * 100)
    : 0

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.coverage.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <LayoutGrid size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.coverage.title')}
        </h3>
      </div>

      {/* UC coverage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">{t('uxDashboard.coverage.ucCoverage')}</span>
          <span className="text-xs font-bold text-text">{ucCoveragePercent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              ucCoveragePercent >= 80 ? 'bg-success' : ucCoveragePercent >= 50 ? 'bg-warning' : 'bg-error',
            )}
            style={{ width: `${ucCoveragePercent}%` }}
            role="progressbar"
            aria-valuenow={ucCoveragePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('uxDashboard.coverage.ucCoverage')}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-text-muted">
          <span>{t('uxDashboard.coverage.withPrototype')}: {data.ucsWithPrototype}</span>
          <span>{t('uxDashboard.coverage.withoutPrototype')}: {data.ucsWithoutPrototype}</span>
        </div>
      </div>

      {/* Screen progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">{t('uxDashboard.coverage.screenProgress')}</span>
          <span className="text-xs font-bold text-text">{data.totalScreensGenerated}/{data.totalScreensPlanned}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${screenProgress}%` }}
            role="progressbar"
            aria-valuenow={screenProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('uxDashboard.coverage.screenProgress')}
          />
        </div>
      </div>

      {/* Mobile alert */}
      {data.screensWithoutMobile > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-warning-border bg-warning-light px-3 py-2 text-xs text-warning">
          <Smartphone size={14} aria-hidden="true" />
          <span>
            {t('uxDashboard.coverage.withoutMobile', { count: data.screensWithoutMobile })}
          </span>
        </div>
      )}

      {/* Breakpoint coverage table */}
      {data.breakpointCoverage.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.coverage.breakpoints')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1.5 text-left font-medium text-text-muted">{t('uxDashboard.coverage.prototype')}</th>
                  <th className="py-1.5 text-center font-medium text-text-muted" aria-label="Desktop"><Monitor size={12} className="mx-auto" /></th>
                  <th className="py-1.5 text-center font-medium text-text-muted" aria-label="Tablet"><Tablet size={12} className="mx-auto" /></th>
                  <th className="py-1.5 text-center font-medium text-text-muted" aria-label="Mobile"><Smartphone size={12} className="mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {data.breakpointCoverage.map((bp) => (
                  <tr key={bp.prototypeId} className="border-b border-border/50">
                    <td className="py-1.5 text-text truncate max-w-[140px]">{bp.prototypeName}</td>
                    <td className="py-1.5 text-center">{bp.desktop ? '✅' : '❌'}</td>
                    <td className="py-1.5 text-center">{bp.tablet ? '✅' : '❌'}</td>
                    <td className="py-1.5 text-center">{bp.mobile ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export { ScreenCoverage }
export type { ScreenCoverageProps }
