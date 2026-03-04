import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  MessageCircle,
  Search,
  Trash2,
  Clock,
  Archive,
  Plus,
  ArrowLeft,
  Mic,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import {
  useConversations,
  useConversation,
  useSendMessage,
  useDeleteConversation,
} from '@application/hooks/useChatbot'
import { useChatStore } from '@application/stores/useChatStore'
import { ChatMessage } from '@presentation/components/chatbot/ChatMessage'
import { ChatInput } from '@presentation/components/chatbot/ChatInput'
import type { Conversation, MessageInputType } from '@domain/models/chatbot'

function ChatbotPage() {
  const { t } = useTranslation()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileConvList, setShowMobileConvList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations, isLoading: convLoading } = useConversations()
  const { data: conversationDetail } = useConversation(selectedConvId)
  const sendMutation = useSendMessage()
  const deleteMutation = useDeleteConversation()

  const isTyping = useChatStore((s) => s.isTyping)
  const widgetMessages = useChatStore((s) => s.widgetMessages)
  const setWidgetMessages = useChatStore((s) => s.setWidgetMessages)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)

  // Load conversation messages when selected
  useEffect(() => {
    if (conversationDetail?.messages) {
      setWidgetMessages(conversationDetail.messages)
      setActiveConversation(conversationDetail.id)
    }
  }, [conversationDetail, setWidgetMessages, setActiveConversation])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [widgetMessages, isTyping])

  const filteredConversations = conversations?.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConvId(id)
      setShowMobileConvList(false)
    },
    [],
  )

  const handleNewConversation = useCallback(() => {
    setSelectedConvId(null)
    setWidgetMessages([])
    setActiveConversation(null)
    setShowMobileConvList(false)
  }, [setWidgetMessages, setActiveConversation])

  const handleDeleteConversation = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      deleteMutation.mutate(id)
      if (selectedConvId === id) {
        setSelectedConvId(null)
        setWidgetMessages([])
        setActiveConversation(null)
      }
    },
    [deleteMutation, selectedConvId, setWidgetMessages, setActiveConversation],
  )

  const handleSend = useCallback(
    (content: string, inputType: MessageInputType) => {
      sendMutation.mutate({
        conversationId: selectedConvId ?? undefined,
        content,
        inputType,
      })
    },
    [sendMutation, selectedConvId],
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] lg:h-screen p-4 lg:p-6">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">
          {t('chatbot.page.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('chatbot.page.subtitle')}
        </p>
      </div>

      {/* Main content: sidebar + chat */}
      <div className="flex-1 flex gap-4 min-h-0 rounded-2xl border border-border overflow-hidden bg-surface">
        {/* Conversation list sidebar */}
        <aside
          className={cn(
            'flex flex-col border-r border-border bg-muted/30',
            // Mobile: full width or hidden
            showMobileConvList ? 'flex' : 'hidden lg:flex',
            'w-full lg:w-80 shrink-0',
          )}
          aria-label={t('chatbot.page.conversationList')}
        >
          {/* Search + New */}
          <div className="p-3 space-y-2 border-b border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('chatbot.page.searchPlaceholder')}
                  className={cn(
                    'w-full pl-9 pr-3 py-2 rounded-lg text-sm',
                    'bg-surface border border-border',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  )}
                  aria-label={t('chatbot.page.searchPlaceholder')}
                />
              </div>
              <button
                type="button"
                onClick={handleNewConversation}
                className={cn(
                  'flex items-center justify-center shrink-0',
                  'w-9 h-9 rounded-lg',
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary/90 transition-colors',
                )}
                aria-label={t('chatbot.page.newConversation')}
                title={t('chatbot.page.newConversation')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <nav className="flex-1 overflow-y-auto" role="list">
            {convLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground animate-pulse">
                  {t('common.loading')}
                </p>
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('common.noResults')}
                </p>
              </div>
            ) : (
              filteredConversations?.map((conv: Conversation) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConvId === conv.id}
                  onSelect={handleSelectConversation}
                  onDelete={handleDeleteConversation}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))
            )}
          </nav>
        </aside>

        {/* Chat area */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0',
            !showMobileConvList ? 'flex' : 'hidden lg:flex',
          )}
        >
          {/* Mobile back button */}
          <div className="lg:hidden flex items-center gap-2 p-3 border-b border-border">
            <button
              type="button"
              onClick={() => setShowMobileConvList(true)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('chatbot.page.backToList')}
            >
              <ArrowLeft className="w-4 h-4" />
              {t('chatbot.page.backToList')}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto" role="log" aria-live="polite">
            {widgetMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {t('chatbot.widget.welcomeTitle')}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  {t('chatbot.widget.welcomeMessage')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    t('chatbot.page.suggestion1'),
                    t('chatbot.page.suggestion2'),
                    t('chatbot.page.suggestion3'),
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSend(suggestion, 'text')}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs',
                        'bg-muted text-muted-foreground',
                        'hover:bg-accent hover:text-accent-foreground',
                        'border border-border transition-colors',
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  <Mic className="w-3.5 h-3.5" />
                  {t('chatbot.page.voiceHint')}
                </div>
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
      </div>
    </div>
  )
}

/* ── Conversation list item ── */

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  formatDate: (d: string) => string
  formatTime: (d: string) => string
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  formatDate,
  formatTime,
}: ConversationItemProps) {
  const { t } = useTranslation()

  return (
    <div
      role="listitem"
      onClick={() => onSelect(conversation.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(conversation.id)
        }
      }}
      tabIndex={0}
      className={cn(
        'flex items-start gap-3 px-3 py-3 cursor-pointer',
        'border-b border-border/50 transition-colors',
        'hover:bg-accent/50 focus-visible:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        isSelected && 'bg-accent',
      )}
      aria-selected={isSelected}
      aria-label={conversation.title}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
        <MessageCircle className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {conversation.title}
          </h3>
          <button
            type="button"
            onClick={(e) => onDelete(conversation.id, e)}
            className={cn(
              'shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100',
              'hover:bg-destructive/10 hover:text-destructive',
              'transition-all',
              // Always show on touch devices
              'lg:opacity-0 hover:opacity-100 focus:opacity-100',
            )}
            aria-label={t('common.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conversation.preview}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            {formatDate(conversation.lastMessageAt)}{' '}
            {formatTime(conversation.lastMessageAt)}
          </span>
          {conversation.status === 'archived' && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
              <Archive className="w-3 h-3" />
              {t('chatbot.page.archived')}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/70">
            {conversation.messageCount} {t('chatbot.page.messages')}
          </span>
        </div>
      </div>
    </div>
  )
}

export { ChatbotPage }
