import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_EDIT_PARTNER_COPY as COPY } from '@/copy/spaceEditPartner'
import { EditPartnerDetailsScreen } from '@/modules/module-05-profile/screens/EditPartnerDetailsScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('EditPartnerDetailsScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
  })

  // Reachable from Our Identity before anyone has joined. A form here would
  // invent a partner record for someone who does not exist.
  it('offers no form when there is no partner', async () => {
    await renderScreen(<EditPartnerDetailsScreen />)

    expect(screen.getByText(COPY.noPartnerTitle)).toBeTruthy()
    expect(screen.queryByLabelText(COPY.nameLabel)).toBeNull()
  })

  it('opens the form once a partner exists', async () => {
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Alex' })

    await renderScreen(<EditPartnerDetailsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByDisplayValue('Alex')).toBeTruthy()
  })

  it('saves the details onto the partner', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Alex' })

    await renderScreen(<EditPartnerDetailsScreen />)
    await user.type(screen.getByLabelText(COPY.nicknameLabel), 'Lexi')
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(useRelationshipStore.getState().partner?.nickname).toBe('Lexi')
  })

  // The id is the pairing identity, not a detail, and must survive an edit.
  it('keeps the pairing id', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Alex' })

    await renderScreen(<EditPartnerDetailsScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(useRelationshipStore.getState().partner?.id).toBe('p1')
  })

  // The birthday belongs to the story, where Gentle Reminders reads it from —
  // not to the partner record, which would give the app two answers.
  it('writes the birthday to the story, not the partner', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Alex' })
    useStoryStore.getState().setKeyDates({ partnerBirthday: '1994-08-15' })

    await renderScreen(<EditPartnerDetailsScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(useStoryStore.getState().keyDates?.partnerBirthday).toBe('1994-08-15')
    expect(useRelationshipStore.getState().partner).not.toHaveProperty('birthday')
  })

  it('refuses an empty name', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Alex' })

    await renderScreen(<EditPartnerDetailsScreen />)
    await user.clear(screen.getByLabelText(COPY.nameLabel))
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(screen.getByText(COPY.nameRequired)).toBeTruthy()
  })
})
