---
tipo: contexto-funcionalidade
id-roadmap: RM-F24
nome: Chatbot de IA Conversacional
data-criação: 2026-03-06
tema: deep-ion
status-prototipo: completo
objetivo: Fornecer contexto sobre a prototipação frontend do chatbot de IA para o agente DOM-02
---

# Contexto de Funcionalidade — RM-F24: Chatbot de IA Conversacional

## 1. Descrição no Roadmap

Chatbot de IA conversacional integrado à plataforma — interface de chat com gestão de conversas, entrada por texto e voz (Web Speech API), streaming de mensagens.

| Campo | Valor |
|-------|-------|
| ID Roadmap | RM-F24 |
| ID Visão | — |
| Marco | 2d — Funcionalidades Prototipadas no Frontend |
| Prioridade | Should |
| Status | Protótipo frontend completo |

## 2. Escopo do Protótipo Frontend

Interface de chat completa com gestão de conversas, envio de mensagens por texto, suporte a voz (placeholder), streaming simulado de respostas do assistente, e widget flutuante.

## 3. Páginas Prototipadas

| Página | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| Chatbot | `/chatbot` | `frontend/src/presentation/pages/ChatbotPage.tsx` | Interface de chat em tela cheia |

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| ChatWidget | `frontend/src/presentation/components/chatbot/ChatWidget.tsx` | Widget de chat flutuante |
| ChatFab | `frontend/src/presentation/components/chatbot/ChatFab.tsx` | Botão flutuante de abertura |
| ChatInput | `frontend/src/presentation/components/chatbot/ChatInput.tsx` | Campo de entrada (texto + voz) |
| ChatMessage | `frontend/src/presentation/components/chatbot/ChatMessage.tsx` | Renderização de mensagem |

## 5. Modelo de Domínio

**Arquivo:** `frontend/src/domain/models/chatbot.ts`

| Entidade/Tipo | Descrição |
|---------------|-----------|
| MessageRole | user, assistant, system |
| MessageInputType | text, voice |
| ConversationStatus | active, archived |
| ChatMessage | role, content, inputType, timestamp |
| Conversation | id, title, status, lastMessage, createdAt |
| ConversationWithMessages | Conversa completa com histórico |
| SendMessageRequest | conversationId, content, inputType |
| SendMessageResponse | Resposta do assistente |

**Estado Global:** `frontend/src/application/stores/useChatStore.ts` — Zustand store (isTyping, widgetMessages, activeConversation)

## 6. API Hooks e Endpoints

**Hook:** `frontend/src/application/hooks/useChatbot.ts`

| Hook | Operação |
|------|----------|
| useConversations() | Listagem de conversas |
| useConversation() | Detalhes de conversa com mensagens |
| useSendMessage() | Envio de mensagem |
| useDeleteConversation() | Exclusão de conversa |

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/conversations` | Listagem de conversas |
| POST | `/api/conversations` | Criação de nova conversa |
| GET | `/api/conversations/:id` | Detalhes com mensagens |
| POST | `/api/conversations/:id/messages` | Envio de mensagem |
| DELETE | `/api/conversations/:id` | Exclusão |

## 7. Funcionalidades Implementadas no Protótipo

- Lista de conversas com preview da última mensagem e timestamp
- Criação de novas conversas
- Envio de mensagens de texto
- Suporte a entrada por voz (Web Speech API — placeholder)
- Simulação de streaming de resposta do assistente
- Histórico de mensagens por conversa
- Arquivamento e exclusão de conversas
- Interface responsiva para mobile
- Indicador de digitação (typing indicator)
- Auto-scroll para última mensagem
- Widget flutuante (ChatFab + ChatWidget)

## 8. Requisitos Identificados no Protótipo

### Regras de Negócio Implícitas

- 3 papéis de mensagem: user, assistant, system
- Conversa pode estar ativa ou arquivada
- Cada mensagem registra tipo de input (text/voice)
- Estado de digitação controlado por Zustand store
- Chat possui modo tela cheia e modo widget

### Pontos em Aberto para DOM-02

- Integração com backend de IA (qual modelo responde)
- Contexto do chat (acessa dados do projeto? pipeline? artefatos?)
- Streaming real de respostas (SSE vs. WebSocket)
- Histórico de conversas — retenção e limites
- Permissões de acesso ao chatbot por papel
- Integração com prompts negociais (di-brief-new, etc.)
- Capacidade do chat de executar ações na plataforma (agente ativo)
