import { useTranslation } from 'react-i18next'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useChatStore } from '@application/stores/useChatStore'

/**
 * Floating Action Button for the chatbot.
 * Always visible in the bottom-right corner of every page.
 */
function ChatFab() {
  const { t } = useTranslation()
  const widgetOpen = useChatStore((s) => s.widgetOpen)
  const toggleWidget = useChatStore((s) => s.toggleWidget)

  return (
    <button
      type="button"
      onClick={toggleWidget}
      className={cn(
        'fixed z-50',
        'bottom-4 right-4 lg:bottom-6 lg:right-6',
        // On mobile, offset above BottomNav
        'mb-16 lg:mb-0',
        // Size and shape
        'w-14 h-14 rounded-full',
        // Colors
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        // Hover/focus
        'hover:scale-105 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        // Animation
        'transition-all duration-200',
      )}
      aria-label={
        widgetOpen
          ? t('chatbot.fab.close')
          : t('chatbot.fab.open')
      }
      aria-expanded={widgetOpen}
    >
      <span className="flex items-center justify-center">
        {widgetOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-200" />
        )}
      </span>

      {/* Notification pulse when widget is closed */}
      {!widgetOpen && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500" />
        </span>
      )}
    </button>
  )
}

export { ChatFab }
