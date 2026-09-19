import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_EDIT_PROFILE_COPY as COPY } from '@/copy/spaceEditProfile'
import { EditMyProfileScreen } from '@/modules/module-05-profile/screens/EditMyProfileScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('EditMyProfileScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
  })

  it('shows the four fields the frame draws', async () => {
    await renderScreen(<EditMyProfileScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByLabelText(COPY.nameLabel)).toBeTruthy()
    expect(screen.getByLabelText(COPY.nicknameLabel)).toBeTruthy()
    expect(screen.getByLabelText(COPY.pronounsLabel)).toBeTruthy()
  })

  it('opens on the profile already stored', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Sarah Jenkins', nickname: 'Sare' })

    await renderScreen(<EditMyProfileScreen />)

    expect(screen.getByDisplayValue('Sarah Jenkins')).toBeTruthy()
    expect(screen.getByDisplayValue('Sare')).toBeTruthy()
  })

  it('saves what was typed', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setProfile({ name: 'Sarah' })

    await renderScreen(<EditMyProfileScreen />)
    await user.clear(screen.getByLabelText(COPY.nameLabel))
    await user.type(screen.getByLabelText(COPY.nameLabel), 'Sarah Jenkins')
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(useRelationshipStore.getState().profile?.name).toBe('Sarah Jenkins')
  })

  // Two screens edit one profile record. If this one dropped the fields it does
  // not show, opening it would silently unverify your own phone number.
  it('keeps the fields it does not show', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setProfile({
      name: 'Sarah',
      phone: '+15551234567',
      phoneVerified: true,
    })

    await renderScreen(<EditMyProfileScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    const saved = useRelationshipStore.getState().profile
    expect(saved?.phone).toBe('+15551234567')
    expect(saved?.phoneVerified).toBe(true)
  })

  it('refuses an empty name', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setProfile({ name: 'Sarah' })

    await renderScreen(<EditMyProfileScreen />)
    await user.clear(screen.getByLabelText(COPY.nameLabel))
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(screen.getByText(COPY.nameRequired)).toBeTruthy()
  })

  // The photo picker lives on the settings screen that owns expo-image-picker.
  // Tapping here goes there rather than doing nothing.
  it('sends the photo tap somewhere that can change it', async () => {
    const user = userEvent.setup()

    await renderScreen(<EditMyProfileScreen />)
    await user.press(screen.getByLabelText(COPY.photo))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/personal-details')
  })
})
