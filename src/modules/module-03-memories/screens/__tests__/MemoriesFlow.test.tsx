import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { ALBUMS_COPY } from '@/copy/albums'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AddMemoryScreen } from '@/modules/module-03-memories/screens/AddMemoryScreen'
import { MemoriesHomeScreen } from '@/modules/module-03-memories/screens/MemoriesHomeScreen'
import { MemoryDetailScreen } from '@/modules/module-03-memories/screens/MemoryDetailScreen'
import { SearchMemoriesScreen } from '@/modules/module-03-memories/screens/SearchMemoriesScreen'
import { SAMPLE_ALBUMS } from '@/sample/albums'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

/**
 * The real `memoriesService` is a module-level singleton over ONE in-memory
 * store with 600ms of simulated latency. A memory created by one test would
 * still be there in the next, so the suite would pass or fail by execution
 * order. It is replaced wholesale and every test states the answers it needs.
 *
 * The mock's own behaviour is covered by `services/memories/__tests__` — these
 * tests are about what the screens do with an answer, not how it is produced.
 */
jest.mock('@/services/memories', () => ({
  memoriesService: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    toggleFavorite: jest.fn(),
    search: jest.fn(),
  },
}))

const service = jest.mocked(memoriesService)

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
let mockId = 'memory-1'

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({ id: mockId }),
}))

const ROME: Memory = {
  id: 'memory-1',
  title: "Rome '23",
  date: '2023-10-14',
  caption: 'Coffee, sunshine, and nowhere to be.',
  location: 'Rome, Italy',
  note: 'You fell asleep on the train.',
  tags: ['Trips'],
  favorite: false,
  addedBy: 'Praveen',
}

/** Deliberately sparse: no caption, no note, nobody credited, already loved. */
const COFFEE: Memory = {
  id: 'memory-2',
  title: 'First coffee',
  date: '2024-02-02',
  location: 'Seattle',
  tags: ['Dates'],
  favorite: true,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockId = 'memory-1'
  useRelationshipStore.getState().reset()

  // Defaults a test can override: an empty library and a memory nobody has.
  service.list.mockResolvedValue({ ok: true, value: [] })
  service.get.mockResolvedValue({ ok: false, error: { code: 'NOT_FOUND' } })
  service.search.mockResolvedValue({ ok: true, value: [] })
  service.create.mockImplementation(async (input) => ({
    ok: true,
    value: { ...input, id: 'memory-9', favorite: false },
  }))
  service.toggleFavorite.mockResolvedValue({ ok: true, value: { ...ROME, favorite: true } })
})

describe('M03-S01 Memories Home', () => {
  it('falls back to sample content so the designed layout is what you see', async () => {
    await renderScreen(<MemoriesHomeScreen />)

    // The genuine empty state is asserted in `MemoriesHomeNoSample.test.tsx`.
    expect(await screen.findByText(COPY.home.heading)).toBeTruthy()
    expect(screen.queryByText(COPY.empty.heading)).toBeNull()
  })

  it('stacks the four sections the frame draws', async () => {
    await renderScreen(<MemoriesHomeScreen />)

    expect(await screen.findByText(COPY.home.onThisDayLabel)).toBeTruthy()
    expect(screen.getByText(COPY.home.albumsLabel)).toBeTruthy()
    expect(screen.getByText(COPY.home.recentlyAddedLabel)).toBeTruthy()
  })

  it('sends "Add Memory" straight to the form', async () => {
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.home.add }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/new')
  })

  it('opens the album layer the design reaches through View all', async () => {
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.home.viewAll }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/albums')
  })

  it('opens the On this day page from the section header', async () => {
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.home.onThisDayLabel }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/on-this-day')
  })

  it('opens the On this day page from the hero photo, not that one memory', async () => {
    const user = userEvent.setup()
    // Mirrors the screen's own choice of hero: first favourite that has a photo.
    const hero = SAMPLE_MEMORIES.find((m) => m.photoUri && m.favorite)!

    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByLabelText(hero.title))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/on-this-day')
    // The whole section is a door to that page — tapping it must NOT deep-link
    // into the single memory it happens to be showing.
    expect(mockPush).not.toHaveBeenCalledWith(`/(app)/memories/${hero.id}`)
  })

  it('opens an album straight from the rail on the library', async () => {
    const user = userEvent.setup()
    const trips = SAMPLE_ALBUMS.find((a) => a.key === 'Trips')!

    await renderScreen(<MemoriesHomeScreen />)

    await user.press(
      await screen.findByLabelText(`${trips.label}, ${ALBUMS_COPY.list.count(trips.sampleCount)}`),
    )

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/albums/Trips')
  })

  it('holds the chrome while loading instead of flashing an empty library', async () => {
    service.list.mockReturnValue(new Promise<never>(() => {}))

    await renderScreen(<MemoriesHomeScreen />)

    // The bar is up, but nothing has claimed the library is empty yet.
    expect(screen.getByLabelText('Memories')).toBeTruthy()
    expect(screen.queryByText(COPY.empty.heading)).toBeNull()
    expect(screen.queryByText(COPY.home.heading)).toBeNull()
  })

  it('counts what is actually there, not what the design drew', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME, COFFEE] })

    await renderScreen(<MemoriesHomeScreen />)

    expect(await screen.findByText(COPY.home.count(2))).toBeTruthy()
    expect(screen.getByText(ROME.title)).toBeTruthy()
    expect(screen.getByText(COFFEE.title)).toBeTruthy()
  })

  it('says "1 little piece of us", not "1 little pieces of us"', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })

    await renderScreen(<MemoriesHomeScreen />)

    expect(await screen.findByText('1 little piece of us.')).toBeTruthy()
  })

  it('opens the memory that was pressed', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME, COFFEE] })
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COFFEE.title }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/memory-2')
  })

  it('offers search once there is something worth searching', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.home.search }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/search')
  })

  it('treats a failed load as an empty library rather than breaking', async () => {
    service.list.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })

    await renderScreen(<MemoriesHomeScreen />)

    // Empty either way — it just shows the sample library rather than crashing.
    expect(await screen.findByText(COPY.home.heading)).toBeTruthy()
  })
})

describe('M03-S02 Memory Detail', () => {
  it('renders the memory it was asked for', async () => {
    service.get.mockResolvedValue({ ok: true, value: ROME })

    await renderScreen(<MemoryDetailScreen />)

    expect(await screen.findByText(ROME.title)).toBeTruthy()
    expect(screen.getByText('October 14, 2023 · Rome, Italy')).toBeTruthy()
    expect(screen.getByText('Coffee, sunshine, and nowhere to be.')).toBeTruthy()
    expect(screen.getByText(COPY.detail.noteLabel)).toBeTruthy()
    expect(screen.getByText('You fell asleep on the train.')).toBeTruthy()
    expect(screen.getByText(COPY.detail.addedBy('Praveen'))).toBeTruthy()
  })

  it('asks for the memory named in the route, not the first one', async () => {
    mockId = 'memory-2'
    service.get.mockResolvedValue({ ok: true, value: COFFEE })

    await renderScreen(<MemoryDetailScreen />)

    await screen.findByText(COFFEE.title)
    expect(service.get).toHaveBeenCalledWith({ id: 'memory-2' })
  })

  it('leaves out the blocks this memory does not have', async () => {
    mockId = 'memory-2'
    service.get.mockResolvedValue({ ok: true, value: COFFEE })

    await renderScreen(<MemoryDetailScreen />)

    await screen.findByText(COFFEE.title)
    expect(screen.queryByText(COPY.detail.noteLabel)).toBeNull()
    expect(screen.queryByText(/^Added by/)).toBeNull()
  })

  it('says a missing memory is missing, and offers the way back', async () => {
    service.get.mockResolvedValue({ ok: false, error: { code: 'NOT_FOUND' } })
    const user = userEvent.setup()
    await renderScreen(<MemoryDetailScreen />)

    expect(await screen.findByText(COPY.detail.errors.NOT_FOUND)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: COPY.detail.back }))

    // replace, not push — the detail screen it failed to draw is not worth
    // keeping on the stack.
    expect(mockReplace).toHaveBeenCalledWith('/(app)/memories')
  })

  it('distinguishes a dropped connection from a deleted memory', async () => {
    service.get.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })

    await renderScreen(<MemoryDetailScreen />)

    expect(await screen.findByText(COPY.detail.errors.NETWORK)).toBeTruthy()
  })

  it('favourites the memory and re-labels the control', async () => {
    service.get.mockResolvedValue({ ok: true, value: ROME })
    service.toggleFavorite.mockResolvedValue({ ok: true, value: { ...ROME, favorite: true } })
    const user = userEvent.setup()
    await renderScreen(<MemoryDetailScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.detail.favorite }))

    expect(service.toggleFavorite).toHaveBeenCalledWith({ id: ROME.id })
    expect(await screen.findByRole('button', { name: COPY.detail.unfavorite })).toBeTruthy()
  })

  it('offers to remove a memory that is already a favourite', async () => {
    mockId = 'memory-2'
    service.get.mockResolvedValue({ ok: true, value: COFFEE })

    await renderScreen(<MemoryDetailScreen />)

    expect(await screen.findByRole('button', { name: COPY.detail.unfavorite })).toBeTruthy()
  })

  it('leaves the memory alone when the toggle fails', async () => {
    service.get.mockResolvedValue({ ok: true, value: ROME })
    service.toggleFavorite.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })
    const user = userEvent.setup()
    await renderScreen(<MemoryDetailScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.detail.favorite }))

    // No optimistic lie: the control still says what is true on the server.
    expect(await screen.findByRole('button', { name: COPY.detail.favorite })).toBeTruthy()
  })
})

describe('M03-S03 Add Memory', () => {
  it('will not save a memory with no name', async () => {
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.press(screen.getByRole('button', { name: COPY.add.submit }))

    expect(await screen.findByText(COPY.add.titleRequired)).toBeTruthy()
    expect(service.create).not.toHaveBeenCalled()
  })

  it('drops the complaint as soon as a name is typed', async () => {
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.press(screen.getByRole('button', { name: COPY.add.submit }))
    expect(await screen.findByText(COPY.add.titleRequired)).toBeTruthy()

    await user.type(screen.getByLabelText(COPY.add.titleLabel), 'P')

    await waitFor(() => expect(screen.queryByText(COPY.add.titleRequired)).toBeNull())
  })

  it('trims the title and omits the optional fields left blank', async () => {
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.type(screen.getByLabelText(COPY.add.titleLabel), '  Picnic  ')
    await user.press(screen.getByRole('button', { name: COPY.add.submit }))

    await waitFor(() =>
      expect(service.create).toHaveBeenCalledWith({
        title: 'Picnic',
        date: '',
        caption: undefined,
        location: undefined,
        note: undefined,
        tags: [],
        addedBy: undefined,
      }),
    )
  })

  it('keeps everything the couple did fill in, and who added it', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Praveen' })
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.type(screen.getByLabelText(COPY.add.titleLabel), 'Picnic')
    await user.type(screen.getByLabelText(`${COPY.add.dateLabel} month`), '05')
    await user.type(screen.getByLabelText(`${COPY.add.dateLabel} day`), '01')
    await user.type(screen.getByLabelText(`${COPY.add.dateLabel} year`), '2025')
    await user.type(screen.getByLabelText(COPY.add.captionLabel), 'Bread and no plans.')
    await user.type(screen.getByLabelText(COPY.add.locationLabel), 'Cubbon Park')
    await user.type(screen.getByLabelText(COPY.add.noteLabel), 'Only ours.')
    await user.press(screen.getByRole('button', { name: COPY.add.submit }))

    await waitFor(() =>
      expect(service.create).toHaveBeenCalledWith({
        title: 'Picnic',
        date: '2025-05-01',
        caption: 'Bread and no plans.',
        location: 'Cubbon Park',
        note: 'Only ours.',
        tags: [],
        addedBy: 'Praveen',
      }),
    )
  })

  it('replaces into the library, so back is not a blank form', async () => {
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.type(screen.getByLabelText(COPY.add.titleLabel), 'Picnic')
    await user.press(screen.getByRole('button', { name: COPY.add.submit }))

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(app)/memories'))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('keeps the form and explains itself when the save fails', async () => {
    service.create.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.type(screen.getByLabelText(COPY.add.titleLabel), 'Picnic')
    await user.press(screen.getByRole('button', { name: COPY.add.submit }))

    expect(await screen.findByText(COPY.add.errors.NETWORK)).toBeTruthy()
    expect(mockReplace).not.toHaveBeenCalled()
    // What they typed is still there to save again.
    expect(screen.getByLabelText(COPY.add.titleLabel).props.value).toBe('Picnic')
  })

  it('cancels back to wherever the form was opened from', async () => {
    const user = userEvent.setup()
    await renderScreen(<AddMemoryScreen />)

    await user.press(screen.getByRole('button', { name: COPY.add.cancel }))

    expect(mockBack).toHaveBeenCalled()
    expect(service.create).not.toHaveBeenCalled()
  })
})

describe('M03-S04 Search Memories', () => {
  it('admits there is nothing to search yet', async () => {
    service.list.mockResolvedValue({ ok: true, value: [] })

    await renderScreen(<SearchMemoriesScreen />)

    expect(await screen.findByText(COPY.search.emptyLibrary)).toBeTruthy()
    expect(screen.queryByText(COPY.search.prompt)).toBeNull()
  })

  it('waits to be told what to look for', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })

    await renderScreen(<SearchMemoriesScreen />)

    expect(await screen.findByText(COPY.search.prompt)).toBeTruthy()
    expect(service.search).not.toHaveBeenCalled()
  })

  it('reports what matched, and how many', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME, COFFEE] })
    service.search.mockResolvedValue({ ok: true, value: [ROME] })
    const user = userEvent.setup()
    await renderScreen(<SearchMemoriesScreen />)

    await user.type(screen.getByLabelText(COPY.search.label), 'rome')

    expect(await screen.findByText(COPY.search.resultsLabel(1))).toBeTruthy()
    expect(screen.getByText(ROME.title)).toBeTruthy()
    expect(service.search).toHaveBeenLastCalledWith({ query: 'rome' })
  })

  it('says nothing matched rather than showing an empty list', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })
    service.search.mockResolvedValue({ ok: true, value: [] })
    const user = userEvent.setup()
    await renderScreen(<SearchMemoriesScreen />)

    await user.type(screen.getByLabelText(COPY.search.label), 'zzz')

    expect(await screen.findByText(COPY.search.none)).toBeTruthy()
  })

  it('returns to the prompt when the query is cleared', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })
    service.search.mockResolvedValue({ ok: true, value: [ROME] })
    const user = userEvent.setup()
    await renderScreen(<SearchMemoriesScreen />)

    const field = screen.getByLabelText(COPY.search.label)
    await user.type(field, 'rome')
    await screen.findByText(ROME.title)

    await user.clear(field)

    expect(await screen.findByText(COPY.search.prompt)).toBeTruthy()
    expect(screen.queryByText(ROME.title)).toBeNull()
  })

  it('opens a result', async () => {
    service.list.mockResolvedValue({ ok: true, value: [ROME] })
    service.search.mockResolvedValue({ ok: true, value: [ROME] })
    const user = userEvent.setup()
    await renderScreen(<SearchMemoriesScreen />)

    await user.type(screen.getByLabelText(COPY.search.label), 'rome')
    await user.press(await screen.findByRole('button', { name: ROME.title }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/memory-1')
  })
})
