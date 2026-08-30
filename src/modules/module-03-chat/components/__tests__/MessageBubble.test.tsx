import { screen } from '@testing-library/react-native'

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
    expect(out.getByLabelText('Read')).toBeTruthy()

    const incoming = await renderScreen(<MessageBubble message={message()} />)
    expect(incoming.queryByLabelText('Read')).toBeNull()
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

    expect(screen.getByLabelText('Photo')).toBeTruthy()
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

    expect(screen.getByLabelText('Photo')).toBeTruthy()
    expect(screen.getByText('us')).toBeTruthy()
  })
})
