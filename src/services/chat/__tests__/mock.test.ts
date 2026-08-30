import { createMockChatService } from '@/services/chat/mock'

const instant = { statusStepMs: 0, typingDelayMs: 0, replyDelayMs: 0 }

describe('mock chat service', () => {
  it('seeds the conversation from the Figma frame', async () => {
    const service = createMockChatService(instant)
    const messages = await service.listMessages()

    expect(messages).toHaveLength(5)

    // Verify the exact conversation from Figma frame 3390:665 with alternating authors
    expect(messages[0]).toMatchObject({
      body: 'Are we still going for coffee tonight? ☰❤️',
      authorId: 'partner',
    })
    expect(messages[1]).toMatchObject({
      body: 'Obviously.',
      authorId: 'me',
    })
    expect(messages[2]).toMatchObject({
      body: 'Good. I found a place you might actually like 😊',
      authorId: 'partner',
    })
    expect(messages[3]).toMatchObject({
      body: "That's a bold claim.",
      authorId: 'me',
    })
    expect(messages[4]).toMatchObject({
      body: 'Just trust me.',
      authorId: 'partner',
    })
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

  it('rejects every send when configured to fail, without queuing anything', async () => {
    const service = createMockChatService(instant, { failSends: true })

    await expect(service.sendMessage({ kind: 'text', body: 'Hello' })).rejects.toThrow()

    // The thread is untouched — a failed send never reached the server.
    expect(await service.listMessages()).toHaveLength(5)
  })

  it('leaves failSends off by default, so every other test above still holds', async () => {
    const service = createMockChatService(instant)

    await expect(service.sendMessage({ kind: 'text', body: 'Hello' })).resolves.toMatchObject({
      status: 'sending',
    })
  })
})
