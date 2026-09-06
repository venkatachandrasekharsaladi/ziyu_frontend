import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { ENTER_CODE_COPY as COPY } from '@/copy/enterPartnerCode'
import { EnterPartnerCodeScreen } from '@/modules/module-01-onboarding/screens/EnterPartnerCodeScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function enter(code: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(COPY.codeLabel), code)
  await user.press(screen.getByRole('button', { name: COPY.submit }))
  return user
}

describe('EnterPartnerCodeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<EnterPartnerCodeScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.needInvite })).toBeTruthy()
  })

  it('resolves a valid code to a partner and advances', async () => {
    await renderScreen(<EnterPartnerCodeScreen />)

    await enter('L8V7QK')

    await waitFor(() => expect(useRelationshipStore.getState().partner?.name).toBe('Chandu'))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(onboarding)/partner-found'))
  })

  // Every branch of the mock, so no error code can silently fall through to a
  // blank screen.
  it.each([
    ['BADCOD', COPY.errors.CODE_INVALID],
    ['EXPIRE', COPY.errors.CODE_EXPIRED],
    ['SELF12', COPY.errors.CANNOT_PAIR_WITH_SELF],
    ['OFFLIN', COPY.errors.NETWORK],
    ['BROKEN', COPY.errors.UNKNOWN],
  ])('maps %s to its own message', async (code, message) => {
    await renderScreen(<EnterPartnerCodeScreen />)

    await enter(code)

    expect(await screen.findByText(message)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('keeps the entry after a failure so it can be corrected, not retyped', async () => {
    await renderScreen(<EnterPartnerCodeScreen />)

    await enter('BADCOD')
    await screen.findByText(COPY.errors.CODE_INVALID)

    expect(screen.getByLabelText(COPY.codeLabel).props.value).toBe('BADCOD')
  })

  it('offers a way out to someone with no invitation', async () => {
    const user = userEvent.setup()
    await renderScreen(<EnterPartnerCodeScreen />)

    await user.press(screen.getByRole('button', { name: COPY.needInvite }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/setup')
  })
})
