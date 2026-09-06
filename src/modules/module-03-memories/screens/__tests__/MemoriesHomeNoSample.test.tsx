import { screen, userEvent } from '@testing-library/react-native'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { MemoriesHomeScreen } from '@/modules/module-03-memories/screens/MemoriesHomeScreen'
import { memoriesService } from '@/services/memories'
import { renderScreen } from '@/test/renderScreen'

jest.mock('@/services/memories', () => ({
  memoriesService: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    toggleFavorite: jest.fn(),
    search: jest.fn(),
  },
}))

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: jest.fn(), back: jest.fn() }),
}))

/**
 * Memories home with sample content OFF — the real first run.
 *
 * The empty state is still the screen a new couple meets, so it is still built
 * and still tested. Flipping `USE_SAMPLE_CONTENT` off is all it takes to get it
 * back, which is the point of the switch.
 */
jest.mock('@/sample', () => ({
  ...jest.requireActual('@/sample'),
  USE_SAMPLE_CONTENT: false,
}))

const service = jest.mocked(memoriesService)

beforeEach(() => {
  mockPush.mockClear()
  service.list.mockResolvedValue({ ok: true, value: [] })
})

describe('M03-S01 Memories Home — no sample content', () => {
  it('shows the empty state rather than an invented library', async () => {
    await renderScreen(<MemoriesHomeScreen />)

    expect(await screen.findByText(COPY.empty.heading)).toBeTruthy()
    expect(screen.getByText(COPY.empty.lede)).toBeTruthy()
    expect(screen.queryByText(COPY.home.heading)).toBeNull()
  })

  it('sends the first memory straight to the form', async () => {
    const user = userEvent.setup()
    await renderScreen(<MemoriesHomeScreen />)

    await user.press(await screen.findByRole('button', { name: COPY.empty.addFirst }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/new')
  })

  it('treats a failed load as an empty library rather than breaking', async () => {
    service.list.mockResolvedValue({ ok: false, error: { code: 'NETWORK' } })

    await renderScreen(<MemoriesHomeScreen />)

    expect(await screen.findByText(COPY.empty.heading)).toBeTruthy()
  })
})
