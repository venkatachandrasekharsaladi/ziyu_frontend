import { fireEvent } from '@testing-library/react-native'

import { MessageContextMenu } from '@/modules/module-03-chat/components/MessageContextMenu'
import { ReactionBar } from '@/modules/module-03-chat/components/ReactionBar'
import { renderScreen } from '@/test/renderScreen'

describe('ReactionBar', () => {
  it('offers the six emoji the frame draws', async () => {
    const { getByText } = await renderScreen(<ReactionBar onReact={() => {}} onMore={() => {}} />)
    for (const e of ['🖤', '❤️', '😂', '🥺', '😍', '👍']) expect(getByText(e)).toBeTruthy()
  })

  it('reports which emoji was chosen', async () => {
    const onReact = jest.fn()
    const { getByText } = await renderScreen(<ReactionBar onReact={onReact} onMore={() => {}} />)
    fireEvent.press(getByText('❤️'))
    expect(onReact).toHaveBeenCalledWith('❤️')
  })

  it('offers a way to reach more reactions than the six pinned ones', async () => {
    const onMore = jest.fn()
    const { getByLabelText } = await renderScreen(
      <ReactionBar onReact={() => {}} onMore={onMore} />,
    )
    fireEvent.press(getByLabelText('More reactions'))
    expect(onMore).toHaveBeenCalled()
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

    fireEvent.press(getByText('Reply'))
    fireEvent.press(getByText('Copy'))
    fireEvent.press(getByText('Save Memory'))

    expect(onReply).toHaveBeenCalled()
    expect(onCopy).toHaveBeenCalled()
    expect(onSaveMemory).toHaveBeenCalled()
  })
})
