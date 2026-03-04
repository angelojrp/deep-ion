import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Plus, RefreshCw, Eye as EyeIcon, AlertCircle, Zap } from 'lucide-react'

interface QuickActionsProps {
  className?: string
}

function QuickActions({ className }: QuickActionsProps) {
  const { t } = useTranslation()

  const actions = [
    {
      key: 'newBrief',
      label: t('baDashboard.quickActions.newBrief'),
      icon: Plus,
      variant: 'primary' as const,
    },
    {
      key: 'refineBrief',
      label: t('baDashboard.quickActions.refineBrief'),
      icon: RefreshCw,
      variant: 'secondary' as const,
    },
    {
      key: 'createVision',
      label: t('baDashboard.quickActions.createVision'),
      icon: EyeIcon,
      variant: 'secondary' as const,
    },
    {
      key: 'viewQuestions',
      label: t('baDashboard.quickActions.viewQuestions'),
      icon: AlertCircle,
      variant: 'secondary' as const,
    },
    {
      key: 'escalate',
      label: t('baDashboard.quickActions.escalate'),
      icon: Zap,
      variant: 'danger' as const,
    },
  ]

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-surface-2 text-text hover:bg-surface-3 border border-border',
    danger: 'bg-error-light text-error hover:bg-error/10 border border-error-border',
  }

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      role="region"
      aria-label={t('baDashboard.quickActions.title')}
    >
      <h3 className="mb-3 text-base font-semibold text-text">
        {t('baDashboard.quickActions.title')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.key}
              type="button"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium transition-colors',
                variantStyles[action.variant],
              )}
              aria-label={action.label}
            >
              <Icon size={14} aria-hidden="true" />
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { QuickActions }
export type { QuickActionsProps }
