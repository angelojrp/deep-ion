import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { RefreshCw, Brain } from 'lucide-react'
import type { FeedbackLoopData } from '@domain/models/ux-dashboard'

interface FeedbackLoopPanelProps {
  data: FeedbackLoopData
  className?: string
}

function FeedbackLoopPanel({ data, className }: FeedbackLoopPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.feedbackLoop.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <RefreshCw size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.feedbackLoop.title')}
        </h3>
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className="block text-lg font-bold text-text">{data.avgDraftToFinalDays}d</span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.feedbackLoop.draftToFinal')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className={cn(
            'block text-lg font-bold',
            data.avgRoundTrips <= 1.5 ? 'text-success' : 'text-warning',
          )}>
            {data.avgRoundTrips.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.feedbackLoop.roundTrips')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <span className={cn(
            'block text-lg font-bold',
            data.approvalFirstReviewRate >= 0.7 ? 'text-success' : data.approvalFirstReviewRate >= 0.5 ? 'text-warning' : 'text-error',
          )}>
            {(data.approvalFirstReviewRate * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.feedbackLoop.firstApproval')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <Brain size={14} className="mx-auto mb-0.5 text-primary" aria-hidden="true" />
          <span className={cn(
            'block text-lg font-bold',
            data.aiQualityScore >= 80 ? 'text-success' : data.aiQualityScore >= 60 ? 'text-warning' : 'text-error',
          )}>
            {data.aiQualityScore}
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.feedbackLoop.aiQuality')}</span>
        </div>
      </div>

      {/* Rejection bar chart */}
      {data.rejectionPatterns.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.feedbackLoop.rejectionPatterns')}
          </h4>
          <div className="space-y-2">
            {data.rejectionPatterns.map((pattern) => (
              <div key={pattern.reason}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-text">{pattern.reason}</span>
                  <span className="text-xs font-medium text-text-muted">{pattern.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pattern.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { FeedbackLoopPanel }
export type { FeedbackLoopPanelProps }
