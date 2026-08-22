import { screen, userEvent } from '@testing-library/react-native'

import { CONFIRM_PARTNER_COPY as COPY } from '@/copy/confirmPartner'
import { ConfirmPartnerScreen } from '@/modules/module-01-onboarding/screens/ConfirmPartnerScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

describe('ConfirmPartnerScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
    useRelationshipStore.getState().reset()
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })
  })

  it('renders the question and both people', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Praveen' })

    await renderScreen(<ConfirmPartnerScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByLabelText('Praveen')).toBeTruthy()
    expect(screen.getByLabelText('Chandu')).toBeTruthy()
  })

  it('labels the user generically when they never made a profile', async () => {
    // The redeem branch never passes through profile creation (spec section 8),
    // so there is no name to show for this side of the pair.
    await renderScreen(<ConfirmPartnerScreen />)

    expect(screen.getByLabelText(COPY.youLabel)).toBeTruthy()
  })

  it('commits the relationship', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConfirmPartnerScreen />)

    await user.press(screen.getByRole('button', { name: COPY.confirm }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/connecting')
  })

  it('backs out to code entry', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConfirmPartnerScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/enter-code')
  })
})
