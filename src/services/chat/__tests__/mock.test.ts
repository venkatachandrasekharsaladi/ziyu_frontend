import { createMockChatService } from '@/services/chat/mock'

const instant = { statusStepMs: 0, typingDelayMs: 0, replyDelayMs: 0 }

describe('mock chat service', () => {
  it('seeds the conversation from the Figma frame', async () => {
    const service = createMockChatService(instant)
    const messages = await service.listMessages()

    expect(messages).toHaveLength(5)
    expect(messages[0].body).toBe('Are we still going for coffee tonight? ☰❤️')
    expect(messages[0].authorId).toBe('partner')
    expect(messages[1].body).toBe('Obviously.')
    expect(messages[1].authorId).toBe('me')
  })

  it('walks an outgoing message through every status', async () => {
    const service = createMockChatService(instant)
    const seen: string[] = []
    service.subscribe((e) => {
      if (e.type === 'status') seen.push(e.status)
    })

    const sent = await service.sendMessage({ kind: 'text', body: 'Hello' })

    expect(sent.status).toBe('sending')
    await new Promise((r) => setTimeout(r, 0))
    expect(seen).toEqual(['sent', 'delivered', 'read'])
  })

  it('attaches and toggles a reaction', async () => {
    const service = createMockChatService(instant)
    const [first] = await service.listMessages()

    const reacted = await service.react(first.id, '❤️')
    expect(reacted.reactions).toEqual([{ emoji: '❤️', authorId: 'me' }])

    const cleared = await service.react(first.id, '❤️')
    expect(cleared.reactions).toEqual([])
  })

  it('toggles pinned', async () => {
    const service = createMockChatService(instant)
    const [first] = await service.listMessages()

    expect((await service.togglePin(first.id)).pinned).toBe(true)
    expect((await service.togglePin(first.id)).pinned).toBe(false)
  })

  it('searches case-insensitively on body text', async () => {
    const service = createMockChatService(instant)

    const hits = await service.search('COFFEE')
    expect(hits).toHaveLength(1)
    expect(hits[0].body).toContain('coffee')
  })

  it('does not auto-reply to a photo', async () => {
    const service = createMockChatService(instant)
    const replies: string[] = []
    service.subscribe((e) => {
      if (e.type === 'message') replies.push(e.message.id)
    })

    await service.sendMessage({ kind: 'photo', mediaUri: 'file://p.jpg' })
    await new Promise((r) => setTimeout(r, 0))

    expect(replies).toHaveLength(0)
  })

  it('stops delivering events after unsubscribe', async () => {
    const service = createMockChatService(instant)
    let count = 0
    const off = service.subscribe(() => { count += 1 })
    off()

    await service.sendMessage({ kind: 'text', body: 'Hi' })
    await new Promise((r) => setTimeout(r, 0))

    expect(count).toBe(0)
  })
})
