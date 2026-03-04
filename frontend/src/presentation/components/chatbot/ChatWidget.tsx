import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Minimize2, MessageSquarePlus, Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@shared/utils/cn'
import { ROUTES } from '@shared/constants/routes'
import { useChatStore } from '@application/stores/useChatStore'
import { useSendMessage } from '@application/hooks/useChatbot'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import type { MessageInputType } from '@domain/models/chatbot'

function ChatWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const widgetOpen = useChatStore((s) => s.widgetOpen)
  const closeWidget = useChatStore((s) => s.closeWidget)
  const widgetMessages = useChatStore((s) => s.widgetMessages)
  const isTyping = useChatStore((s) => s.isTyping)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const clearWidgetMessages = useChatStore((s) => s.clearWidgetMessages)

  const sendMutation = useSendMessage()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [widgetMessages, isTyping])

  const handleSend = useCallback(
    (content: string, inputType: MessageInputType) => {
      sendMutation.mutate({
        conversationId: activeConversationId ?? undefined,
        content,
        inputType,
      })
    },
    [sendMutation, activeConversationId],
  )

  const handleNewConversation = useCallback(() => {
    clearWidgetMessages()
  }, [clearWidgetMessages])

  const handleOpenFullPage = useCallback(() => {
    closeWidget()
    navigate(ROUTES.CHATBOT)
  }, [closeWidget, navigate])

  if (!widgetOpen) return null

  return (
    <div
      className={cn(
        'fixed z-50',
        // Position: bottom-right, above the FAB
        'bottom-20 right-4 lg:bottom-6 lg:right-6',
        // Size
        'w-[calc(100vw-2rem)] max-w-md',
        'h-[min(75vh,600px)]',
        // Appearance
        'bg-surface rounded-2xl shadow-2xl border border-border',
        'flex flex-col overflow-hidden',
        // Animation
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
      role="dialog"
      aria-label={t('chatbot.widget.title')}
      aria-modal="false"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <Bot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t('chatbot.widget.title')}</h2>
            <p className="text-[11px] opacity-80">{t('chatbot.widget.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewConversation}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/20 transition-colors"
            aria-label={t('chatbot.widget.newConversation')}
            title={t('chatbot.widget.newConversation')}
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenFullPage}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/20 transition-colors"
            aria-label={t('chatbot.widget.openFullPage')}
            title={t('chatbot.widget.openFullPage')}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={closeWidget}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/20 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto" role="log" aria-live="polite">
        {widgetMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {t('chatbot.widget.welcomeTitle')}
            </h3>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              {t('chatbot.widget.welcomeMessage')}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {widgetMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div className="flex gap-3 px-4 py-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  )
}

export { ChatWidget }
