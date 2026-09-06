import { waitFor } from '@testing-library/react-native'

import { APP_NAV } from '@/copy/appNav'
import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { chatService } from '@/services/chat'
import type { ChatEvent, Message } from '@/services/chat/types'
import { renderScreen } from '@/test/renderScreen'

/**
 * The real `chatService` is a module-level singleton over ONE in-memory
 * thread with simulated latency — a message seeded by one test would still
 * be there in the next, so the suite would pass or fail by execution order.
 * It is replaced wholesale, as `chatStore.test.ts` and `ConversationFlow.test.tsx`
 * both already do, and every test states the answer it needs.
 *
 * The mock's own behaviour is covered by `services/chat/__tests__` — these
 * tests are about what the SCREEN does with an answer, not how it is produced.
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
  id,
  authorId,
  kind: 'text',
  body,
  reactions: [],
  pinned: false,
  sentAt: new Date().toISOString(),
  status: 'read',
})

let listeners: ((event: ChatEvent) => void)[] = []

beforeEach(() => {
  jest.clearAllMocks()
  listeners = []
  service.subscribe.mockImplementation((listener) => {
    listeners = [...listeners, listener]
    return () => { listeners = listeners.filter((l) => l !== listener) }
  })

  // NOT wrapped in `act()`: doing so — with nothing yet mounted — leaves the
  // test renderer's root empty on the very next `render()` call in this
  // file. `ConversationFlow.test.tsx` resets its store the same bare way for
  // the same reason.
  useChatStore.getState().reset()
})

describe('ChatHomeScreen', () => {
  it('shows the conversation with a preview of the newest message', async () => {
    service.listMessages.mockResolvedValue([
      message('m1', 'partner', 'Are we still going for coffee tonight?'),
      message('m2', 'me', 'Just trust me.'),
    ])

    const { getByText } = await renderScreen(<ChatHomeScreen />)

    await waitFor(() => expect(getByText('Chandu & Sweatcha')).toBeTruthy())
    expect(getByText(/Just trust me\./)).toBeTruthy()
  })

  it('leaves a short preview exactly as written', async () => {
    // 14 characters, comfortably under the screen's 34-character budget —
    // pins the OTHER branch of `truncateWords`: nothing to cut, so nothing
    // is cut.
    service.listMessages.mockResolvedValue([message('m1', 'partner', 'Just trust me.')])

    const { getByLabelText } = await renderScreen(<ChatHomeScreen />)

    const preview = await waitFor(() => getByLabelText('Conversation preview'))
    expect(preview.props.children).toBe('Just trust me.')
  })

  it('truncates the preview at a word boundary, never mid-word', async () => {
    // 46 characters against the screen's 34-character budget: truncation
    // MUST occur, so this proves `ChatHomeScreen` is actually wired to
    // `truncateWords` rather than merely rendering the raw body.
    const body = 'I promise it will be worth the wait, trust me.'
    service.listMessages.mockResolvedValue([message('m1', 'partner', body)])

    const { getByLabelText } = await renderScreen(<ChatHomeScreen />)

    const preview = await waitFor(() => getByLabelText('Conversation preview'))
    const text: string = preview.props.children

    expect(text).toBe('I promise it will be worth the…')
    expect(text.endsWith('…')).toBe(true)
    expect(text.length).toBeLessThan(body.length)
    // Never mid-word: the text with the ellipsis stripped must be a prefix
    // of the ORIGINAL body, and the character that immediately follows it
    // there must be a space — proof the cut landed on a word boundary
    // rather than through the middle of a word.
    const prefix = text.slice(0, -1)
    expect(body.startsWith(prefix)).toBe(true)
    expect(body[prefix.length]).toBe(' ')
  })
})

describe('APP_NAV', () => {
  it('has chat live', () => {
    const chat = APP_NAV.tabs.find((t) => t.key === 'chat')
    expect(chat?.live).toBe(true)
    expect(chat?.href).toBe('/(app)/chat')
  })
})
