import { fireEvent, screen } from '@testing-library/react-native'

import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import type { Message } from '@/services/chat/types'
import { renderScreen } from '@/test/renderScreen'

const message = (over: Partial<Message> = {}): Message => ({
  id: 'm1',
  authorId: 'partner',
  kind: 'text',
  body: 'Just trust me.',
  reactions: [],
  pinned: false,
  sentAt: new Date(Date.UTC(2026, 7, 30, 12, 45)).toISOString(),
  status: 'read',
  ...over,
})

describe('MessageBubble', () => {
  it('renders the body', async () => {
    await renderScreen(<MessageBubble message={message()} />)

    expect(screen.getByText('Just trust me.')).toBeTruthy()
  })

  it('shows a read receipt on outgoing messages only', async () => {
    // Two independent trees in one test, so each assertion needs its own
    // scoped queries rather than the shared `screen` singleton — `screen`
    // only ever binds to the most recently rendered root.
    const out = await renderScreen(<MessageBubble message={message({ authorId: 'me', status: 'read' })} />)
    expect(out.getByLabelText(/^Read/)).toBeTruthy()

    const incoming = await renderScreen(<MessageBubble message={message()} />)
    expect(incoming.queryByLabelText(/^Read/)).toBeNull()
  })

  it('renders reactions attached to the message', async () => {
    await renderScreen(
      <MessageBubble message={message({ reactions: [{ emoji: '❤️', authorId: 'me' }] })} />,
    )

    expect(screen.getByText('❤️')).toBeTruthy()
  })

  it('renders a bare photo message with no caption underneath it', async () => {
    await renderScreen(
      <MessageBubble
        message={message({ kind: 'photo', body: undefined, mediaUri: 'file://a.jpg' })}
      />,
    )

    expect(screen.getByLabelText(/^Photo,/)).toBeTruthy()
    expect(screen.queryByText('Just trust me.')).toBeNull()
  })

  // Boundary 2 of the caption fix: the photo and its caption are additive —
  // a photo message WITH a body has to render both, not the image instead
  // of the body.
  it('renders a photo message with its caption underneath the image', async () => {
    await renderScreen(
      <MessageBubble
        message={message({ kind: 'photo', body: 'us', mediaUri: 'file://a.jpg' })}
      />,
    )

    expect(screen.getByLabelText(/^Photo,/)).toBeTruthy()
    expect(screen.getByText('us')).toBeTruthy()
  })

  // --- Retry (spec §6: a failed send "offers retry", not just marks it) ---

  it('offers a retry control on a failed outgoing message, and nowhere else', async () => {
    const onRetry = jest.fn()
    const failed = await renderScreen(
      <MessageBubble message={message({ authorId: 'me', status: 'failed' })} onRetry={onRetry} />,
    )
    expect(failed.getByLabelText('Retry sending')).toBeTruthy()

    const sent = await renderScreen(
      <MessageBubble message={message({ authorId: 'me', status: 'read' })} onRetry={onRetry} />,
    )
    expect(sent.queryByLabelText('Retry sending')).toBeNull()
  })

  it('reports the failed message\'s own id when its retry control is pressed', async () => {
    const onRetry = jest.fn()
    await renderScreen(
      <MessageBubble
        message={message({ id: 'm-failed', authorId: 'me', status: 'failed' })}
        onRetry={onRetry}
      />,
    )

    await fireEvent.press(screen.getByLabelText('Retry sending'))

    expect(onRetry).toHaveBeenCalledWith('m-failed')
  })

  // --- Reply quote (spec §7/§10.2: the quote shows in the composer AND in
  // the sent bubble — only the composer half existed before this fix) ---

  it('renders the quoted body inside a reply bubble, additively alongside its own body', async () => {
    await renderScreen(
      <MessageBubble
        message={message({ id: 'm2', body: 'Okay, trusting you', replyToId: 'm1' })}
        quotedBody="Just trust me."
      />,
    )

    expect(screen.getByText('Just trust me.')).toBeTruthy()
    expect(screen.getByText('Okay, trusting you')).toBeTruthy()
  })

  it('renders no quote strip on a message with no replyToId', async () => {
    await renderScreen(<MessageBubble message={message()} quotedBody="Should never show" />)

    expect(screen.queryByText('Should never show')).toBeNull()
  })

  // --- Fix 5: accessible names keyed by the message, not just its kind or
  // status — two of the same kind, mounted together, must not collide. ---

  it('gives two outgoing read receipts at different times distinguishable accessible names', async () => {
    const { getAllByLabelText } = await renderScreen(
      <>
        <MessageBubble
          message={message({ id: 'a', authorId: 'me', status: 'read', sentAt: new Date(Date.UTC(2026, 7, 30, 12, 43)).toISOString() })}
        />
        <MessageBubble
          message={message({ id: 'b', authorId: 'me', status: 'read', sentAt: new Date(Date.UTC(2026, 7, 30, 12, 58)).toISOString() })}
        />
      </>,
    )

    const labels = getAllByLabelText(/^Read/).map((el) => el.props.accessibilityLabel)
    expect(labels).toHaveLength(2)
    expect(new Set(labels).size).toBe(2)
  })

  it('gives two captionless photo messages at different times distinguishable accessible names', async () => {
    const { getAllByLabelText } = await renderScreen(
      <>
        <MessageBubble
          message={message({
            id: 'a', kind: 'photo', body: undefined, mediaUri: 'file://a.jpg',
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 43)).toISOString(),
          })}
        />
        <MessageBubble
          message={message({
            id: 'b', kind: 'photo', body: undefined, mediaUri: 'file://b.jpg',
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 58)).toISOString(),
          })}
        />
      </>,
    )

    const labels = getAllByLabelText(/^Photo,/).map((el) => el.props.accessibilityLabel)
    expect(labels).toHaveLength(2)
    expect(new Set(labels).size).toBe(2)
  })

  it('gives two voice notes at different times distinguishable accessible names', async () => {
    const { getAllByLabelText } = await renderScreen(
      <>
        <MessageBubble
          message={message({
            id: 'a', kind: 'voice', body: undefined, mediaUri: 'file://a.m4a', durationMs: 1000,
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 43)).toISOString(),
          })}
        />
        <MessageBubble
          message={message({
            id: 'b', kind: 'voice', body: undefined, mediaUri: 'file://b.m4a', durationMs: 2000,
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 58)).toISOString(),
          })}
        />
      </>,
    )

    const labels = getAllByLabelText(/^Play voice note/).map((el) => el.props.accessibilityLabel)
    expect(labels).toHaveLength(2)
    expect(new Set(labels).size).toBe(2)
  })

  it('gives two captionless bubbles of the same kind distinct whole-bubble accessible names too', async () => {
    const { getAllByLabelText } = await renderScreen(
      <>
        <MessageBubble
          message={message({
            id: 'a', kind: 'photo', body: undefined, mediaUri: 'file://a.jpg',
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 43)).toISOString(),
          })}
        />
        <MessageBubble
          message={message({
            id: 'b', kind: 'photo', body: undefined, mediaUri: 'file://b.jpg',
            sentAt: new Date(Date.UTC(2026, 7, 30, 12, 58)).toISOString(),
          })}
        />
      </>,
    )

    const labels = getAllByLabelText(/^Photo message, sent at/).map((el) => el.props.accessibilityLabel)
    expect(labels).toHaveLength(2)
    expect(new Set(labels).size).toBe(2)
    // And neither one collides with `Composer`'s own "Message" label.
    expect(labels.every((l) => l !== 'Message')).toBe(true)
  })
})
