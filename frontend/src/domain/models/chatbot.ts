/** Domain model for chatbot conversations and messages */

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageInputType = 'text' | 'voice'
export type ConversationStatus = 'active' | 'archived'

export interface ChatMessage {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  inputType: MessageInputType
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  status: ConversationStatus
  lastMessageAt: string
  messageCount: number
  preview: string
  createdAt: string
}

export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[]
}

export interface SendMessageRequest {
  conversationId?: string
  content: string
  inputType: MessageInputType
}

export interface SendMessageResponse {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
  conversationId: string
}
