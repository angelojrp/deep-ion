import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import type { PrototypeSummaryData, UxQuestionsData } from '@domain/models/ux-dashboard'

interface GateUxPanelProps {
  prototypeSummary: PrototypeSummaryData
  uxQuestions: UxQuestionsData
  className?: string
}

function GateUxPanel({ prototypeSummary, uxQuestions, className }: GateUxPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('uxDashboard.gateUx.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('uxDashboard.gateUx.title')}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-[var(--radius-md)] bg-error-light border border-error-border px-3 py-2 text-center">
          <span className="block text-2xl font-bold text-error">{prototypeSummary.pendingGateUx}</span>
          <span className="text-[10px] font-medium text-error">{t('uxDashboard.gateUx.pending')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <Clock size={14} className="mx-auto mb-1 text-text-muted" aria-hidden="true" />
          <span className="block text-lg font-bold text-text">{prototypeSummary.avgTimeInGateDays}d</span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.gateUx.avgTime')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2 text-center">
          <CheckCircle2 size={14} className="mx-auto mb-1 text-success" aria-hidden="true" />
          <span className="block text-lg font-bold text-text">
            {(prototypeSummary.approvalFirstReviewRate * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-text-muted">{t('uxDashboard.gateUx.firstApproval')}</span>
        </div>
      </div>

      {/* Open questions */}
      {uxQuestions.openQuestions.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('uxDashboard.gateUx.openQuestions')} ({uxQuestions.openQuestions.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uxQuestions.openQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-start gap-2 rounded-[var(--radius-md)] bg-surface-2 px-3 py-2"
              >
                <span className="shrink-0 rounded bg-warning-light px-1.5 py-0.5 text-[10px] font-bold text-warning">
                  {q.id}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-text truncate">{q.question}</p>
                  <p className="text-[10px] text-text-muted">{q.prototypeName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avg resolution */}
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        <Clock size={12} aria-hidden="true" />
        <span>
          {t('uxDashboard.gateUx.avgResolution')}: {uxQuestions.avgResolutionTimeDays}d
        </span>
      </div>
    </div>
  )
}

export { GateUxPanel }
export type { GateUxPanelProps }
