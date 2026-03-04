import type {
  Conversation,
  ConversationWithMessages,
  SendMessageRequest,
  SendMessageResponse,
} from '@domain/models/chatbot'

const BASE_URL = '/api/chatbot'

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${BASE_URL}/conversations`)
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function fetchConversation(id: string): Promise<ConversationWithMessages> {
  const res = await fetch(`${BASE_URL}/conversations/${id}`)
  if (!res.ok) throw new Error('Failed to fetch conversation')
  return res.json()
}

export async function sendMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete conversation')
}
