import { ChatHeader } from '@/modules/module-03-chat/components/ChatHeader'
import { renderScreen } from '@/test/renderScreen'

const noop = () => {}

describe('ChatHeader', () => {
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
