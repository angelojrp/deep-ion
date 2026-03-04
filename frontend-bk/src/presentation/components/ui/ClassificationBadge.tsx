import { CLASSIFICATION_COLORS } from '@shared/constants/CLASSIFICATION_COLORS'
import { cn } from '@shared/utils/cn'

interface ClassificationBadgeProps {
  value: 'T0' | 'T1' | 'T2' | 'T3'
}

export const ClassificationBadge = ({ value }: ClassificationBadgeProps): JSX.Element => (
  <span className={cn('rounded px-2 py-1 text-xs font-semibold', CLASSIFICATION_COLORS[value])}>{value}</span>
)