import { act, fireEvent, waitFor } from '@testing-library/react-native'

import { PinnedAndSearchScreen } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

// NOT wrapped in `act()`: doing so before anything is mounted leaves the
// test renderer's root empty on the very next `render()` in this file —
// `ChatHome.test.tsx` and `ConversationFlow.test.tsx` both hit this and
// reset the same bare way. (The brief's own Step 1 snippet wraps this call
// in `act()`; that is the exact footgun, reproduced against this screen —
// every test below failed with "Unable to find an element with
// accessibility label" until this was un-wrapped.)
beforeEach(() => { useChatStore.getState().reset() })

it('finds a message by text', async () => {
  const { getByLabelText, getByText } = await renderScreen(<PinnedAndSearchScreen />)

  // `fireEvent` is async in the installed RNTL v14 (it wraps the handler in
  // `await act`) — awaited here and below so the state update it triggers is
  // flushed before any assertion runs.
  await fireEvent.changeText(getByLabelText('Search messages'), 'coffee')

  await waitFor(() => expect(getByText(/coffee/)).toBeTruthy())
})

it('says so when nothing matches', async () => {
  const { getByLabelText, getByText } = await renderScreen(<PinnedAndSearchScreen />)

  await fireEvent.changeText(getByLabelText('Search messages'), 'zzzz')

  // Asserted unconditionally, not behind an `if` — this is the one string a
  // reviewer already caught passing for nothing once in this plan: if the
  // empty state were ever removed, `getByText` throws and this test fails,
  // rather than silently finding nothing to check.
  await waitFor(() => expect(getByText('No messages found')).toBeTruthy())
})

it('lists pinned messages', async () => {
  await act(async () => {
    await useChatStore.getState().load()
    await useChatStore.getState().togglePin('m1')
  })

  const { getByText } = await renderScreen(<PinnedAndSearchScreen />)
  await waitFor(() => expect(getByText(/coffee tonight/)).toBeTruthy())
})

/**
 * `m1` ("Are we still going for coffee tonight? ☰❤️") is exactly the case
 * Task 14's end-to-end journey hits: pinned, THEN searched for 'coffee'. A
 * fix that only filtered the Results list's failure mode, or forgot to
 * filter at all, renders `m1` once in Pinned and again in Results — this is
 * the test that must fail if that filtering is reverted: it asserts a
 * SINGLE match, not merely "at least one."
 */
it('renders a message that is both pinned and a search hit exactly once', async () => {
  await act(async () => {
    await useChatStore.getState().load()
    await useChatStore.getState().togglePin('m1')
  })

  const { getByLabelText, getAllByText } = await renderScreen(<PinnedAndSearchScreen />)

  await fireEvent.changeText(getByLabelText('Search messages'), 'coffee')

  await waitFor(() => expect(getAllByText(/coffee tonight/)).toHaveLength(1))
})

it('does not say "No messages found" when a query matches only a pinned message', async () => {
  await act(async () => {
    await useChatStore.getState().load()
    await useChatStore.getState().togglePin('m1')
  })

  const { getByLabelText, getByText, queryByText } = await renderScreen(
    <PinnedAndSearchScreen />,
  )

  await fireEvent.changeText(getByLabelText('Search messages'), 'coffee')

  // The match is real and rendered (proves the search actually ran) — it is
  // simply the Pinned section showing it, not Results, and that must not
  // read as "nothing found."
  await waitFor(() => expect(getByText(/coffee tonight/)).toBeTruthy())
  expect(queryByText('No messages found')).toBeNull()
})
