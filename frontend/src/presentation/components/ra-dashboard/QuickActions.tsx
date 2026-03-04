import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { Plus, RefreshCw, Award, Scissors, Network, GitBranch } from 'lucide-react'

interface QuickActionsProps {
  className?: string
}

function QuickActions({ className }: QuickActionsProps) {
  const { t } = useTranslation()

  const actions = [
    { key: 'newUC', label: t('raDashboard.quickActions.newUC'), icon: Plus, variant: 'primary' as const },
    { key: 'updateUC', label: t('raDashboard.quickActions.updateUC'), icon: RefreshCw, variant: 'secondary' as const },
    { key: 'critiqueStories', label: t('raDashboard.quickActions.critiqueStories'), icon: Award, variant: 'secondary' as const },
    { key: 'refineStories', label: t('raDashboard.quickActions.refineStories'), icon: RefreshCw, variant: 'secondary' as const },
    { key: 'sliceEpic', label: t('raDashboard.quickActions.sliceEpic'), icon: Scissors, variant: 'secondary' as const },
    { key: 'viewTraceability', label: t('raDashboard.quickActions.viewTraceability'), icon: Network, variant: 'secondary' as const },
    { key: 'analyzeImpact', label: t('raDashboard.quickActions.analyzeImpact'), icon: GitBranch, variant: 'secondary' as const },
  ]

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-surface border border-border text-text hover:bg-surface-2',
  }

  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]', className)}>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
        {t('raDashboard.quickActions.title')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ key, label, icon: Icon, variant }) => (
          <button
            key={key}
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-colors',
              variantStyles[variant],
            )}
            aria-label={label}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export { QuickActions }
export type { QuickActionsProps }
