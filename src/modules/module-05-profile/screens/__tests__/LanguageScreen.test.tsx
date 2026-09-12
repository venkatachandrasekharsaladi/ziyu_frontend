import { screen, userEvent } from '@testing-library/react-native'

import { LANGUAGE_NAMES, SETTINGS_LANGUAGE_COPY as COPY } from '@/copy/settingsLanguage'
import { LanguageScreen } from '@/modules/module-05-profile/screens/LanguageScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('LanguageScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('lists every language in its own language', async () => {
    await renderScreen(<LanguageScreen />)

    expect(screen.getByText(LANGUAGE_NAMES.en)).toBeTruthy()
    expect(screen.getByText(LANGUAGE_NAMES.es)).toBeTruthy()
    expect(screen.getByText(LANGUAGE_NAMES.hi)).toBeTruthy()
  })

  it('is honest that nothing is translated yet', async () => {
    await renderScreen(<LanguageScreen />)

    expect(screen.getByText(COPY.notTranslated)).toBeTruthy()
  })

  it('records a chosen language', async () => {
    const user = userEvent.setup()

    await renderScreen(<LanguageScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(LANGUAGE_NAMES.es) }))

    expect(usePreferencesStore.getState().language).toBe('es')
  })

  it('never asks for a restart', async () => {
    const user = userEvent.setup()

    await renderScreen(<LanguageScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(LANGUAGE_NAMES.fr) }))

    expect(screen.queryByText(/restart/i)).toBeNull()
  })

  it('records a date format', async () => {
    const user = userEvent.setup()

    await renderScreen(<LanguageScreen />)
    await user.press(screen.getByText(COPY.ymd))

    expect(usePreferencesStore.getState().dateFormat).toBe('ymd')
  })

  it('records a clock', async () => {
    const user = userEvent.setup()

    await renderScreen(<LanguageScreen />)
    await user.press(screen.getByText(COPY.twentyFourHour))

    expect(usePreferencesStore.getState().clock).toBe('24h')
  })

  it('records the first day of the week', async () => {
    const user = userEvent.setup()

    await renderScreen(<LanguageScreen />)
    await user.press(screen.getByText(COPY.sunday))

    expect(usePreferencesStore.getState().weekStart).toBe('sunday')
  })
})
