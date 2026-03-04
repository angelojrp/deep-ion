import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'
import { AlertTriangle, Bell, XCircle } from 'lucide-react'
import type { AlertItem, AlertSeverity } from '@domain/models/ba-dashboard'

interface AlertBarProps {
  alerts: AlertItem[]
  className?: string
}

const severityStyles: Record<AlertSeverity, string> = {
  critical: 'bg-error-light border-error-border text-error',
  warning: 'bg-warning-light border-warning-border text-warning',
  info: 'bg-info-light border-info-border text-info',
}

const severityIcons: Record<AlertSeverity, typeof AlertTriangle> = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Bell,
}

function AlertBar({ alerts, className }: AlertBarProps) {
  const { t } = useTranslation()

  if (alerts.length === 0) return null

  return (
    <div
      className={cn('space-y-2', className)}
      role="alert"
      aria-label={t('baDashboard.alerts.title')}
    >
      {alerts.map((alert) => {
        const Icon = severityIcons[alert.severity]
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm',
              severityStyles[alert.severity],
            )}
          >
            <Icon size={16} className="shrink-0" aria-hidden="true" />
            <span className="font-medium">{alert.message}</span>
          </div>
        )
      })}
    </div>
  )
}

export { AlertBar }
export type { AlertBarProps }
