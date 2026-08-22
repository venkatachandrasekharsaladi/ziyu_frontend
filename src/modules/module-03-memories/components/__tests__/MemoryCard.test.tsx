import { screen, userEvent } from '@testing-library/react-native'

import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import type { Memory } from '@/services/memories/types'
import { renderScreen } from '@/test/renderScreen'

const ROME: Memory = {
  id: 'memory-1',
  title: "Rome '23",
  date: '2023-10-14',
  caption: 'Coffee, sunshine, and nowhere to be.',
  location: 'Rome, Italy',
  tags: ['Trips'],
  favorite: false,
}

describe('MemoryCard', () => {
  it('puts the date and the place on one line', async () => {
    await renderScreen(<MemoryCard memory={ROME} onPress={jest.fn()} />)

    expect(screen.getByText(ROME.title)).toBeTruthy()
    expect(screen.getByText('October 14, 2023 · Rome, Italy')).toBeTruthy()
    expect(screen.getByText(String(ROME.caption))).toBeTruthy()
  })

  it('drops the separator when there is no place', async () => {
    await renderScreen(
      <MemoryCard memory={{ ...ROME, location: undefined }} onPress={jest.fn()} />,
    )

    expect(screen.getByText('October 14, 2023')).toBeTruthy()
  })

  it('leaves out the lines it has nothing to put on', async () => {
    await renderScreen(
      <MemoryCard
        memory={{ ...ROME, date: '', caption: undefined, location: undefined }}
        onPress={jest.fn()}
      />,
    )

    expect(screen.getByText(ROME.title)).toBeTruthy()
    expect(screen.queryByText(/October/)).toBeNull()
    expect(screen.queryByText(String(ROME.caption))).toBeNull()
  })

  it('is a button named after the memory, not "card"', async () => {
    await renderScreen(<MemoryCard memory={ROME} onPress={jest.fn()} />)

    expect(screen.getByRole('button', { name: ROME.title })).toBeTruthy()
  })

  it('reports the id of the memory it belongs to', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<MemoryCard memory={ROME} onPress={onPress} />)

    await user.press(screen.getByRole('button', { name: ROME.title }))

    expect(onPress).toHaveBeenCalledWith('memory-1')
  })

  it('survives a malformed date instead of printing it raw', async () => {
    // `formatDate` returns '' for anything that is not YYYY-MM-DD.
    await renderScreen(<MemoryCard memory={{ ...ROME, date: 'last summer' }} onPress={jest.fn()} />)

    expect(screen.queryByText(/last summer/)).toBeNull()
    expect(screen.getByText(ROME.title)).toBeTruthy()
  })
})
