import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import {
  CheckCircle2,
  AlertTriangle,
  Blocks,
  Wrench,
  ArrowRight,
} from 'lucide-react'
import type { ArchitectureCheckResult } from '@domain/models/project-kickoff'

interface ArchitectureCheckProps {
  result: ArchitectureCheckResult | null
  isChecking: boolean
  onCheck: () => void
  onConfigureModules?: () => void
  onProceed?: () => void
}

function ArchitectureCheck({
  result,
  isChecking,
  onCheck,
  onConfigureModules,
  onProceed,
}: ArchitectureCheckProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-4">
        <Blocks size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-text">
          {t('kickoff.archCheck.title')}
        </h3>
      </div>

      <p className="text-sm text-text-muted mb-6">
        {t('kickoff.archCheck.description')}
      </p>

      {!result && (
        <button
          type="button"
          onClick={onCheck}
          disabled={isChecking}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('kickoff.archCheck.checking')}
            </>
          ) : (
            <>
              <Blocks size={16} />
              {t('kickoff.archCheck.checkNow')}
            </>
          )}
        </button>
      )}

      {result && (
        <div className="space-y-4">
          {/* Check items */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {result.hasModules ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertTriangle size={16} className="text-error" />
              )}
              <span className={cn('text-sm', result.hasModules ? 'text-success' : 'text-error')}>
                {t('kickoff.archCheck.modules')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result.hasBlueprints ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertTriangle size={16} className="text-error" />
              )}
              <span className={cn('text-sm', result.hasBlueprints ? 'text-success' : 'text-error')}>
                {t('kickoff.archCheck.blueprints')}
              </span>
            </div>
          </div>

          {/* Missing items */}
          {result.missingItems.length > 0 && (
            <div className="rounded-lg border border-warning-border bg-warning-light/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-warning" />
                <span className="text-sm font-medium text-warning">
                  {t('kickoff.archCheck.missingTitle')}
                </span>
              </div>
              <ul className="space-y-1 ml-6">
                {result.missingItems.map((item, i) => (
                  <li key={i} className="text-xs text-text-muted list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!result.ready && onConfigureModules && (
              <button
                type="button"
                onClick={onConfigureModules}
                className="inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2.5 text-sm font-medium text-white hover:bg-warning/90 transition-colors"
              >
                <Wrench size={16} />
                {t('kickoff.archCheck.configureModules')}
              </button>
            )}
            {result.ready && onProceed && (
              <button
                type="button"
                onClick={onProceed}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                <ArrowRight size={16} />
                {t('kickoff.archCheck.proceed')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { ArchitectureCheck }
export type { ArchitectureCheckProps }
