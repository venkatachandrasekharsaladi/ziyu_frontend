import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { AttachmentSheet } from '@/modules/module-03-chat/components/AttachmentSheet'
import { PhotoMessage } from '@/modules/module-03-chat/components/PhotoMessage'
import { PhotoSharePreview } from '@/modules/module-03-chat/components/PhotoSharePreview'
import { renderScreen } from '@/test/renderScreen'

const noop = () => {}

/**
 * Every `fireEvent` call below is awaited, unlike the brief's own literal
 * snippet. RNTL v14's `fireEvent` (see `node_modules/@testing-library/
 * react-native/dist/fire-event.js`) is `async` — it wraps the handler call in
 * React's own `act()`, which is itself always invoked with an async callback
 * internally, so the state update it triggers is not guaranteed to have
 * committed by the time the NEXT synchronous line runs. Firing two events
 * back-to-back without awaiting the first raced `PhotoSharePreview`'s caption
 * state against the send press (observed: `onSend` was called with `''`
 * instead of `'us'`) and left overlapping, unresolved `act()` calls that
 * corrupted later tests in this same file. `renderScreen`'s own comment notes
 * the same v14 change for `render()`; this is the same fact applied to
 * `fireEvent`.
 */
describe('AttachmentSheet', () => {
  it('offers the four sources the frame draws', async () => {
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={noop} onVoiceNote={noop} onMemory={noop} onClose={noop} />)
    for (const l of ['Photo', 'Camera', 'Voice note', 'Memory']) expect(getByText(l)).toBeTruthy()
  })

  it('reports a photo pick', async () => {
    const onPickPhoto = jest.fn()
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={onPickPhoto} onVoiceNote={noop} onMemory={noop} onClose={noop} />)
    await fireEvent.press(getByText('Photo'))
    expect(onPickPhoto).toHaveBeenCalled()
  })

  // The label-collision guard: `PhotoMessage` carries `accessibilityLabel=
  // "Photo"`, so the tile's own accessible name has to be something else —
  // otherwise a screen with both mounted (Task 14's end-to-end test) would
  // make `getByLabelText('Photo')` ambiguous.
  it('gives the Photo tile a distinct accessible name from a photo message', async () => {
    const { getByLabelText, queryByLabelText } = await renderScreen(
      <AttachmentSheet onPickPhoto={noop} onVoiceNote={noop} onMemory={noop} onClose={noop} />)
    expect(getByLabelText('Choose photo')).toBeTruthy()
    expect(queryByLabelText('Photo')).toBeNull()
  })

  it('starts the real recorder from the Voice note tile', async () => {
    const onVoiceNote = jest.fn()
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={noop} onVoiceNote={onVoiceNote} onMemory={noop} onClose={noop} />)
    await fireEvent.press(getByText('Voice note'))
    expect(onVoiceNote).toHaveBeenCalled()
  })

  it('opens the Memories module from the Memory tile', async () => {
    const onMemory = jest.fn()
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={noop} onVoiceNote={noop} onMemory={onMemory} onClose={noop} />)
    await fireEvent.press(getByText('Memory'))
    expect(onMemory).toHaveBeenCalled()
  })

  // Camera capture needs `expo-image-picker`/`expo-camera`, neither
  // installed — the tile is `disabled` rather than a live-looking no-op.
  // `userEvent.press`, unlike `fireEvent.press`, honours a Pressable's own
  // `disabled` prop, which is the whole point here: this proves a real press
  // does not reach `onClose`, not merely that the handler exists.
  it('renders Camera disabled instead of silently dismissing the sheet', async () => {
    const onClose = jest.fn()
    const user = userEvent.setup()
    const { getByText, getByLabelText } = await renderScreen(
      <AttachmentSheet onPickPhoto={noop} onVoiceNote={noop} onMemory={noop} onClose={onClose} />)

    expect(getByLabelText('Camera').props.accessibilityState).toMatchObject({ disabled: true })

    await user.press(getByText('Camera'))

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('PhotoSharePreview', () => {
  it('sends the staged photo with its caption', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <PhotoSharePreview uri="file://a.jpg" onSend={onSend} onCancel={() => {}} />)

    await fireEvent.changeText(getByLabelText('Caption'), 'us')
    await fireEvent.press(getByLabelText('Send photo'))

    expect(onSend).toHaveBeenCalledWith('file://a.jpg', 'us')
  })

  it('cancels without sending anything', async () => {
    const onSend = jest.fn()
    const onCancel = jest.fn()
    const { getByLabelText } = await renderScreen(
      <PhotoSharePreview uri="file://a.jpg" onSend={onSend} onCancel={onCancel} />)

    await fireEvent.press(getByLabelText('Cancel photo'))

    expect(onCancel).toHaveBeenCalled()
    expect(onSend).not.toHaveBeenCalled()
  })
})

describe('PhotoMessage', () => {
  it('carries the "Photo" accessible name the bubble needs', async () => {
    await renderScreen(<PhotoMessage uri="file://a.jpg" />)
    expect(screen.getByLabelText('Photo')).toBeTruthy()
  })
})
