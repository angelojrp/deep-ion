import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import {
  CheckCircle2,
  XCircle,
  FileCode,
  Blocks,
} from 'lucide-react'
import type { ScaffoldResult } from '@domain/models/project-kickoff'

interface ScaffoldResultsProps {
  results: ScaffoldResult[]
}

function ScaffoldResults({ results }: ScaffoldResultsProps) {
  const { t } = useTranslation()

  if (results.length === 0) return null

  const totalFiles = results.reduce((sum, r) => sum + r.filesGenerated, 0)
  const allSuccess = results.every((r) => r.status === 'success')

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Blocks size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">
            {t('kickoff.scaffold.title')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {allSuccess ? (
            <CheckCircle2 size={16} className="text-success" />
          ) : (
            <XCircle size={16} className="text-error" />
          )}
          <span className="text-sm text-text-muted">
            {t('kickoff.scaffold.totalFiles', { count: totalFiles })}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {results.map((result) => (
          <div key={result.moduleId} className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-primary" />
                <span className="text-sm font-semibold text-text">{result.moduleName}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted border border-border">
                  {result.blueprintId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result.status === 'success' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 size={12} />
                    {t('kickoff.scaffold.success')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-error">
                    <XCircle size={12} />
                    {t('kickoff.scaffold.error')}
                  </span>
                )}
                <span className="text-xs text-text-muted">
                  {t('kickoff.scaffold.filesCount', { count: result.filesGenerated })}
                </span>
              </div>
            </div>

            {/* Log output */}
            <div className="rounded-lg bg-background border border-border p-3">
              <ul className="space-y-1">
                {result.log.map((line, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      'text-xs font-mono',
                      line.startsWith('✓') ? 'text-success' : 'text-text-muted',
                      line.startsWith('✗') && 'text-error',
                    )}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ScaffoldResults }
export type { ScaffoldResultsProps }
