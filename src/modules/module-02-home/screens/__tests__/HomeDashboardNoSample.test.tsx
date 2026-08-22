import { screen } from '@testing-library/react-native'

import { HOME_DASHBOARD_COPY } from '@/copy/homeDashboard'
import { HomeDashboardScreen } from '@/modules/module-02-home/screens/HomeDashboardScreen'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

/**
 * The dashboard with sample content OFF — what a real couple who has entered
 * nothing actually sees.
 *
 * This file exists so `src/sample` cannot quietly become load-bearing. The
 * original rule still holds where it matters: with nothing entered, the screen
 * says so rather than inventing a plausible relationship.
 */
jest.mock('@/sample', () => ({
  ...jest.requireActual('@/sample'),
  USE_SAMPLE_CONTENT: false,
}))

beforeEach(() => {
  useStoryStore.getState().reset()
  useSpaceStore.getState().reset()
})

describe('M02-S01 Home Dashboard — no sample content', () => {
  it('admits it cannot count when no meeting date was given', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.daysUnknown)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.daysUnknownHint)).toBeTruthy()
  })

  it('offers the calendar prompt instead of inventing dates', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.emptyCalendar.heading)).toBeTruthy()
    expect(screen.getByText(HOME_DASHBOARD_COPY.emptyCalendar.lede)).toBeTruthy()
  })

  it('offers the note prompt instead of inventing reminders', async () => {
    await renderScreen(<HomeDashboardScreen />)

    expect(screen.getByText(HOME_DASHBOARD_COPY.emptyNote.heading)).toBeTruthy()
  })

  it('draws no sample-only section', async () => {
    await renderScreen(<HomeDashboardScreen />)

    // Stat tiles, the pulse and the spotlight are all sample-fed: with the
    // switch off they must be absent, not empty shells.
    expect(screen.queryByText(HOME_DASHBOARD_COPY.littleWorldLabel)).toBeNull()
    expect(screen.queryByText(HOME_DASHBOARD_COPY.featuredLabel)).toBeNull()
    expect(screen.queryByTestId('spotlight-photo')).toBeNull()
  })
})
