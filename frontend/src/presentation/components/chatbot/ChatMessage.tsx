import { useTranslation } from 'react-i18next'
import { Bot, User, Mic } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import type { ChatMessage as ChatMessageType } from '@domain/models/chatbot'

interface ChatMessageProps {
  message: ChatMessageType
}

function ChatMessage({ message }: ChatMessageProps) {
  const { t } = useTranslation()
  const isUser = message.role === 'user'
  const isVoice = message.inputType === 'voice'

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
      role="article"
      aria-label={
        isUser
          ? t('chatbot.message.userLabel')
          : t('chatbot.message.assistantLabel')
      }
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center shrink-0',
          'w-8 h-8 rounded-full',
          isUser
            ? 'bg-primary text-white'
            : 'bg-accent text-accent-foreground',
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          'text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md',
        )}
      >
        {message.content}

        {/* Voice indicator */}
        {isVoice && (
          <span
            className={cn(
              'inline-flex items-center gap-1 mt-1.5',
              'text-[10px] opacity-60',
            )}
            title={t('chatbot.message.voiceInput')}
          >
            <Mic className="w-3 h-3" />
            {t('chatbot.message.voiceInput')}
          </span>
        )}
      </div>
    </div>
  )
}

export { ChatMessage }
export type { ChatMessageProps }
