import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useVoiceRecording } from '@application/hooks/useVoiceRecording'
import type { MessageInputType } from '@domain/models/chatbot'

interface ChatInputProps {
  onSend: (content: string, inputType: MessageInputType) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [lastInputType, setLastInputType] = useState<MessageInputType>('text')

  const handleTranscript = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
    setLastInputType('voice')
  }, [])

  const { isRecording, isSupported, toggleRecording } = useVoiceRecording({
    onTranscript: handleTranscript,
  })

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      const trimmed = text.trim()
      if (!trimmed || disabled) return
      onSend(trimmed, lastInputType)
      setText('')
      setLastInputType('text')
    },
    [text, disabled, onSend, lastInputType],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 border-t border-border bg-surface"
    >
      {/* Voice button */}
      {isSupported && (
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center shrink-0',
            'w-9 h-9 rounded-full transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isRecording
              ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={
            isRecording
              ? t('chatbot.input.stopRecording')
              : t('chatbot.input.startRecording')
          }
          title={
            isRecording
              ? t('chatbot.input.stopRecording')
              : t('chatbot.input.startRecording')
          }
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Text input */}
      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setLastInputType('text')
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? t('chatbot.input.listening')
              : t('chatbot.input.placeholder')
          }
          disabled={disabled || isRecording}
          rows={1}
          className={cn(
            'w-full resize-none rounded-xl px-4 py-2.5',
            'bg-muted text-foreground text-sm',
            'placeholder:text-muted-foreground',
            'border border-border',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'max-h-32 overflow-y-auto',
            'transition-colors duration-150',
            disabled && 'opacity-50 cursor-not-allowed',
            isRecording && 'border-red-300 bg-red-50 dark:bg-red-950/20',
          )}
          aria-label={t('chatbot.input.placeholder')}
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={cn(
          'flex items-center justify-center shrink-0',
          'w-9 h-9 rounded-full',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        aria-label={t('chatbot.input.send')}
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  )
}

export { ChatInput }
export type { ChatInputProps }
