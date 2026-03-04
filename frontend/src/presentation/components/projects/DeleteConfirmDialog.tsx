import { useTranslation } from 'react-i18next'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface DeleteConfirmDialogProps {
  open: boolean
  projectName: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmDialog({ open, projectName, isPending, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-lg)] mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-error-light">
            <AlertTriangle size={20} className="text-error" />
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-base font-semibold text-text">
              {t('projectsPage.deleteDialog.title')}
            </h2>
            <p className="text-xs text-text-muted">{t('projectsPage.deleteDialog.subtitle')}</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-6">
          {t('projectsPage.deleteDialog.message', { name: projectName })}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-bg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-error px-4 py-2 text-sm font-medium text-white',
              'hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export { DeleteConfirmDialog }
export type { DeleteConfirmDialogProps }
