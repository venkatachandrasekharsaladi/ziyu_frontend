import { screen, userEvent } from '@testing-library/react-native'

import { KEEP_PRIVATE_PRINCIPLES, SPACE_KEEP_PRIVATE_COPY as COPY } from '@/copy/spaceKeepPrivate'
import { KeepOurSpacePrivateScreen } from '@/modules/module-05-profile/screens/KeepOurSpacePrivateScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('KeepOurSpacePrivateScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    usePreferencesStore.getState().reset()
  })

  it('makes its three principles', async () => {
    await renderScreen(<KeepOurSpacePrivateScreen />)

    for (const principle of KEEP_PRIVATE_PRINCIPLES) {
      expect(screen.getByText(principle.title)).toBeTruthy()
    }
    expect(screen.getByText(COPY.assistantTitle)).toBeTruthy()
  })

  // "Hidden" and "Internal Only" report what the app does. Making them
  // pressable would promise a setting that does not exist.
  it('reports the two statuses without offering them as controls', async () => {
    await renderScreen(<KeepOurSpacePrivateScreen />)

    expect(screen.getByText('Hidden')).toBeTruthy()
    expect(screen.getByText('Internal Only')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Hidden/ })).toBeNull()
  })

  it('opens on the narrower access level', async () => {
    await renderScreen(<KeepOurSpacePrivateScreen />)

    expect(screen.getByLabelText(`Helpful Nudges Only, ${COPY.selected}`)).toBeTruthy()
  })

  // The one real control on the page, and there is no save to defer it to.
  it('changes the access level on tap', async () => {
    const user = userEvent.setup()

    await renderScreen(<KeepOurSpacePrivateScreen />)
    await user.press(screen.getByLabelText('Full Memory Context'))

    expect(usePreferencesStore.getState().assistantAccess).toBe('full')
  })

  it('sends the CTA to the screen that holds the switches', async () => {
    const user = userEvent.setup()

    await renderScreen(<KeepOurSpacePrivateScreen />)
    await user.press(await screen.findByRole('button', { name: new RegExp(COPY.review) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/privacy')
  })
})
