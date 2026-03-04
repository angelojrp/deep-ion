import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlusCircle,
  Columns2,
  Accessibility,
  Network,
} from 'lucide-react'

interface QuickActionsProps {
  className?: string
}

function QuickActions({ className }: QuickActionsProps) {
  const { t } = useTranslation()

  const actions = [
    {
      key: 'approve',
      label: t('uxDashboard.quickActions.approve'),
      icon: CheckCircle2,
      variant: 'primary' as const,
    },
    {
      key: 'reject',
      label: t('uxDashboard.quickActions.reject'),
      icon: XCircle,
      variant: 'danger' as const,
    },
    {
      key: 'refine',
      label: t('uxDashboard.quickActions.refine'),
      icon: RefreshCw,
      variant: 'secondary' as const,
    },
    {
      key: 'generate',
      label: t('uxDashboard.quickActions.generate'),
      icon: PlusCircle,
      variant: 'secondary' as const,
    },
    {
      key: 'compare',
      label: t('uxDashboard.quickActions.compare'),
      icon: Columns2,
      variant: 'secondary' as const,
    },
    {
      key: 'checkA11y',
      label: t('uxDashboard.quickActions.checkA11y'),
      icon: Accessibility,
      variant: 'secondary' as const,
    },
    {
      key: 'viewMapping',
      label: t('uxDashboard.quickActions.viewMapping'),
      icon: Network,
      variant: 'secondary' as const,
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
      aria-label={t('uxDashboard.quickActions.title')}
    >
      <h3 className="mb-3 text-base font-semibold text-text">
        {t('uxDashboard.quickActions.title')}
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
