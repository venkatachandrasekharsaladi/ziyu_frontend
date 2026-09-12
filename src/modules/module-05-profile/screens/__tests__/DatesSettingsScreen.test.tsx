import { screen, userEvent, within } from '@testing-library/react-native'

import { SETTINGS_DATES_COPY as COPY } from '@/copy/settingsDates'
import { DatesSettingsScreen } from '@/modules/module-05-profile/screens/DatesSettingsScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('DatesSettingsScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<DatesSettingsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('starts anniversaries a week ahead', async () => {
    await renderScreen(<DatesSettingsScreen />)

    expect(usePreferencesStore.getState().anniversaryLead).toBe('weekBefore')
  })

  it('records a different lead for anniversaries without moving birthdays', async () => {
    const user = userEvent.setup()

    await renderScreen(<DatesSettingsScreen />)
    // Each group renders its own set of segments, so scope the query to the
    // anniversary control rather than matching the first "Same day" on screen.
    const anniversary = screen.getByTestId('lead-anniversary')
    await user.press(within(anniversary).getByText(COPY.sameDay))

    expect(usePreferencesStore.getState().anniversaryLead).toBe('sameDay')
    expect(usePreferencesStore.getState().birthdayLead).toBe('weekBefore')
  })

  it('routes through to the calendar to manage dates', async () => {
    const user = userEvent.setup()

    await renderScreen(<DatesSettingsScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.manageDates) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/calendar')
  })
})
