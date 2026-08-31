import { userEvent } from '@testing-library/react-native'

import { ChatHeader } from '@/modules/module-03-chat/components/ChatHeader'
import { renderScreen } from '@/test/renderScreen'

const noop = () => {}

describe('ChatHeader', () => {
  // No design exists yet for what "More options" opens — `ConversationScreen`
  // omits `onMore` entirely rather than passing a no-op. `userEvent.press`,
  // unlike `fireEvent.press`, honours `disabled`, which is the point: this
  // proves a real press cannot reach a handler that does not exist.
  it('renders "More options" disabled when no handler is given', async () => {
    const user = userEvent.setup()
    const { getByLabelText } = await renderScreen(
      <ChatHeader onBack={noop} onVideoCall={noop} onVoiceCall={noop} />,
    )

    expect(getByLabelText('More options').props.accessibilityState).toMatchObject({
      disabled: true,
    })

    await user.press(getByLabelText('More options'))
  })

  it('reads "Online" when the partner is not typing (the default)', async () => {
    const { getByText, queryByText } = await renderScreen(
      <ChatHeader onBack={noop} onVideoCall={noop} onVoiceCall={noop} />,
    )

    expect(getByText('Online')).toBeTruthy()
    expect(queryByText('Typing…')).toBeNull()
  })

  // Fixes the divergence `docs/qa/chat-test-cases.md` used to document under
  // CHAT-025 / "Known design divergences" #3: the header never reflected
  // `isPartnerTyping` at all, only ever "Online".
  it('swaps to "Typing…" while the partner is typing, and back once they stop', async () => {
    const { getByText, queryByText, rerender } = await renderScreen(
      <ChatHeader onBack={noop} onVideoCall={noop} onVoiceCall={noop} isPartnerTyping />,
    )

    expect(getByText('Typing…')).toBeTruthy()
    expect(queryByText('Online')).toBeNull()

    // `rerender`, like `render`/`unmount` in this RNTL version, is async —
    // an un-awaited call here left the assertions below racing a commit that
    // hadn't happened yet, the same footgun this module's other suites
    // already document for `render`/`unmount`.
    await rerender(<ChatHeader onBack={noop} onVideoCall={noop} onVoiceCall={noop} isPartnerTyping={false} />)

    expect(getByText('Online')).toBeTruthy()
    expect(queryByText('Typing…')).toBeNull()
  })
})
