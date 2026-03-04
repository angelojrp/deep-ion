import { useTranslation } from 'react-i18next'
import {
  PlusCircle,
  CheckCircle2,
  XCircle,
  Bot,
  Rocket,
  Clock,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
/** Atividade recente do projeto — tipo local para compatibilidade futura (RM-F05) */
export interface ProjectActivity {
  id: string
  type: 'demand_created' | 'gate_approved' | 'gate_rejected' | 'agent_run' | 'deploy'
  description: string
  actor: string
  timestamp: string
}

interface ActivityTimelineProps {
  activities: ProjectActivity[]
}

const activityConfig: Record<
  ProjectActivity['type'],
  { icon: typeof PlusCircle; color: string; bgColor: string }
> = {
  demand_created: { icon: PlusCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  gate_approved: { icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success-light' },
  gate_rejected: { icon: XCircle, color: 'text-error', bgColor: 'bg-error-light' },
  agent_run: { icon: Bot, color: 'text-info', bgColor: 'bg-info-light' },
  deploy: { icon: Rocket, color: 'text-warning', bgColor: 'bg-warning-light' },
}

function formatTimeAgo(timestamp: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return t('projectsPage.detail.activity.justNow')
  if (diffHours < 24) return t('projectsPage.detail.activity.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('projectsPage.detail.activity.daysAgo', { count: diffDays })
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const { t } = useTranslation()

  if (activities.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text">
            {t('projectsPage.detail.activity.title')}
          </h3>
        </div>
        <p className="text-sm text-text-muted text-center py-6">
          {t('projectsPage.detail.activity.empty')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text">
          {t('projectsPage.detail.activity.title')}
        </h3>
        <span className="ml-auto text-xs text-text-muted">
          {t('projectsPage.detail.activity.showing', { count: activities.length })}
        </span>
      </div>
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        {activities.map((activity, index) => {
          const config = activityConfig[activity.type]
          const Icon = config.icon
          const timeAgo = formatTimeAgo(activity.timestamp, t)

          return (
            <div
              key={activity.id}
              className={cn('relative flex gap-3 py-3', index === 0 && 'pt-0')}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full shrink-0 z-10',
                  config.bgColor,
                )}
              >
                <Icon size={14} className={config.color} aria-hidden="true" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-text">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">{activity.actor}</span>
                  <span className="text-xs text-text-muted/50">•</span>
                  <span className="text-xs text-text-muted">{timeAgo}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ActivityTimeline }
export type { ActivityTimelineProps }
