import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import {
  SPACE_MORE_LINKS,
  SPACE_PREFERENCE_GROUPS,
  SPACE_PREFERENCES_COPY as COPY,
} from '@/copy/spacePreferences'
import { OurPreferencesScreen } from '@/modules/module-05-profile/screens/OurPreferencesScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('OurPreferencesScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    usePreferencesStore.getState().reset()
  })

  // The board draws no way into seven of this section's screens. This list is
  // the one part of the page a designer did not draw, and it is what makes
  // those screens reachable at all.
  it('offers a way into the rest of the section', async () => {
    await renderScreen(<OurPreferencesScreen />)

    expect(SPACE_MORE_LINKS.length).toBeGreaterThan(5)
    for (const link of SPACE_MORE_LINKS) {
      expect(screen.getByText(link.label)).toBeTruthy()
    }
  })

  it('routes through to a linked screen', async () => {
    const user = userEvent.setup()

    await renderScreen(<OurPreferencesScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp('Space Mood') }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/space/mood')
  })

  // Two switches share a name with a bottom-bar tab that is on screen at the
  // same time. The group goes in front so the two never sound identical.
  it('names each switch by its group, so it cannot be confused with a tab', async () => {
    await renderScreen(<OurPreferencesScreen />)

    expect(screen.getByLabelText('Our story, Memories')).toBeTruthy()
    expect(screen.getByLabelText('Memories')).toBeTruthy()
  })

  it('draws all three groups', async () => {
    await renderScreen(<OurPreferencesScreen />)

    for (const group of SPACE_PREFERENCE_GROUPS) {
      expect(screen.getByText(group.title)).toBeTruthy()
    }
  })

  it('draws every switch the frame draws', async () => {
    await renderScreen(<OurPreferencesScreen />)

    const rows = SPACE_PREFERENCE_GROUPS.flatMap((group) =>
      group.rows.map((row) => `${group.spoken}, ${row.label}`),
    )
    expect(rows).toHaveLength(8)
    for (const name of rows) {
      expect(screen.getByLabelText(name)).toBeTruthy()
    }
  })

  it('opens with the states the frame draws', async () => {
    await renderScreen(<OurPreferencesScreen />)

    expect(screen.getByLabelText('Our story, Dates').props.accessibilityState.checked).toBe(true)
    expect(screen.getByLabelText('Our story, Timeline').props.accessibilityState.checked).toBe(false)
  })

  // Each switch is its own decision, so it lands at once — there is no save.
  it('applies a switch immediately', async () => {
    await renderScreen(<OurPreferencesScreen />)

    fireEvent(screen.getByLabelText('Our story, Timeline'), 'valueChange', true)

    expect(usePreferencesStore.getState().spaceTimeline).toBe(true)
  })

  it('moves only the switch that was touched', async () => {
    await renderScreen(<OurPreferencesScreen />)

    fireEvent(screen.getByLabelText('Our space, Milestones'), 'valueChange', false)

    expect(usePreferencesStore.getState().spaceMilestones).toBe(false)
    expect(usePreferencesStore.getState().spaceDaysTogether).toBe(true)
  })
})
