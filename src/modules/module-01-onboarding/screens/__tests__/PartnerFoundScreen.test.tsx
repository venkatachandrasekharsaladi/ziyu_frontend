import { screen, userEvent } from '@testing-library/react-native'

import { PARTNER_FOUND_COPY as COPY } from '@/copy/partnerFound'
import { PartnerFoundScreen } from '@/modules/module-01-onboarding/screens/PartnerFoundScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

describe('PartnerFoundScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
    useRelationshipStore.getState().reset()
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })
  })

  it('names the partner it found', async () => {
    await renderScreen(<PartnerFoundScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede('Chandu'))).toBeTruthy()
  })

  it('shows the partner as an avatar', async () => {
    await renderScreen(<PartnerFoundScreen />)

    expect(screen.getByLabelText('Chandu')).toBeTruthy()
  })

  it('advances to confirmation', async () => {
    const user = userEvent.setup()
    await renderScreen(<PartnerFoundScreen />)

    await user.press(screen.getByRole('button', { name: COPY.confirm }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/confirm-partner')
  })

  it('goes back to code entry when it is the wrong person', async () => {
    const user = userEvent.setup()
    await renderScreen(<PartnerFoundScreen />)

    await user.press(screen.getByRole('button', { name: COPY.reject }))

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/enter-code')
  })

  it('sends someone who arrived with no partner back to code entry', async () => {
    // Reachable by deep link or a reload on web, where the store is empty.
    useRelationshipStore.getState().reset()

    await renderScreen(<PartnerFoundScreen />)

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/enter-code')
  })
})
