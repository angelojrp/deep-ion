import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

interface AgentProcessingProps {
  agentName: string
  actionKey: string
}

function AgentProcessing({ agentName, actionKey }: AgentProcessingProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-[var(--radius-lg)] border border-primary/30 bg-primary/5 p-8 shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot size={32} className="text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
            <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-text mb-1">
            {t('kickoff.agentProcessing.title', { agent: agentName })}
          </h3>
          <p className="text-sm text-text-muted">
            {t(actionKey)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export { AgentProcessing }
export type { AgentProcessingProps }
