import { fireEvent, userEvent } from '@testing-library/react-native'

import { MessageContextMenu } from '@/modules/module-03-chat/components/MessageContextMenu'
import { ReactionBar } from '@/modules/module-03-chat/components/ReactionBar'
import { renderScreen } from '@/test/renderScreen'

describe('ReactionBar', () => {
  it('offers the six emoji the frame draws', async () => {
    const { getByText } = await renderScreen(<ReactionBar onReact={() => {}} onMore={() => {}} />)
    for (const e of ['❤️', '😂', '🥹', '😍', '👍', '✨']) expect(getByText(e)).toBeTruthy()
  })

  it('reports which emoji was chosen', async () => {
    const onReact = jest.fn()
    const { getByText } = await renderScreen(<ReactionBar onReact={onReact} onMore={() => {}} />)
    await fireEvent.press(getByText('❤️'))
    expect(onReact).toHaveBeenCalledWith('❤️')
  })

  it('offers a way to reach more reactions than the six pinned ones', async () => {
    const onMore = jest.fn()
    const { getByLabelText } = await renderScreen(
      <ReactionBar onReact={() => {}} onMore={onMore} />,
    )
    await fireEvent.press(getByLabelText('More reactions'))
    expect(onMore).toHaveBeenCalled()
  })

  // No design exists yet for what "more reactions" opens — `ConversationScreen`
  // omits `onMore` entirely rather than passing a no-op, and this is the
  // control's own half of that: rendering visibly (not silently) unavailable.
  // `userEvent.press`, unlike `fireEvent.press`, honours `disabled`, which is
  // the point — this proves a real press cannot reach a handler that does not
  // exist, not merely that none was called.
  it('renders "more reactions" disabled when no handler is given', async () => {
    const user = userEvent.setup()
    const { getByLabelText } = await renderScreen(<ReactionBar onReact={() => {}} />)

    expect(getByLabelText('More reactions').props.accessibilityState).toMatchObject({
      disabled: true,
    })

    // Must not throw reaching for an absent handler.
    await user.press(getByLabelText('More reactions'))
  })
})

describe('MessageContextMenu', () => {
  it('draws Reply, Copy and Save Memory', async () => {
    const { getByText } = await renderScreen(
      <MessageContextMenu onReply={() => {}} onCopy={() => {}} onSaveMemory={() => {}} />,
    )
    expect(getByText('Reply')).toBeTruthy()
    expect(getByText('Copy')).toBeTruthy()
    expect(getByText('Save Memory')).toBeTruthy()
  })

  it('reports each action separately', async () => {
    const onReply = jest.fn()
    const onCopy = jest.fn()
    const onSaveMemory = jest.fn()
    const { getByText } = await renderScreen(
      <MessageContextMenu onReply={onReply} onCopy={onCopy} onSaveMemory={onSaveMemory} />,
    )

    await fireEvent.press(getByText('Reply'))
    await fireEvent.press(getByText('Copy'))
    await fireEvent.press(getByText('Save Memory'))

    expect(onReply).toHaveBeenCalled()
    expect(onCopy).toHaveBeenCalled()
    expect(onSaveMemory).toHaveBeenCalled()
  })

  // Real "Copy" needs `expo-clipboard`, not installed — `ConversationScreen`
  // omits `onCopy` entirely rather than aliasing it to another action, and
  // this is the control's own half of that: rendering visibly disabled
  // instead of silently doing something else on a tap.
  it('renders Copy disabled when no handler is given', async () => {
    const user = userEvent.setup()
    const { getByLabelText } = await renderScreen(
      <MessageContextMenu onReply={() => {}} onSaveMemory={() => {}} />,
    )

    expect(getByLabelText('Copy').props.accessibilityState).toMatchObject({ disabled: true })

    // Must not throw reaching for an absent handler.
    await user.press(getByLabelText('Copy'))
  })
})
