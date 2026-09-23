import { screen, userEvent } from '@testing-library/react-native'

import { APP_NAV } from '@/copy/appNav'
import { HOME_DASHBOARD_COPY } from '@/copy/homeDashboard'
import { PERSONALIZE_SPACE_COPY } from '@/copy/personalizeSpace'
import { READY_TO_COME_HOME_COPY } from '@/copy/readyToComeHome'
import { WELCOME_HOME_COPY } from '@/copy/welcomeHome'
import { HomeDashboardScreen } from '@/modules/module-02-home/screens/HomeDashboardScreen'
import { PersonalizeSpaceScreen } from '@/modules/module-01-onboarding/screens/PersonalizeSpaceScreen'
import { ReadyToComeHomeScreen } from '@/modules/module-01-onboarding/screens/ReadyToComeHomeScreen'
import { WelcomeHomeScreen } from '@/modules/module-01-onboarding/screens/WelcomeHomeScreen'
import { SAMPLE_HOME } from '@/sample/home'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockReplace.mockClear()
  useStoryStore.getState().reset()
  useSpaceStore.getState().reset()
  useRelationshipStore.getState().reset()
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

/**
 * The dashboard as the design draws it, which means sample content is on. The
 * genuine no-data behaviour is asserted in `HomeDashboardNoSample.test.tsx`,
 * with the switch off — both states are real, so both are tested.
 */
describe('M02-S01 Home Dashboard', () => {
  it('counts real days together from the date the couple entered', async () => {
    const d = new Date()
    d.setDate(d.getDate() - 100)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    useStoryStore.getState().setMet({ value: iso, precision: 'exact' })

    await renderScreen(<HomeDashboardScreen />)

    // The real count wins over the sample one.
    expect(screen.getByText(HOME_DASHBOARD_COPY.daysTogetherLine(100))).toBeTruthy()
    expect(
      screen.queryByText(HOME_DASHBOARD_COPY.daysTogetherLine(SAMPLE_HOME.daysTogether)),
    ).toBeNull()
  })

  it('lists the dates that were saved, and drops the sample ones', async () => {
    useStoryStore.getState().setKeyDates({ anniversary: '2020-07-21' })

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.dates.anniversary)).toBeTruthy()
    expect(screen.queryByText(HOME_DASHBOARD_COPY.emptyCalendar.heading)).toBeNull()
    // A real date replaces the sample list rather than appending to it.
    expect(screen.queryByText(SAMPLE_HOME.comingUp[0].label)).toBeNull()
  })

  it('greets the couple by their space name once it has one', async () => {
    useSpaceStore.getState().setSpace({ name: 'Our Little World', coverStyle: 'dawn' })
    // The couple greeting is for a partner who is actually there.
    useRelationshipStore.getState().connect()

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(/Our Little World/)).toBeTruthy()
  })

  it('swaps in a solo line once there is a real space but no partner yet', async () => {
    useSpaceStore.getState().setSpace({ name: 'Our Little World', coverStyle: 'dawn' })

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.queryByText(/Our Little World/)).toBeNull()
    expect(
      HOME_DASHBOARD_COPY.soloGreetings.some((line) => screen.queryByText(line) !== null),
    ).toBe(true)
  })

  it('draws the sections the canvas annotated as needed', async () => {
    await renderScreen(<HomeDashboardScreen />)

    // "Your little world" and "Coming up" both carry a `need this section` note.
    expect(screen.getByText(HOME_DASHBOARD_COPY.littleWorldLabel)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.comingUpLabel)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.littleThingsLabel)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.featuredLabel)).toBeTruthy()

    for (const stat of SAMPLE_HOME.stats) {
      expect(screen.getByText(stat.label)).toBeTruthy()
    }
  })

  it('no longer offers quick actions that pointed at screens that do not exist', async () => {
    await renderScreen(<HomeDashboardScreen />)

    // "Our Places" and "Shared List" were in no frame and had no route.
    expect(screen.queryByLabelText('Our Places')).toBeNull()
    expect(screen.queryByLabelText('Shared List')).toBeNull()
  })

  it('opens the featured memory rather than the library', async () => {
    const user = userEvent.setup()
    const featured = SAMPLE_MEMORIES.find((m) => m.photoUri)!

    await renderScreen(<HomeDashboardScreen />)

    await user.press(screen.getByRole('button', { name: HOME_DASHBOARD_COPY.featuredBackstory }))

    expect(mockPush).toHaveBeenCalledWith(`/(app)/memories/${featured.id}`)
  })

  it('shows the memory\'s own note, and lets Favourite be toggled', async () => {
    const user = userEvent.setup()
    const featured = SAMPLE_MEMORIES.find((m) => m.photoUri)!

    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(featured.note!)).toBeTruthy()

    const favourite = screen.getByRole('button', { name: HOME_DASHBOARD_COPY.featuredFavorite })
    await user.press(favourite)
    // A toggle, not a navigation — pressing it does not leave the screen.
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/memories/'))
  })

  it('sends the birthday spotlight to the memory form', async () => {
    const user = userEvent.setup()
    await renderScreen(<HomeDashboardScreen />)

    await user.press(screen.getByRole('button', { name: SAMPLE_HOME.spotlight.primary }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/new')
  })

  it('opens the occasion behind a Coming up row', async () => {
    const user = userEvent.setup()
    const birthday = SAMPLE_HOME.comingUp.find((r) => r.key === 'partnerBirthday')!

    await renderScreen(<HomeDashboardScreen />)

    await user.press(screen.getByLabelText(birthday.label))

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/occasions/[key]',
      params: { key: 'partnerBirthday' },
    })
  })

  it('opens the calendar from a Little things reminder', async () => {
    const user = userEvent.setup()
    const reminder = SAMPLE_HOME.littleThings[0]

    await renderScreen(<HomeDashboardScreen />)

    await user.press(screen.getByLabelText(reminder.text))

    expect(mockPush).toHaveBeenCalledWith('/(app)/calendar')
  })

  it('marks Home as the tab in view, and Memories as somewhere to go', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByLabelText('Home').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    })
    expect(screen.getByLabelText('Memories').props.accessibilityState).toMatchObject({
      selected: false,
      disabled: false,
    })
  })

  it('still disables the tabs whose screens do not exist yet', async () => {
    await renderScreen(<HomeDashboardScreen />)

    // Derived from APP_NAV rather than listed, so lighting a tab up does not
    // leave a test insisting it is still dark.
    for (const tab of APP_NAV.tabs.filter((t) => !t.live)) {
      expect(screen.getByLabelText(tab.label).props.accessibilityState).toMatchObject({
        disabled: true,
      })
    }
  })
})
