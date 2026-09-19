import { screen, userEvent } from '@testing-library/react-native'

import { MOODS, SPACE_MOOD_COPY as COPY } from '@/copy/spaceMood'
import { SpaceMoodScreen } from '@/modules/module-05-profile/screens/SpaceMoodScreen'
import { useSpaceStore } from '@/state/spaceStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('SpaceMoodScreen', () => {
  beforeEach(() => {
    useSpaceStore.getState().reset()
  })

  it('offers every mood the design draws', async () => {
    await renderScreen(<SpaceMoodScreen />)

    for (const mood of MOODS) {
      expect(screen.getByText(mood.name)).toBeTruthy()
    }
  })

  // "Use This Mood" has to still mean something when you reach it. Tapping a
  // card only moves the selection; backing out leaves the space as it was.
  it('does not repaint the space until the save', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceMoodScreen />)
    await user.press(screen.getByLabelText('Rose Glow'))

    expect(useSpaceStore.getState().mood).toBe('lavenderCalm')
  })

  it('stores the mood on save', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceMoodScreen />)
    await user.press(screen.getByLabelText('Rose Glow'))
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(useSpaceStore.getState().mood).toBe('roseGlow')
    expect(screen.getByText(COPY.saved)).toBeTruthy()
  })

  // A tick is a shape. The card has to SAY it is the chosen one as well.
  it('announces the chosen mood rather than only ticking it', async () => {
    await renderScreen(<SpaceMoodScreen />)

    expect(screen.getByLabelText(`Lavender Calm, ${COPY.selected}`)).toBeTruthy()
  })

  it('opens on the mood already stored', async () => {
    useSpaceStore.getState().setMood('midnightQuiet')

    await renderScreen(<SpaceMoodScreen />)

    expect(screen.getByLabelText(`Midnight Quiet, ${COPY.selected}`)).toBeTruthy()
  })
})
