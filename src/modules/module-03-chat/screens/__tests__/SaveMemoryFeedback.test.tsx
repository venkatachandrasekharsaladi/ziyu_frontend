import { act, screen, userEvent } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'

import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { renderScreen } from '@/test/renderScreen'

/**
 * FIX — a failed (or, just as silently, a successful) Save Memory used to
 * leave the context menu open with no sign of what happened. This is the
 * screen-level, mutation-verifiable proof that `FeedbackBanner` is actually
 * wired to `saveAsMemory`'s real outcome, not merely present in the tree.
 *
 * Only `memoriesService` is mocked, same reasoning as `SaveMemory.test.tsx`:
 * the real `chatService` mock seeds one actual thread ("m1" is "Are we still
 * going for coffee tonight? ❤️"), so this suite stays about what the SCREEN
 * does with a real pass/fail answer, not a hand-built fixture standing in
 * for either service.
 */
jest.mock('@/services/memories', () => ({
  memoriesService: { create: jest.fn() },
}))

const mockMemoriesService = jest.mocked(memoriesService)

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
  // Bare, not inside `act()` — the harness footgun `SaveMemory.test.tsx` and
  // `DesignParity.test.tsx` both already document: resetting inside `act()`
  // before anything is mounted leaves the next `render()` in this file with
  // an empty tree.
  useChatStore.getState().reset()
})

describe('Save Memory feedback', () => {
  it('confirms a successful save through the real context menu, and dismisses itself once its timer elapses', async () => {
    jest.useFakeTimers()
    try {
      mockMemoriesService.create.mockResolvedValue({ ok: true, value: memoryFrom() })

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      await renderScreen(<ConversationScreen />)
      await screen.findByText(/Are we still going for coffee tonight/)

      // Selecting the message the same way a long-press would leave the
      // store — the overlay/menu themselves are already covered by
      // `ConversationFlow.test.tsx`; what is new here is what happens after
      // "Save Memory" is actually pressed.
      await act(async () => { useChatStore.getState().selectMessage('m1') })
      await user.press(await screen.findByLabelText('Save Memory'))

      expect(await screen.findByText('Saved to Memories.')).toBeTruthy()

      await act(async () => { jest.advanceTimersByTime(3000) })
      expect(screen.queryByText('Saved to Memories.')).toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })

  it('reports failure through the same control, and leaves the message selected so a retry is possible', async () => {
    mockMemoriesService.create.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })

    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText(/Are we still going for coffee tonight/)

    await act(async () => { useChatStore.getState().selectMessage('m1') })
    await user.press(await screen.findByLabelText('Save Memory'))

    expect(await screen.findByText('Could not save to Memories. Try again.')).toBeTruthy()
    // No optimistic lie: `chatStore.test.ts`/`SaveMemory.test.tsx` already
    // assert this at the store level; this is the screen-level proof the
    // banner sits ALONGSIDE that behaviour, not in place of it.
    expect(useChatStore.getState().selectedMessageId).toBe('m1')
  })

  it('announces the save result to screen readers, not just draws it', async () => {
    mockMemoriesService.create.mockResolvedValue({ ok: true, value: memoryFrom() })
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')

    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText(/Are we still going for coffee tonight/)

    await act(async () => { useChatStore.getState().selectMessage('m1') })
    await user.press(await screen.findByLabelText('Save Memory'))

    await screen.findByText('Saved to Memories.')
    expect(announceSpy).toHaveBeenCalledWith('Saved to Memories.')
    announceSpy.mockRestore()
  })
})
