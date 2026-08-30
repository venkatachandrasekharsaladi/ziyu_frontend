import { fireEvent } from '@testing-library/react-native'

import { VoiceNoteRecorder } from '@/modules/module-03-chat/components/VoiceNoteRecorder'
import { VoiceNotePlayer } from '@/modules/module-03-chat/components/VoiceNotePlayer'
import { renderScreen } from '@/test/renderScreen'

describe('VoiceNoteRecorder', () => {
  it('labels cancel and send', async () => {
    const { getByLabelText } = await renderScreen(
      <VoiceNoteRecorder onCancel={() => {}} onSend={() => {}} />)
    expect(getByLabelText('Cancel recording')).toBeTruthy()
    expect(getByLabelText('Send voice note')).toBeTruthy()
  })

  it('sends a duration', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <VoiceNoteRecorder onCancel={() => {}} onSend={onSend} />)
    fireEvent.press(getByLabelText('Send voice note'))
    expect(onSend).toHaveBeenCalledWith(expect.any(Number))
  })
})

describe('VoiceNotePlayer', () => {
  it('shows the duration as minutes and seconds', async () => {
    const { getByText } = await renderScreen(<VoiceNotePlayer durationMs={65000} />)
    expect(getByText('1:05')).toBeTruthy()
  })

  it('labels the play control', async () => {
    const { getByLabelText } = await renderScreen(<VoiceNotePlayer durationMs={1000} />)
    expect(getByLabelText('Play voice note')).toBeTruthy()
  })
})
