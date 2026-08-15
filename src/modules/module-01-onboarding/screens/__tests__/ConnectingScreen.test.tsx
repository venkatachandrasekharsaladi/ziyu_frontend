import { screen, waitFor } from '@testing-library/react-native'

import { CONNECTING_COPY as COPY } from '@/copy/connecting'
import { ConnectingScreen } from '@/modules/module-01-onboarding/screens/ConnectingScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

describe('ConnectingScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    useRelationshipStore.getState().reset()
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })
  })

  it('tells the user what is happening', async () => {
    await renderScreen(<ConnectingScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('commits the relationship on mount and replaces rather than pushes', async () => {
    await renderScreen(<ConnectingScreen />)

    // replace, so pressing back never lands on a spinner for an operation that
    // already finished.
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/connected'))
    expect(useRelationshipStore.getState().status).toBe('connected')
  })

  it('surfaces a failure with a way forward instead of spinning', async () => {
    // An empty partner id is the mock's UNKNOWN branch.
    useRelationshipStore.getState().setPartner({ id: '', name: 'Chandu' })

    await renderScreen(<ConnectingScreen />)

    expect(await screen.findByText(COPY.errors.UNKNOWN)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.retry })).toBeTruthy()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
