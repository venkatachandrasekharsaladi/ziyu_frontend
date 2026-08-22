import { screen, userEvent } from '@testing-library/react-native'

import { ON_THIS_DAY_COPY as COPY } from '@/copy/onThisDay'
import {
  OnThisDayScreen,
  groupByYear,
} from '@/modules/module-03-memories/screens/OnThisDayScreen'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
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
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
}))

const service = jest.mocked(memoriesService)

const memory = (id: string, date: string, extra: Partial<Memory> = {}): Memory => ({
  id,
  title: id,
  date,
  tags: [],
  favorite: false,
  ...extra,
})

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  service.list.mockResolvedValue({ ok: true, value: [] })
})

describe('groupByYear', () => {
  it('keeps only the memories on the given calendar day', () => {
    const groups = groupByYear(
      [
        memory('a', '2023-10-14'),
        memory('b', '2022-10-14'),
        memory('c', '2022-10-15'),
        memory('d', '2022-09-14'),
      ],
      10,
      14,
    )

    expect(groups.map((g) => g.year)).toEqual([2023, 2022])
    expect(groups[1].items.map((m) => m.id)).toEqual(['b'])
  })

  it('orders years newest first, as the rail is drawn', () => {
    const groups = groupByYear(
      [memory('old', '2019-01-01'), memory('new', '2024-01-01'), memory('mid', '2021-01-01')],
      1,
      1,
    )

    expect(groups.map((g) => g.year)).toEqual([2024, 2021, 2019])
  })

  it('puts several memories from one year in that year', () => {
    const groups = groupByYear([memory('x', '2023-05-02'), memory('y', '2023-05-02')], 5, 2)

    expect(groups).toHaveLength(1)
    expect(groups[0].items).toHaveLength(2)
  })

  it('ignores a malformed date rather than throwing', () => {
    expect(groupByYear([memory('bad', 'not-a-date'), memory('ok', '2023-03-03')], 3, 3)).toEqual([
      { year: 2023, items: [expect.objectContaining({ id: 'ok' })] },
    ])
  })
})

describe('M03-S07 On this day', () => {
  it('anchors to the day the design draws when today holds nothing', async () => {
    await renderScreen(<OnThisDayScreen />)

    expect(await screen.findByText('October 14')).toBeTruthy()
    expect(screen.getByText(COPY.eyebrow)).toBeTruthy()
  })

  it('draws a year marker per year, with a computed relative chip', async () => {
    await renderScreen(<OnThisDayScreen />)

    const years = [
      ...new Set(
        SAMPLE_MEMORIES.filter((m) => m.date.slice(5) === '10-14').map((m) =>
          Number(m.date.slice(0, 4)),
        ),
      ),
    ]

    expect(years.length).toBeGreaterThan(1)

    for (const year of years) {
      expect(await screen.findByText(String(year))).toBeTruthy()
      // Computed against the real current year, not copied from the frame.
      expect(
        screen.getAllByText(COPY.yearsAgo(new Date().getFullYear() - year)).length,
      ).toBeGreaterThan(0)
    }
  })

  it('opens a memory from the rail', async () => {
    const user = userEvent.setup()
    await renderScreen(<OnThisDayScreen />)

    const first = SAMPLE_MEMORIES.find((m) => m.date === '2023-10-14')!

    await user.press(await screen.findByLabelText(first.title))

    expect(mockPush).toHaveBeenCalledWith(`/(app)/memories/${first.id}`)
  })

  it('prefers real memories over the sample anchor', async () => {
    const today = new Date()
    const iso = `${today.getFullYear() - 2}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    service.list.mockResolvedValue({ ok: true, value: [memory('real-one', iso)] })

    await renderScreen(<OnThisDayScreen />)

    expect(await screen.findByText(COPY.yearsAgo(2))).toBeTruthy()
    // The sample anchor is not used when today actually has something.
    expect(screen.queryByText('October 14')).toBeNull()
  })
})
