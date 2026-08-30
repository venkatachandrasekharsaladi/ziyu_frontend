import { act } from '@testing-library/react-native'

import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

/**
 * Only `memoriesService` is mocked. `chatService` stays the real mock behind
 * `@/services/chat`, so `load()` seeds the actual thread — `m1` is "Are we
 * still going for coffee tonight? ❤️" (`services/chat/mock.ts`'s `seed()`).
 * That keeps this suite about the BRIDGE between the two services, not a
 * hand-built fixture standing in for either.
 *
 * The brief this task started from guessed `memoriesService.create({ note,
 * mediaUri })` resolving a bare `{ id: 'mem1' }`. That is not the real
 * contract in `src/services/memories/types.ts`: `create` takes a full
 * `NewMemory` (`title`, `date` and `tags` required, the photo field is
 * `photoUri` not `mediaUri`) and returns a `Result<Memory>` discriminated
 * union, not a bare object. This mock and the assertions below match that
 * real shape instead.
 */
jest.mock('@/services/memories', () => ({
  memoriesService: { create: jest.fn() },
}))

const service = jest.mocked(memoriesService)

const memoryFrom = (overrides: Partial<Memory> = {}): Memory => ({
  id: 'memory-9',
  title: 'Are we still going for coffee tonight? ❤️',
  date: '2026-08-30',
  tags: ['Little Things'],
  favorite: false,
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  // Bare, not inside `act()` — the harness footgun from Task 6: calling a
  // store's `reset()` inside `act()` before anything is mounted silently
  // yields an empty render tree on the next `render()` in this file.
  useChatStore.getState().reset()
})

describe('Save Memory', () => {
  it('writes the selected message through the real memories contract', async () => {
    service.create.mockResolvedValue({ ok: true, value: memoryFrom() })

    await act(async () => {
      await useChatStore.getState().load()
      await useChatStore.getState().saveAsMemory('m1')
    })

    expect(memoriesService.create).toHaveBeenCalledWith({
      title: 'Are we still going for coffee tonight? ❤️',
      date: '2026-08-30',
      note: 'Are we still going for coffee tonight? ❤️',
      photoUri: undefined,
      tags: ['Little Things'],
    })
  })

  it('carries the photo along when the saved message is a photo', async () => {
    service.create.mockResolvedValue({
      ok: true,
      value: memoryFrom({ title: 'From our chat', note: undefined, photoUri: 'file://x.jpg' }),
    })

    await act(async () => {
      await useChatStore.getState().load()
      // Stage a bare photo message directly on the store — no text body, so
      // the fallback title and the `photoUri` mapping are both exercised.
      useChatStore.setState({
        messages: [
          ...useChatStore.getState().messages,
          {
            id: 'photo1',
            authorId: 'me',
            kind: 'photo',
            mediaUri: 'file://x.jpg',
            reactions: [],
            pinned: false,
            sentAt: '2026-08-30T12:00:00.000Z',
            status: 'read',
          },
        ],
      })
      await useChatStore.getState().saveAsMemory('photo1')
    })

    expect(memoriesService.create).toHaveBeenCalledWith({
      title: 'From our chat',
      date: '2026-08-30',
      note: undefined,
      photoUri: 'file://x.jpg',
      tags: ['Little Things'],
    })
  })

  it('dismisses the selection overlay once the memory is actually saved', async () => {
    service.create.mockResolvedValue({ ok: true, value: memoryFrom() })

    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().selectMessage('m1')
      await useChatStore.getState().saveAsMemory('m1')
    })

    expect(useChatStore.getState().selectedMessageId).toBeNull()
  })

  it('leaves the overlay open, and does not crash, when the service fails', async () => {
    service.create.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })

    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().selectMessage('m1')
      await useChatStore.getState().saveAsMemory('m1')
    })

    // No optimistic lie: the selection this action needs to retry against is
    // still there, because the save never actually succeeded.
    expect(useChatStore.getState().selectedMessageId).toBe('m1')
  })

  it('does nothing for a message id that is not in the thread', async () => {
    await act(async () => {
      await useChatStore.getState().load()
      await useChatStore.getState().saveAsMemory('not-a-real-id')
    })

    expect(memoriesService.create).not.toHaveBeenCalled()
  })
})
