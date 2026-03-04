import { useTranslation } from 'react-i18next'

interface ConfidenceScoreBadgeProps {
  score: number
}

export const ConfidenceScoreBadge = ({ score }: ConfidenceScoreBadgeProps): JSX.Element => {
  const { t } = useTranslation()
  const isEscalated = score < 0.65

  return (
    <div className="flex items-center gap-2">
      <span>{Math.round(score * 100)}%</span>
      {isEscalated ? <span className="rounded bg-destructive px-2 py-1 text-white">{t('agent.escalated_to_human')}</span> : null}
    </div>
  )
}