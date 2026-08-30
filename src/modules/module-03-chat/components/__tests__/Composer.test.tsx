import { fireEvent } from '@testing-library/react-native'

import { Composer } from '@/modules/module-03-chat/components/Composer'
import { renderScreen } from '@/test/renderScreen'

const noop = () => {}

describe('Composer', () => {
  it('labels every icon-only control', async () => {
    const { getByLabelText } = await renderScreen(
      <Composer value="" onChangeText={noop} onSend={noop} onAttach={noop} onRecord={noop} />,
    )

    expect(getByLabelText('Add attachment')).toBeTruthy()
    expect(getByLabelText('Record voice note')).toBeTruthy()
  })

  it('sends the typed text', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <Composer value="Hello" onChangeText={noop} onSend={onSend} onAttach={noop} onRecord={noop} />,
    )

    fireEvent.press(getByLabelText('Send message'))
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('offers send instead of record once there is text', async () => {
    const { queryByLabelText } = await renderScreen(
      <Composer value="Hi" onChangeText={noop} onSend={noop} onAttach={noop} onRecord={noop} />,
    )

    expect(queryByLabelText('Record voice note')).toBeNull()
  })

  it('shows the quoted message when replying', async () => {
    const { getByText } = await renderScreen(
      <Composer
        value=""
        onChangeText={noop}
        onSend={noop}
        onAttach={noop}
        onRecord={noop}
        replyTo="Just trust me."
        onCancelReply={noop}
      />,
    )

    expect(getByText('Just trust me.')).toBeTruthy()
  })
})
