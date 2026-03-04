import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import type { BusinessQuality as BusinessQualityType } from '@domain/models/po-dashboard'

interface BusinessQualityProps {
  data: BusinessQualityType
}

function BusinessQuality({ data }: BusinessQualityProps) {
  const { t } = useTranslation()

  const metrics = [
    {
      key: 'briefGatePassRate',
      value: data.briefGatePassRate,
      label: t('poDashboard.quality.briefPassRate'),
      target: 0.80,
      format: 'percent',
    },
    {
      key: 'avgConfidenceScore',
      value: data.avgConfidenceScore,
      label: t('poDashboard.quality.confidenceScore'),
      target: 0.65,
      format: 'percent',
    },
    {
      key: 'gherkinCompleteness',
      value: data.gherkinCompleteness,
      label: t('poDashboard.quality.gherkinComplete'),
      target: 0.90,
      format: 'percent',
    },
    {
      key: 'traceabilityCoverage',
      value: data.traceabilityCoverage,
      label: t('poDashboard.quality.traceability'),
      target: 0.80,
      format: 'percent',
    },
    {
      key: 'reworkRate',
      value: data.reworkRate,
      label: t('poDashboard.quality.reworkRate'),
      target: 0.10,
      format: 'percent',
      invertColor: true,
    },
  ]

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('poDashboard.quality.title')}
    >
      <h3 className="mb-4 text-base font-semibold text-text">
        {t('poDashboard.quality.title')}
      </h3>

      <div className="space-y-3">
        {metrics.map((m) => {
          const pct = Math.round(m.value * 100)
          const meetsTarget = m.invertColor ? m.value <= m.target : m.value >= m.target
          const targetPct = Math.round(m.target * 100)

          return (
            <div key={m.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text">{m.label}</span>
                <span className={cn('font-bold', meetsTarget ? 'text-success' : 'text-warning')}>
                  {pct}%
                </span>
              </div>
              <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    meetsTarget ? 'bg-success' : 'bg-warning',
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-text-muted/50"
                  style={{ left: `${targetPct}%` }}
                  title={`${t('poDashboard.quality.target')}: ${targetPct}%`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Open questions alert */}
      {data.openQuestionsCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-warning-light border border-warning-border px-3 py-2">
          <span className="text-warning text-base" aria-hidden="true">⚠</span>
          <span className="text-xs font-medium text-text">
            {t('poDashboard.quality.openQuestions', { count: data.openQuestionsCount })}
          </span>
        </div>
      )}
    </div>
  )
}

export { BusinessQuality }
