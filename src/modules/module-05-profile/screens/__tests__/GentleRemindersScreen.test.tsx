import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_REMINDERS_COPY as COPY } from '@/copy/spaceReminders'
import { GentleRemindersScreen } from '@/modules/module-05-profile/screens/GentleRemindersScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('GentleRemindersScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
  })

  // The frame is drawn with a worked example. A reminders page that invents a
  // reminder is worse than one that is briefly quiet.
  it('invents no reminders when no dates were recorded', async () => {
    await renderScreen(<GentleRemindersScreen />)

    expect(screen.getByText(COPY.emptyTitle)).toBeTruthy()
    expect(screen.queryByText(COPY.anniversary)).toBeNull()
  })

  it('offers a way to add dates from the empty state', async () => {
    const user = userEvent.setup()

    await renderScreen(<GentleRemindersScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.addDates) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/dates')
  })

  it('counts down to the anniversary once there is one', async () => {
    useStoryStore.getState().setKeyDates({ anniversary: '2022-10-14' })

    await renderScreen(<GentleRemindersScreen />)

    expect(screen.getByText(COPY.anniversary)).toBeTruthy()
    expect(screen.getByText(COPY.comingUp)).toBeTruthy()
  })

  // A pair who answered "when did you meet" but skipped the anniversary
  // question still have a date worth counting to.
  it('falls back to the day they met', async () => {
    useStoryStore.getState().setMet({ value: '2022-10-14', precision: 'exact' })

    await renderScreen(<GentleRemindersScreen />)

    expect(screen.getByText(COPY.anniversary)).toBeTruthy()
  })

  it('lists only the birthdays it was actually given', async () => {
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Sarah' })
    useStoryStore.getState().setKeyDates({ partnerBirthday: '1994-10-12' })

    await renderScreen(<GentleRemindersScreen />)

    expect(screen.getByText('Sarah')).toBeTruthy()
    expect(screen.getByText('Oct 12')).toBeTruthy()
    expect(screen.queryByText(COPY.yourBirthday)).toBeNull()
  })

  // Nothing in the app stores a half-written memory yet, so the card says so
  // rather than dressing the frame's example draft up as real.
  it('does not fabricate an unfinished draft', async () => {
    useStoryStore.getState().setKeyDates({ anniversary: '2022-10-14' })

    await renderScreen(<GentleRemindersScreen />)

    expect(screen.getByText(COPY.unfinishedEmpty)).toBeTruthy()
    expect(screen.queryByText(/Coastal Drive/)).toBeNull()
  })
})
