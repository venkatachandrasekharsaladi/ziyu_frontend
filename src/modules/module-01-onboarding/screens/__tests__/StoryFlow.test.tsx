import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { BECAME_US_COPY } from '@/copy/becameUs'
import { DAYS_THAT_MATTER_COPY } from '@/copy/daysThatMatter'
import { FIRST_DATE_COPY } from '@/copy/firstDate'
import { FIRST_MEMORY_COPY } from '@/copy/firstMemory'
import { STORY_COVER_COPY } from '@/copy/storyCover'
import { STORY_READY_COPY } from '@/copy/storyReady'
import { STORY_RECAP_COPY } from '@/copy/storyRecap'
import { WHEN_WE_MET_COPY } from '@/copy/whenWeMet'
import { BecameUsScreen } from '@/modules/module-01-onboarding/screens/BecameUsScreen'
import { DaysThatMatterScreen } from '@/modules/module-01-onboarding/screens/DaysThatMatterScreen'
import { FirstDateMemoryScreen } from '@/modules/module-01-onboarding/screens/FirstDateMemoryScreen'
import { FirstMemoryScreen } from '@/modules/module-01-onboarding/screens/FirstMemoryScreen'
import { StoryCoverScreen } from '@/modules/module-01-onboarding/screens/StoryCoverScreen'
import { StoryReadyScreen } from '@/modules/module-01-onboarding/screens/StoryReadyScreen'
import { StoryRecapScreen } from '@/modules/module-01-onboarding/screens/StoryRecapScreen'
import { WhenWeMetScreen } from '@/modules/module-01-onboarding/screens/WhenWeMetScreen'
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
})

describe('M01-S12 Story Cover', () => {
  it('renders and opens the flow', async () => {
    const user = userEvent.setup()
    await renderScreen(<StoryCoverScreen />)

    expect(screen.getByText(STORY_COVER_COPY.heading)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: STORY_COVER_COPY.begin }))
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/when-we-met')
  })

  it('skips the whole capture flow', async () => {
    const user = userEvent.setup()
    await renderScreen(<StoryCoverScreen />)

    await user.press(screen.getByRole('button', { name: STORY_COVER_COPY.skip }))
    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/story-ready')
  })
})

describe('M01-S13 When We Met', () => {
  it('offers all three precisions', async () => {
    await renderScreen(<WhenWeMetScreen />)

    expect(screen.getByLabelText('Exact date')).toBeTruthy()
    expect(screen.getByLabelText('Month + Year')).toBeTruthy()
    expect(screen.getByLabelText('Year only')).toBeTruthy()
  })

  it('refuses to continue with no date', async () => {
    const user = userEvent.setup()
    await renderScreen(<WhenWeMetScreen />)

    await user.press(screen.getByRole('button', { name: WHEN_WE_MET_COPY.submit }))

    expect(await screen.findByText(WHEN_WE_MET_COPY.dateRequired)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('stores an exact date and advances', async () => {
    const user = userEvent.setup()
    await renderScreen(<WhenWeMetScreen />)

    await user.type(screen.getByLabelText(`${WHEN_WE_MET_COPY.dateLabel} month`), '10')
    await user.type(screen.getByLabelText(`${WHEN_WE_MET_COPY.dateLabel} day`), '12')
    await user.type(screen.getByLabelText(`${WHEN_WE_MET_COPY.dateLabel} year`), '2019')
    await user.press(screen.getByRole('button', { name: WHEN_WE_MET_COPY.submit }))

    await waitFor(() =>
      expect(useStoryStore.getState().met).toEqual({ value: '2019-10-12', precision: 'exact' }),
    )
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/first-date')
  })

  it('accepts a year alone, without inventing a day', async () => {
    const user = userEvent.setup()
    await renderScreen(<WhenWeMetScreen />)

    await user.press(screen.getByLabelText('Year only'))
    await user.type(screen.getByLabelText(WHEN_WE_MET_COPY.yearLabel), '2019')
    await user.press(screen.getByRole('button', { name: WHEN_WE_MET_COPY.submit }))

    await waitFor(() =>
      expect(useStoryStore.getState().met).toEqual({ value: '2019-01-01', precision: 'yearOnly' }),
    )
  })

  it('rejects a nonsense year', async () => {
    const user = userEvent.setup()
    await renderScreen(<WhenWeMetScreen />)

    await user.press(screen.getByLabelText('Year only'))
    await user.type(screen.getByLabelText(WHEN_WE_MET_COPY.yearLabel), '12')
    await user.press(screen.getByRole('button', { name: WHEN_WE_MET_COPY.submit }))

    expect(await screen.findByText(WHEN_WE_MET_COPY.yearInvalid)).toBeTruthy()
  })
})

describe('M01-S14 First Date Memory', () => {
  it('renders every field, including the multiline memory', async () => {
    await renderScreen(<FirstDateMemoryScreen />)

    expect(screen.getByPlaceholderText(FIRST_DATE_COPY.locationPlaceholder)).toBeTruthy()
    expect(screen.getByLabelText(FIRST_DATE_COPY.memoryLabel).props.multiline).toBe(true)
  })

  it('saves what was entered and advances', async () => {
    const user = userEvent.setup()
    await renderScreen(<FirstDateMemoryScreen />)

    await user.type(screen.getByPlaceholderText(FIRST_DATE_COPY.locationPlaceholder), 'Blue Tokai')
    await user.press(screen.getByRole('button', { name: FIRST_DATE_COPY.submit }))

    await waitFor(() =>
      expect(useStoryStore.getState().firstDate).toMatchObject({ location: 'Blue Tokai' }),
    )
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/became-us')
  })

  it('lets the whole screen be skipped', async () => {
    const user = userEvent.setup()
    await renderScreen(<FirstDateMemoryScreen />)

    await user.press(screen.getByRole('button', { name: FIRST_DATE_COPY.skip }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/became-us')
    expect(useStoryStore.getState().firstDate).toBeUndefined()
  })
})

describe('M01-S15 When We Became Us', () => {
  it('marks the optional fields as optional', async () => {
    await renderScreen(<BecameUsScreen />)

    expect(screen.getByText(BECAME_US_COPY.locationLabel)).toBeTruthy()
    expect(screen.getByText(BECAME_US_COPY.noteLabel)).toBeTruthy()
  })

  it('advances to the first memory', async () => {
    const user = userEvent.setup()
    await renderScreen(<BecameUsScreen />)

    await user.press(screen.getByRole('button', { name: BECAME_US_COPY.submit }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/first-memory')
  })
})

describe('M01-S16 The First Memory', () => {
  it('renders the photo well and advances', async () => {
    const user = userEvent.setup()
    await renderScreen(<FirstMemoryScreen />)

    expect(screen.getByRole('button', { name: FIRST_MEMORY_COPY.photoLabel })).toBeTruthy()

    await user.press(screen.getByRole('button', { name: FIRST_MEMORY_COPY.submit }))
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/days-that-matter')
  })
})

describe('M01-S17 Days That Matter', () => {
  it('renders all five dates', async () => {
    await renderScreen(<DaysThatMatterScreen />)

    for (const field of DAYS_THAT_MATTER_COPY.fields) {
      expect(screen.getByLabelText(`${field.label} month`)).toBeTruthy()
    }
  })

  it('keeps only the dates that were filled in', async () => {
    const user = userEvent.setup()
    await renderScreen(<DaysThatMatterScreen />)

    await user.type(screen.getByLabelText('Anniversary month'), '07')
    await user.type(screen.getByLabelText('Anniversary day'), '21')
    await user.type(screen.getByLabelText('Anniversary year'), '2020')
    await user.press(screen.getByRole('button', { name: DAYS_THAT_MATTER_COPY.submit }))

    await waitFor(() =>
      expect(useStoryStore.getState().keyDates).toEqual({ anniversary: '2020-07-21' }),
    )
  })
})

describe('M01-S18 Our Story Recap', () => {
  it('says so plainly when nothing was added', async () => {
    await renderScreen(<StoryRecapScreen />)

    expect(screen.getByText(STORY_RECAP_COPY.emptyTitle)).toBeTruthy()
  })

  it('lists what was captured and prints the date to its precision', async () => {
    useStoryStore.getState().setMet({ value: '2019-01-01', precision: 'yearOnly' })

    await renderScreen(<StoryRecapScreen />)

    // Not "January 1, 2019" — the user only ever claimed a year.
    expect(screen.getByText(STORY_RECAP_COPY.lede('2019'))).toBeTruthy()
    expect(screen.getByText(STORY_RECAP_COPY.rows.met)).toBeTruthy()
  })

  it('saves the story, then moves on', async () => {
    const user = userEvent.setup()
    useStoryStore.getState().setMet({ value: '2019-10-12', precision: 'exact' })

    await renderScreen(<StoryRecapScreen />)
    await user.press(screen.getByRole('button', { name: STORY_RECAP_COPY.submit }))

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/story-ready'))
  })

  it('surfaces a save failure instead of moving on', async () => {
    const user = userEvent.setup()
    useStoryStore.getState().setFirstDate({ location: 'offline' })

    await renderScreen(<StoryRecapScreen />)
    await user.press(screen.getByRole('button', { name: STORY_RECAP_COPY.submit }))

    expect(await screen.findByText(STORY_RECAP_COPY.errors.NETWORK)).toBeTruthy()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})

describe('M01-S19 Your Story Is Ready', () => {
  it('marks skipped steps as skipped rather than ticking them', async () => {
    await renderScreen(<StoryReadyScreen />)

    expect(screen.getAllByText(STORY_READY_COPY.skipped)).toHaveLength(5)
  })

  it('marks what was actually added', async () => {
    useStoryStore.getState().setMet({ value: '2019-10-12', precision: 'exact' })
    useStoryStore.getState().setKeyDates({ anniversary: '2020-07-21' })

    await renderScreen(<StoryReadyScreen />)

    expect(screen.getAllByText(STORY_READY_COPY.added)).toHaveLength(2)
    expect(screen.getByText(STORY_READY_COPY.since('October 12, 2019'))).toBeTruthy()
  })
})
