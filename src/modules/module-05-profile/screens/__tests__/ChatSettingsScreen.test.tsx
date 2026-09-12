import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { SETTINGS_CHAT_COPY as COPY } from '@/copy/settingsChat'
import { ChatSettingsScreen } from '@/modules/module-05-profile/screens/ChatSettingsScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('ChatSettingsScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<ChatSettingsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('turns read receipts off', async () => {
    await renderScreen(<ChatSettingsScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.readReceipts }), 'valueChange', false)

    expect(usePreferencesStore.getState().readReceipts).toBe(false)
  })

  it('says out loud that read receipts are reciprocal', async () => {
    await renderScreen(<ChatSettingsScreen />)

    expect(screen.getByText(COPY.readReceiptsDetail)).toBeTruthy()
  })

  it('turns auto-save on', async () => {
    await renderScreen(<ChatSettingsScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.autoSave }), 'valueChange', true)

    expect(usePreferencesStore.getState().autoSaveMedia).toBe(true)
  })

  it('records a message size', async () => {
    const user = userEvent.setup()

    await renderScreen(<ChatSettingsScreen />)
    await user.press(screen.getByText(COPY.textLarge))

    expect(usePreferencesStore.getState().messageTextScale).toBe('large')
  })

  it('will not clear history on the first tap', async () => {
    const user = userEvent.setup()

    await renderScreen(<ChatSettingsScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.clearHistory) }))

    expect(screen.getByText(COPY.clearConfirmTitle)).toBeTruthy()
    expect(screen.queryByText(COPY.clearNotWired)).toBeNull()
  })

  // The banner is the last thing someone reads before they put the phone down,
  // possibly in someone else's hands. It has to say what happened, which is
  // nothing — the second assertion is the one that stays even if the wording
  // changes, because it catches any future copy that claims a deletion this
  // screen cannot perform.
  it('says plainly that nothing was deleted once the clear is confirmed', async () => {
    const user = userEvent.setup()

    await renderScreen(<ChatSettingsScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.clearHistory) }))
    await user.press(screen.getByRole('button', { name: COPY.clearConfirmAction }))

    expect(screen.getByText(COPY.clearNotWired)).toBeTruthy()
    expect(screen.queryAllByText(/cleared|deleted every|removed/i)).toHaveLength(0)
  })
})
