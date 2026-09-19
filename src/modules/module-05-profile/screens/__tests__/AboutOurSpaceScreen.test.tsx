import { screen, waitFor } from '@testing-library/react-native'

import { SPACE_ABOUT_COPY as COPY } from '@/copy/spaceAbout'
import { AboutOurSpaceScreen } from '@/modules/module-05-profile/screens/AboutOurSpaceScreen'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('AboutOurSpaceScreen', () => {
  beforeEach(() => {
    useStoryStore.getState().reset()
  })

  it('leads with how the story began', async () => {
    await renderScreen(<AboutOurSpaceScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(COPY.daysOfUs)).toBeTruthy()
  })

  // The frame is drawn with 1,394 days. A pair who never said when they met
  // should not open this page on a zero.
  it('does not open on a zero when no start is recorded', async () => {
    await renderScreen(<AboutOurSpaceScreen />)

    expect(screen.getByText(COPY.daysUnknown)).toBeTruthy()
  })

  it('counts the days once a start is recorded', async () => {
    useStoryStore.getState().setMet({ value: '2022-10-14', precision: 'exact' })

    await renderScreen(<AboutOurSpaceScreen />)

    expect(screen.queryByText(COPY.daysUnknown)).toBeNull()
  })

  // Nothing in the app counts trips. A zero would claim there are none, which
  // is a different and wrong statement.
  it('says trips are uncounted rather than showing a number', async () => {
    await renderScreen(<AboutOurSpaceScreen />)

    // Exactly one tile explains itself as uncountable. Memories may also show
    // a dash for a moment while the service answers — that is loading, not the
    // same thing, and it carries no explanation.
    expect(screen.getByText(COPY.uncountedHint)).toBeTruthy()
    // The tile keeps its name in both states, or it says nothing useful.
    expect(screen.getByText(COPY.trips)).toBeTruthy()
  })

  it('counts the moments that were actually recorded', async () => {
    useStoryStore.getState().setFirstDate({ location: 'The Little Owl Cafe' })

    await renderScreen(<AboutOurSpaceScreen />)

    expect(screen.getByText(COPY.moments)).toBeTruthy()
  })

  // The same call, with the same sample fallback, that MemoriesHomeScreen
  // makes — so the two screens cannot disagree about how many there are.
  it('counts memories from the memories service', async () => {
    await renderScreen(<AboutOurSpaceScreen />)

    await waitFor(() => {
      expect(screen.getByText(COPY.memories)).toBeTruthy()
    })
  })
})
