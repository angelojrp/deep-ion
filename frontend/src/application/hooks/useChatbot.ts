import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchConversations,
  fetchConversation,
  sendMessage,
  deleteConversation,
} from '@infrastructure/api/adapters/chatbotApi'
import type {
  Conversation,
  ConversationWithMessages,
  SendMessageRequest,
  SendMessageResponse,
} from '@domain/models/chatbot'
import { useChatStore } from '@application/stores/useChatStore'

const CONVERSATIONS_KEY = ['chatbot', 'conversations'] as const

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: [...CONVERSATIONS_KEY],
    queryFn: fetchConversations,
    staleTime: 30_000,
  })
}

export function useConversation(id: string | null) {
  return useQuery<ConversationWithMessages>({
    queryKey: [...CONVERSATIONS_KEY, id],
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { addMessage, setIsTyping } = useChatStore.getState()

  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: sendMessage,
    onMutate: () => {
      setIsTyping(true)
    },
    onSuccess: (data) => {
      addMessage(data.userMessage)
      addMessage(data.assistantMessage)
      setIsTyping(false)
      // Invalidate conversations list to refresh sidebar/page
      queryClient.invalidateQueries({ queryKey: [...CONVERSATIONS_KEY] })
    },
    onError: () => {
      setIsTyping(false)
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONVERSATIONS_KEY] })
    },
  })
}
