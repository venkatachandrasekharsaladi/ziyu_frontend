export type MessageKind = 'text' | 'photo' | 'voice' | 'video'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type Reaction = { emoji: string; authorId: string }

export type Message = {
  id: string
  authorId: 'me' | 'partner'
  kind: MessageKind
  body?: string
  mediaUri?: string
  durationMs?: number
  replyToId?: string
  reactions: Reaction[]
  pinned: boolean
  sentAt: string
  status: MessageStatus
}

export type SendInput = {
  kind: MessageKind
  body?: string
  mediaUri?: string
  durationMs?: number
  replyToId?: string
}

export type ChatEvent =
  | { type: 'typing'; isTyping: boolean }
  | { type: 'message'; message: Message }
  | { type: 'status'; messageId: string; status: MessageStatus }

export type ChatService = {
  listMessages(): Promise<Message[]>
  sendMessage(input: SendInput): Promise<Message>
  react(messageId: string, emoji: string): Promise<Message>
  togglePin(messageId: string): Promise<Message>
  search(query: string): Promise<Message[]>
  subscribe(listener: (event: ChatEvent) => void): () => void
}

/** Every delay the mock uses. Tests pass zeroes; the app uses the defaults. */
export type ChatTimings = {
  statusStepMs: number
  typingDelayMs: number
  replyDelayMs: number
}
