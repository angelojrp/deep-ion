import { type ReactNode } from 'react'
import { cn } from '@shared/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-surface border-border',
  success: 'bg-success-light border-success-border',
  warning: 'bg-warning-light border-warning-border',
  error: 'bg-error-light border-error-border',
  info: 'bg-info-light border-info-border',
}

const trendColors: Record<NonNullable<StatCardProps['trend']>, string> = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-text-muted',
}

function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-card)]',
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {icon && (
          <span className="text-text-muted" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text">{value}</span>
        {trend && trendLabel && (
          <span className={cn('text-xs font-medium', trendColors[trend])}>
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export { StatCard }
export type { StatCardProps }
