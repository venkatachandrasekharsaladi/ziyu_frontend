import { act } from '@testing-library/react-native'

import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { chatService } from '@/services/chat'
import type { ChatEvent, Message } from '@/services/chat/types'

/**
 * The real `chatService` is a module-level singleton over ONE in-memory
 * thread with simulated latency and its own `setTimeout`-driven status/reply
 * choreography. A message sent by one test would still be there in the next,
 * so the suite would pass or fail by execution order. It is replaced wholesale
 * and every test states the answers it needs.
 *
 * The mock's own behaviour is covered by `services/chat/__tests__` — these
 * tests are about what the store does with an answer, not how it is produced.
 */
jest.mock('@/services/chat', () => ({
  chatService: {
    listMessages: jest.fn(),
    sendMessage: jest.fn(),
    react: jest.fn(),
    togglePin: jest.fn(),
    search: jest.fn(),
    subscribe: jest.fn(),
  },
}))

const service = jest.mocked(chatService)

const message = (id: string, authorId: 'me' | 'partner', body: string): Message => ({
  id, authorId, kind: 'text', body, reactions: [], pinned: false,
  sentAt: new Date().toISOString(), status: 'read',
})

// `subscribe` is a fake event bus: it records every listener the store hands
// it (so a test can assert HOW MANY subscriptions exist) and every listener
// can be driven with `emit`, standing in for the service pushing an event.
let listeners: ((event: ChatEvent) => void)[] = []
const emit = (event: ChatEvent) => listeners.forEach((l) => l(event))

beforeEach(() => {
  jest.clearAllMocks()
  listeners = []
  service.subscribe.mockImplementation((listener) => {
    listeners = [...listeners, listener]
    return () => { listeners = listeners.filter((l) => l !== listener) }
  })
  service.listMessages.mockResolvedValue([])

  act(() => { useChatStore.getState().reset() })
})

describe('chat store', () => {
  it('loads the thread', async () => {
    service.listMessages.mockResolvedValue([message('m1', 'partner', 'Are we still on?')])

    await act(async () => { await useChatStore.getState().load() })

    expect(useChatStore.getState().messages.length).toBeGreaterThan(0)
  })

  it('shows an outgoing message immediately, before the service resolves', async () => {
    service.listMessages.mockResolvedValue([message('m1', 'partner', 'Are we still on?')])
    await act(async () => { await useChatStore.getState().load() })
    const before = useChatStore.getState().messages.length

    service.sendMessage.mockResolvedValue(message('m-sent', 'me', 'Hello'))
    // Deliberately NOT awaited: `send()` is only run up to its first `await`
    // here, so this proves the bubble is appended in the synchronous part of
    // `send()` — before `chatService.sendMessage` has had any chance to
    // settle — rather than depending on the promise it returns.
    let pending: Promise<void>
    act(() => { pending = useChatStore.getState().send('Hello') })

    const during = useChatStore.getState().messages
    expect(during).toHaveLength(before + 1)
    expect(during[during.length - 1]).toMatchObject({ body: 'Hello', status: 'sending' })

    await act(async () => { await pending })

    const after = useChatStore.getState().messages
    expect(after).toHaveLength(before + 1)
    expect(after[after.length - 1]).toMatchObject({ id: 'm-sent', status: 'read' })
  })

  it('marks a failed send in place instead of dropping it, and lets retry recover it', async () => {
    service.listMessages.mockResolvedValue([message('m1', 'partner', 'Are we still on?')])
    await act(async () => { await useChatStore.getState().load() })
    const before = useChatStore.getState().messages.length

    service.sendMessage.mockRejectedValueOnce(new Error('network down'))
    await act(async () => { await useChatStore.getState().send('Hello') })

    const failed = useChatStore.getState().messages
    expect(failed).toHaveLength(before + 1)
    const failedMessage = failed[failed.length - 1]
    // The text is still there to retry — nothing was silently dropped.
    expect(failedMessage).toMatchObject({ body: 'Hello', status: 'failed' })

    service.sendMessage.mockResolvedValueOnce(message('m-sent', 'me', 'Hello'))
    await act(async () => { await useChatStore.getState().retry(failedMessage.id) })

    const after = useChatStore.getState().messages
    // Retry reconciles the SAME slot — it does not append a second bubble.
    expect(after).toHaveLength(before + 1)
    expect(after[after.length - 1]).toMatchObject({ id: 'm-sent', status: 'read' })
  })

  it('does nothing when asked to retry a message that is not marked failed', async () => {
    service.listMessages.mockResolvedValue([message('m1', 'partner', 'Are we still on?')])
    await act(async () => { await useChatStore.getState().load() })
    const before = useChatStore.getState().messages

    await act(async () => { await useChatStore.getState().retry('m1') })

    expect(service.sendMessage).not.toHaveBeenCalled()
    expect(useChatStore.getState().messages).toEqual(before)
  })

  it('clears the draft and the reply target on send', async () => {
    await act(async () => { await useChatStore.getState().load() })
    act(() => {
      useChatStore.getState().setDraft('Hi')
      useChatStore.getState().startReply('m1')
    })

    service.sendMessage.mockResolvedValue(message('m-sent', 'me', 'Hi'))
    await act(async () => { await useChatStore.getState().send('Hi') })

    expect(useChatStore.getState().draft).toBe('')
    expect(useChatStore.getState().replyTarget).toBeNull()
  })

  it('never opens the attachment sheet and the reaction overlay together', () => {
    act(() => {
      useChatStore.getState().selectMessage('m1')
      useChatStore.getState().openAttachments()
    })
    expect(useChatStore.getState().selectedMessageId).toBeNull()
    expect(useChatStore.getState().attachmentSheetOpen).toBe(true)

    act(() => { useChatStore.getState().selectMessage('m2') })
    expect(useChatStore.getState().attachmentSheetOpen).toBe(false)
  })

  // The brief's `load()` calls `chatService.subscribe` unconditionally. Task
  // 14 mounts one chat screen, unmounts it, then mounts another in the same
  // session — each calls `load()`. An unguarded `load()` would register a
  // second listener on top of the first, so a single emitted partner message
  // would be applied twice: appended to `messages` once per listener.
  it('subscribes at most once across repeated loads, so one emitted message lands once', async () => {
    await act(async () => { await useChatStore.getState().load() })
    await act(async () => { await useChatStore.getState().load() })

    expect(service.subscribe).toHaveBeenCalledTimes(1)
    expect(listeners).toHaveLength(1)

    act(() => { emit({ type: 'message', message: message('m-incoming', 'partner', 'hey') }) })

    const matches = useChatStore.getState().messages.filter((m) => m.id === 'm-incoming')
    expect(matches).toHaveLength(1)
  })

  // The guard used to check `unsubscribe` only AFTER awaiting
  // `listMessages()`. Two `load()` calls fired without awaiting the first
  // both run their synchronous prefix before either `listMessages()`
  // settles, so a check placed after the await could let both pass it and
  // each subscribe.
  it('subscribes exactly once even when two load() calls race without awaiting the first', async () => {
    await act(async () => {
      await Promise.all([useChatStore.getState().load(), useChatStore.getState().load()])
    })

    expect(service.subscribe).toHaveBeenCalledTimes(1)
    expect(listeners).toHaveLength(1)
  })

  it('tears down the subscription on reset, so a later load subscribes exactly once again', async () => {
    await act(async () => { await useChatStore.getState().load() })
    expect(listeners).toHaveLength(1)

    act(() => { useChatStore.getState().reset() })
    expect(listeners).toHaveLength(0)

    await act(async () => { await useChatStore.getState().load() })

    expect(service.subscribe).toHaveBeenCalledTimes(2)
    expect(listeners).toHaveLength(1)
  })
})
