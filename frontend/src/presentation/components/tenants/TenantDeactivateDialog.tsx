import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface TenantDeactivateDialogProps {
  open: boolean
  tenantName: string
  membersCount: number
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

function TenantDeactivateDialog({
  open,
  tenantName,
  membersCount,
  onConfirm,
  onCancel,
}: TenantDeactivateDialogProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleConfirm() {
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch {
      setError(t('tenants.error.deactivate'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="deactivate-dialog-title">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-[var(--radius-lg)] bg-surface p-6 shadow-xl border border-border">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        {/* Title */}
        <h2 id="deactivate-dialog-title" className="text-lg font-semibold text-center text-text mb-2">
          {t('tenants.deactivate.title')}
        </h2>

        {/* Message */}
        <p
          className="text-sm text-center text-text-secondary mb-2"
          dangerouslySetInnerHTML={{
            __html: t('tenants.deactivate.message', { name: tenantName }),
          }}
        />

        {/* Warning */}
        <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 mb-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {t('tenants.deactivate.warning', { count: membersCount })}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 mb-4" role="alert">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium',
              'border border-border bg-surface text-text',
              'hover:bg-muted transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {t('tenants.deactivate.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium',
              'bg-red-600 text-white hover:bg-red-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isSubmitting ? t('tenants.deactivate.confirming') : t('tenants.deactivate.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

TenantDeactivateDialog.displayName = 'TenantDeactivateDialog'

export { TenantDeactivateDialog }
export type { TenantDeactivateDialogProps }
