import { screen, userEvent } from '@testing-library/react-native'

import { MOODS } from '@/copy/spaceMood'
import { CARD_STYLES, MEMORY_STYLES, SPACE_PERSONALIZE_COPY as COPY } from '@/copy/spacePersonalize'
import { PersonalizeOurSpaceScreen } from '@/modules/module-05-profile/screens/PersonalizeOurSpaceScreen'
import { useSpaceStore } from '@/state/spaceStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('PersonalizeOurSpaceScreen', () => {
  beforeEach(() => {
    useSpaceStore.getState().reset()
  })

  it('draws all three choices the frame asks for', async () => {
    await renderScreen(<PersonalizeOurSpaceScreen />)

    expect(screen.getByText(COPY.moodTitle)).toBeTruthy()
    expect(screen.getByText(COPY.memoryTitle)).toBeTruthy()
    expect(screen.getByText(COPY.cardTitle)).toBeTruthy()
  })

  it('offers every option in every group', async () => {
    await renderScreen(<PersonalizeOurSpaceScreen />)

    expect(MOODS).toHaveLength(5)
    for (const style of MEMORY_STYLES) expect(screen.getByLabelText(new RegExp(style.name))).toBeTruthy()
    for (const style of CARD_STYLES) expect(screen.getByLabelText(new RegExp(style.name))).toBeTruthy()
  })

  it('holds every choice until the save', async () => {
    const user = userEvent.setup()

    await renderScreen(<PersonalizeOurSpaceScreen />)
    await user.press(screen.getByLabelText('Filmstrip'))
    await user.press(screen.getByLabelText('Frosted Glass'))

    expect(useSpaceStore.getState().memoryStyle).toBe('polaroid')
    expect(useSpaceStore.getState().cardStyle).toBe('paper')
  })

  it('writes all three together on save', async () => {
    const user = userEvent.setup()

    await renderScreen(<PersonalizeOurSpaceScreen />)
    await user.press(screen.getByLabelText('Rose Glow'))
    await user.press(screen.getByLabelText('Filmstrip'))
    await user.press(screen.getByLabelText('Frosted Glass'))
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    const state = useSpaceStore.getState()
    expect(state.mood).toBe('roseGlow')
    expect(state.memoryStyle).toBe('filmstrip')
    expect(state.cardStyle).toBe('glass')
    expect(screen.getByText(COPY.saved)).toBeTruthy()
  })

  // The mood picker here and the Space Mood screen change the same value, so
  // this screen has to open on whatever that one last stored.
  it('opens on the stored room', async () => {
    useSpaceStore.getState().setRoom({
      mood: 'midnightQuiet',
      memoryStyle: 'clean',
      cardStyle: 'flat',
    })

    await renderScreen(<PersonalizeOurSpaceScreen />)

    expect(screen.getByLabelText(`Midnight Quiet, ${COPY.selected}`)).toBeTruthy()
    expect(screen.getByLabelText(`Clean Frame, ${COPY.selected}`)).toBeTruthy()
    expect(screen.getByLabelText(`Clean & Flat, ${COPY.selected}`)).toBeTruthy()
  })
})
