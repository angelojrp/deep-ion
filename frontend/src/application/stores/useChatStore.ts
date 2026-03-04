import { create } from 'zustand'
import type { ChatMessage } from '@domain/models/chatbot'

interface ChatState {
  /** Widget open state (floating chat bubble) */
  widgetOpen: boolean
  /** Current conversation ID in widget */
  activeConversationId: string | null
  /** Messages in the current widget conversation */
  widgetMessages: ChatMessage[]
  /** Is the assistant currently "typing" */
  isTyping: boolean
  /** Is voice recording active */
  isRecording: boolean

  openWidget: () => void
  closeWidget: () => void
  toggleWidget: () => void
  setActiveConversation: (id: string | null) => void
  addMessage: (message: ChatMessage) => void
  setWidgetMessages: (messages: ChatMessage[]) => void
  clearWidgetMessages: () => void
  setIsTyping: (typing: boolean) => void
  setIsRecording: (recording: boolean) => void
}

const useChatStore = create<ChatState>()((set) => ({
  widgetOpen: false,
  activeConversationId: null,
  widgetMessages: [],
  isTyping: false,
  isRecording: false,

  openWidget: () => set({ widgetOpen: true }),
  closeWidget: () => set({ widgetOpen: false }),
  toggleWidget: () => set((s) => ({ widgetOpen: !s.widgetOpen })),

  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (message) =>
    set((s) => ({ widgetMessages: [...s.widgetMessages, message] })),
  setWidgetMessages: (messages) => set({ widgetMessages: messages }),
  clearWidgetMessages: () =>
    set({ widgetMessages: [], activeConversationId: null }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
}))

export { useChatStore }
