import { screen, userEvent } from '@testing-library/react-native'

import { HOME_DASHBOARD_COPY } from '@/copy/homeDashboard'
import { PERSONALIZE_SPACE_COPY } from '@/copy/personalizeSpace'
import { READY_TO_COME_HOME_COPY } from '@/copy/readyToComeHome'
import { WELCOME_HOME_COPY } from '@/copy/welcomeHome'
import { HomeDashboardScreen } from '@/modules/module-02-home/screens/HomeDashboardScreen'
import { PersonalizeSpaceScreen } from '@/modules/module-01-onboarding/screens/PersonalizeSpaceScreen'
import { ReadyToComeHomeScreen } from '@/modules/module-01-onboarding/screens/ReadyToComeHomeScreen'
import { WelcomeHomeScreen } from '@/modules/module-01-onboarding/screens/WelcomeHomeScreen'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockReplace.mockClear()
  useStoryStore.getState().reset()
  useSpaceStore.getState().reset()
})

describe('M01-S20 Personalize Our Space', () => {
  it('needs a name before it will continue', async () => {
    const user = userEvent.setup()
    await renderScreen(<PersonalizeSpaceScreen />)

    await user.press(screen.getByRole('button', { name: PERSONALIZE_SPACE_COPY.submit }))

    expect(await screen.findByText(PERSONALIZE_SPACE_COPY.nameRequired)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('keeps the name and the chosen cover, then advances', async () => {
    const user = userEvent.setup()
    await renderScreen(<PersonalizeSpaceScreen />)

    await user.type(
      screen.getByLabelText(PERSONALIZE_SPACE_COPY.nameLabel),
      'Praveen & Chandu',
    )
    await user.press(screen.getByLabelText('Night'))
    await user.press(screen.getByRole('button', { name: PERSONALIZE_SPACE_COPY.submit }))

    expect(useSpaceStore.getState().name).toBe('Praveen & Chandu')
    expect(useSpaceStore.getState().coverStyle).toBe('night')
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/ready-to-come-home')
  })

  it('offers the cover styles by name, not by colour alone', async () => {
    await renderScreen(<PersonalizeSpaceScreen />)

    for (const style of PERSONALIZE_SPACE_COPY.styles) {
      expect(screen.getByLabelText(style.label)).toBeTruthy()
    }
  })
})

describe('M01-S21 Ready to Come Home', () => {
  it('renders and moves to the threshold', async () => {
    const user = userEvent.setup()
    await renderScreen(<ReadyToComeHomeScreen />)

    expect(screen.getByText(READY_TO_COME_HOME_COPY.heading)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: READY_TO_COME_HOME_COPY.submit }))
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/welcome-home')
  })
})

describe('M01-S22 Welcome Home', () => {
  it('replaces into the app rather than pushing', async () => {
    const user = userEvent.setup()
    await renderScreen(<WelcomeHomeScreen />)

    await user.press(screen.getByRole('button', { name: WELCOME_HOME_COPY.submit }))

    // Backing into the setup flow you just finished is nonsense.
    expect(mockReplace).toHaveBeenCalledWith('/(app)/home')
  })
})

describe('M02-S01 Home Dashboard', () => {
  it('admits it cannot count when no meeting date was given', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.daysUnknown)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.daysUnknownHint)).toBeTruthy()
  })

  it('counts real days together from the date the couple entered', async () => {
    const d = new Date()
    d.setDate(d.getDate() - 100)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    useStoryStore.getState().setMet({ value: iso, precision: 'exact' })

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText('100')).toBeTruthy()
  })

  it('says so when no dates were saved, rather than inventing any', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.upcomingEmpty)).toBeTruthy()
  })

  it('lists the dates that were saved', async () => {
    useStoryStore.getState().setKeyDates({ anniversary: '2020-07-21' })

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.dates.anniversary)).toBeTruthy()
    expect(screen.queryByText(HOME_DASHBOARD_COPY.upcomingEmpty)).toBeNull()
  })

  it('shows the space name once it has one', async () => {
    useSpaceStore.getState().setSpace({ name: 'Our Little World', coverStyle: 'dawn' })

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText('Our Little World')).toBeTruthy()
  })

  it('disables the tabs whose screens do not exist yet', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByLabelText('Home').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    })
    expect(screen.getByLabelText('Memories').props.accessibilityState).toMatchObject({
      disabled: true,
    })
  })
})
