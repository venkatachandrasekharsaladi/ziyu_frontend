import { screen, userEvent } from '@testing-library/react-native'

import { RELATIONSHIP_SETUP_COPY as COPY } from '@/copy/relationshipSetup'
import { RelationshipSetupScreen } from '@/modules/module-01-onboarding/screens/RelationshipSetupScreen'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('RelationshipSetupScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<RelationshipSetupScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('names the product from BRAND rather than a typed literal', async () => {
    await renderScreen(<RelationshipSetupScreen />)

    // The lede interpolates BRAND.name; a hard-coded string would survive a
    // rename and silently go stale.
    expect(COPY.lede).toContain('LoveOS')
  })

  it('offers all three paths', async () => {
    await renderScreen(<RelationshipSetupScreen />)

    expect(screen.getByRole('button', { name: COPY.invite })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.haveCode })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.later })).toBeTruthy()
  })

  it('sends the inviter to profile creation', async () => {
    const user = userEvent.setup()
    await renderScreen(<RelationshipSetupScreen />)

    await user.press(screen.getByRole('button', { name: COPY.invite }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/profile')
  })

  it('sends someone holding a code straight to code entry', async () => {
    const user = userEvent.setup()
    await renderScreen(<RelationshipSetupScreen />)

    await user.press(screen.getByRole('button', { name: COPY.haveCode }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/enter-code')
  })

  it('lets someone skip pairing entirely', async () => {
    const user = userEvent.setup()
    await renderScreen(<RelationshipSetupScreen />)

    await user.press(screen.getByRole('button', { name: COPY.later }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/story-begins')
  })
})
