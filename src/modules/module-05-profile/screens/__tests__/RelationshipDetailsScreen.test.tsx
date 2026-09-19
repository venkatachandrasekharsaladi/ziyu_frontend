import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_RELATIONSHIP_COPY as COPY } from '@/copy/spaceRelationship'
import { RelationshipDetailsScreen } from '@/modules/module-05-profile/screens/RelationshipDetailsScreen'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('RelationshipDetailsScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useStoryStore.getState().reset()
  })

  it('draws all four anchors', async () => {
    await renderScreen(<RelationshipDetailsScreen />)

    expect(screen.getByText(COPY.togetherSince)).toBeTruthy()
    expect(screen.getByText(COPY.firstDate)).toBeTruthy()
    expect(screen.getByText(COPY.firstTrip)).toBeTruthy()
    expect(screen.getByText(COPY.nextMilestone)).toBeTruthy()
  })

  // The frame is drawn with one couple's answers. None of them are hard-coded.
  it('borrows nobody else’s story when the store is empty', async () => {
    await renderScreen(<RelationshipDetailsScreen />)

    expect(screen.getByText(COPY.togetherSinceEmpty)).toBeTruthy()
    expect(screen.queryByText(/Little Owl/)).toBeNull()
    expect(screen.queryByText(/Kyoto/)).toBeNull()
  })

  it('shows the day they met and counts from it', async () => {
    useStoryStore.getState().setMet({ value: '2018-10-14', precision: 'exact' })

    await renderScreen(<RelationshipDetailsScreen />)

    expect(screen.getByText('October 14, 2018')).toBeTruthy()
    expect(screen.getByText(/DAYS OF US/)).toBeTruthy()
  })

  it('shows a moment once one is recorded', async () => {
    useStoryStore.getState().setFirstDate({
      location: 'The Little Owl Cafe',
      note: 'It rained, and we shared one tiny umbrella.',
      date: '2018-10-14',
    })

    await renderScreen(<RelationshipDetailsScreen />)

    expect(screen.getByText('The Little Owl Cafe')).toBeTruthy()
    expect(screen.getByText('It rained, and we shared one tiny umbrella.')).toBeTruthy()
  })

  // Four identical pencils would have a screen reader say "Edit" four times.
  it('names each pencil by the card it belongs to', async () => {
    await renderScreen(<RelationshipDetailsScreen />)

    expect(screen.getByLabelText(COPY.edit(COPY.firstDate))).toBeTruthy()
    expect(screen.getByLabelText(COPY.edit(COPY.firstTrip))).toBeTruthy()
  })

  it('sends a pencil to the screen that owns the value', async () => {
    const user = userEvent.setup()

    await renderScreen(<RelationshipDetailsScreen />)
    await user.press(screen.getByLabelText(COPY.edit(COPY.togetherSince)))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/dates')
  })
})
