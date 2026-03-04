import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { FileText, AlertCircle, Eye } from 'lucide-react'
import type { BriefsVisionData, BriefStatus } from '@domain/models/ba-dashboard'

interface BriefsSummaryProps {
  data: BriefsVisionData
}

const statusColors: Record<BriefStatus, string> = {
  draft: 'bg-warning-light text-warning border-warning-border',
  final: 'bg-success-light text-success border-success-border',
  refining: 'bg-info-light text-info border-info-border',
}

const statusBg: Record<BriefStatus, string> = {
  draft: 'bg-warning',
  final: 'bg-success',
  refining: 'bg-info',
}

function BriefsSummary({ data }: BriefsSummaryProps) {
  const { t } = useTranslation()

  const totalBriefs = data.totalDraft + data.totalFinal + data.totalRefining

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
      role="region"
      aria-label={t('baDashboard.briefs.title')}
    >
      <div className="mb-4 flex items-center gap-2">
        <FileText size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text">
          {t('baDashboard.briefs.title')}
        </h3>
      </div>

      {/* Status counts */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {(['draft', 'final', 'refining'] as BriefStatus[]).map((status) => {
          const count = status === 'draft' ? data.totalDraft
            : status === 'final' ? data.totalFinal
            : data.totalRefining
          return (
            <div
              key={status}
              className={cn(
                'rounded-[var(--radius-md)] border px-3 py-2 text-center',
                statusColors[status],
              )}
            >
              <span className="block text-2xl font-bold">{count}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {t(`baDashboard.briefs.status.${status}`)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Distribution bar */}
      {totalBriefs > 0 && (
        <div className="mb-4">
          <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={t('baDashboard.briefs.distribution')}>
            {(['draft', 'final', 'refining'] as BriefStatus[]).map((status) => {
              const count = status === 'draft' ? data.totalDraft
                : status === 'final' ? data.totalFinal
                : data.totalRefining
              return (
                <div
                  key={status}
                  className={cn('transition-all', statusBg[status])}
                  style={{ width: `${(count / totalBriefs) * 100}%` }}
                  title={`${t(`baDashboard.briefs.status.${status}`)}: ${count}`}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
          <span className="block text-lg font-bold text-text">{data.avgRefinementCycles.toFixed(1)}</span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.briefs.avgRefinementCycles')}</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
          <span className={cn('block text-lg font-bold', data.avgDaysInDraft > 5 ? 'text-warning' : 'text-text')}>
            {data.avgDaysInDraft.toFixed(1)}d
          </span>
          <span className="text-[10px] text-text-muted">{t('baDashboard.briefs.avgDaysInDraft')}</span>
        </div>
      </div>

      {/* Open questions list */}
      {data.briefsWithOpenQuestions.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <AlertCircle size={12} aria-hidden="true" />
            {t('baDashboard.briefs.openQuestions')}
          </h4>
          <div className="space-y-2">
            {data.briefsWithOpenQuestions.map((brief) => (
              <div
                key={brief.id}
                className={cn(
                  'rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-2',
                  brief.gate2Rejected && 'border-error-border bg-error-light',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text">{brief.title}</p>
                    <p className="text-[10px] text-text-muted">{brief.projectName}</p>
                  </div>
                  <span className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium border',
                    statusColors[brief.status],
                  )}>
                    {t(`baDashboard.briefs.status.${brief.status}`)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {brief.openQuestions.map((q) => (
                    <span key={q} className="rounded bg-warning-light px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      {q}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-text-muted">
                  <span>{t('baDashboard.briefs.completeness')}: {Math.round(brief.completenessScore * 100)}%</span>
                  <span>{t('baDashboard.briefs.cycles')}: {brief.refinementCycles}/{brief.maxRefinementCycles}</span>
                  {brief.gate2Rejected && (
                    <span className="font-medium text-error">{t('baDashboard.briefs.rejected')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Vision Docs */}
      {data.pendingVisionDocs.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
            <Eye size={12} aria-hidden="true" />
            {t('baDashboard.briefs.pendingVisionDocs')}
          </h4>
          <div className="space-y-1.5">
            {data.pendingVisionDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text">{doc.projectName}</p>
                  <div className="flex gap-1 mt-0.5">
                    {doc.openQuestions.map((q) => (
                      <span key={q} className="rounded bg-info-light px-1.5 py-0.5 text-[10px] font-medium text-info">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium border', statusColors[doc.status])}>
                  {t(`baDashboard.briefs.status.${doc.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { BriefsSummary }
export type { BriefsSummaryProps }
