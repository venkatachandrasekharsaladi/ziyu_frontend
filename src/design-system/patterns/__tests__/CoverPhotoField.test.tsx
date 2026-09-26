import { screen, userEvent } from '@testing-library/react-native'

import { COVER_PHOTO_COPY } from '@/copy/coverPhoto'
import { PHOTO_PICK_COPY } from '@/copy/photoPick'
import { CoverPhotoField } from '@/design-system/patterns/CoverPhotoField'
import { mediaService } from '@/services/media'
import { renderScreen } from '@/test/renderScreen'

/**
 * Mocked at the `services/media` boundary, exactly like `ConversationFlow`'s
 * own picker tests — `usePhotoPick` is real, `expoMedia.ts`'s native call
 * is not, so this asserts the FIELD asks the right thing of the picker, not
 * that a simulator's photo library changed.
 */
jest.mock('@/services/media', () => ({
  mediaService: { pickPhoto: jest.fn(), takePhoto: jest.fn() },
}))

const media = jest.mocked(mediaService)

const PICKED = { uri: 'file://picked.jpg', width: 800, height: 500 }

beforeEach(() => {
  media.pickPhoto.mockReset()
  media.takePhoto.mockReset()
  media.pickPhoto.mockResolvedValue({ ok: true, value: PICKED })
})

describe('CoverPhotoField', () => {
  it('shows the empty state when there is no cover yet', async () => {
    await renderScreen(<CoverPhotoField uri={null} onChange={jest.fn()} testID="cover" />)

    expect(screen.getByText(COVER_PHOTO_COPY.emptyLabel)).toBeTruthy()
  })

  it('shows the current cover photo', async () => {
    await renderScreen(
      <CoverPhotoField uri="https://example.com/a.jpg" onChange={jest.fn()} testID="cover" />,
    )

    expect(screen.getByTestId('cover').props.source).toEqual([{ uri: 'https://example.com/a.jpg' }])
  })

  it('opens the change-photo sheet from the edit badge', async () => {
    const user = userEvent.setup()
    await renderScreen(<CoverPhotoField uri={null} onChange={jest.fn()} testID="cover" />)

    expect(screen.queryByText(COVER_PHOTO_COPY.sheetTitle)).toBeNull()

    await user.press(screen.getByLabelText(COVER_PHOTO_COPY.editLabel))

    expect(screen.getByText(COVER_PHOTO_COPY.sheetTitle)).toBeTruthy()
  })

  it('picks a curated photo and closes the sheet', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<CoverPhotoField uri={null} onChange={onChange} testID="cover" />)

    await user.press(screen.getByLabelText(COVER_PHOTO_COPY.editLabel))
    await user.press(screen.getByLabelText('coastSunset'))

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('photo-1507525428034'))
    expect(screen.queryByText(COVER_PHOTO_COPY.sheetTitle)).toBeNull()
  })

  it('picks from the library and applies the result', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<CoverPhotoField uri={null} onChange={onChange} testID="cover" />)

    await user.press(screen.getByLabelText(COVER_PHOTO_COPY.editLabel))
    await user.press(screen.getByText(COVER_PHOTO_COPY.libraryRow))

    expect(media.pickPhoto).toHaveBeenCalledWith({ allowsEditing: true, aspect: [16, 10] })
    expect(onChange).toHaveBeenCalledWith(PICKED.uri)
  })

  it('shows the shared picker error on a refused permission', async () => {
    media.pickPhoto.mockResolvedValue({ ok: false, error: { code: 'PERMISSION_DENIED' } })
    const user = userEvent.setup()
    await renderScreen(<CoverPhotoField uri={null} onChange={jest.fn()} testID="cover" />)

    await user.press(screen.getByLabelText(COVER_PHOTO_COPY.editLabel))
    await user.press(screen.getByText(COVER_PHOTO_COPY.libraryRow))

    expect(await screen.findByText(PHOTO_PICK_COPY.errors.PERMISSION_DENIED)).toBeTruthy()
  })
})
