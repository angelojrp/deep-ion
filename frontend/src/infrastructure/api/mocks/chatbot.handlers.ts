import { http, HttpResponse, delay } from 'msw'
import type { SendMessageRequest } from '@domain/models/chatbot'
import conversationsData from './fixtures/chatbot-conversations.json'

const SIMULATED_RESPONSES = [
  'Entendido! Estou processando sua solicitação. Com base nos dados disponíveis, posso informar que o fluxo está dentro dos parâmetros esperados. Deseja que eu detalhe algum aspecto específico?',
  'Analisei os dados e encontrei algumas informações relevantes. O indicador principal está em 87%, acima da meta de 80%. Os detalhes completos estão disponíveis no dashboard.',
  'Solicitação recebida! Vou verificar os dados mais recentes. Tudo indica que a operação está estável. Posso ajudar com mais alguma coisa?',
  'Com base na análise dos últimos 30 dias, identifiquei uma tendência positiva. Os principais KPIs estão todos acima da meta estabelecida.',
]

function getRandomResponse(): string {
  return SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)] ?? SIMULATED_RESPONSES[0]
}

export const chatbotHandlers = [
  // List all conversations
  http.get('/api/chatbot/conversations', () => {
    const list = conversationsData.map(({ messages: _messages, ...rest }) => rest)
    return HttpResponse.json(list)
  }),

  // Get single conversation with messages
  http.get('/api/chatbot/conversations/:id', ({ params }) => {
    const conv = conversationsData.find((c) => c.id === params.id)
    if (!conv) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(conv)
  }),

  // Send message — returns user + assistant messages
  http.post('/api/chatbot/messages', async ({ request }) => {
    const body = (await request.json()) as SendMessageRequest
    await delay(800)

    const conversationId = body.conversationId ?? `conv-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()

    const userMessage = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      conversationId,
      role: 'user' as const,
      content: body.content,
      inputType: body.inputType,
      createdAt: now,
    }

    const assistantMessage = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      conversationId,
      role: 'assistant' as const,
      content: getRandomResponse(),
      inputType: 'text' as const,
      createdAt: new Date(Date.now() + 1000).toISOString(),
    }

    return HttpResponse.json(
      { userMessage, assistantMessage, conversationId },
      { status: 201 },
    )
  }),

  // Delete conversation
  http.delete('/api/chatbot/conversations/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
