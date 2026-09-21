import { screen, userEvent } from '@testing-library/react-native'

import { PlanCard } from '@/modules/module-06-plans/components/PlanCard'
import { renderScreen } from '@/test/renderScreen'

/** The three accent pairs the six hub cards cycle through. */
const ACCENTS = [0, 1, 2] as const

const CARD = {
  icon: 'grid',
  accent: 0,
  chip: 'Active Board',
  title: 'Our Year Together',
  lede: 'Couple Bingo 2027',
  status: '8 of 25 stamped',
  statusDetail: '3 in progress',
} as const

describe('PlanCard', () => {
  it('draws the chip, the title, the lede and the live figure', async () => {
    await renderScreen(<PlanCard {...CARD} onPress={jest.fn()} />)

    // The chip is uppercased in the component rather than in the copy file, so
    // the same string can be read as a sentence anywhere else it is used.
    expect(screen.getByText('ACTIVE BOARD')).toBeTruthy()
    expect(screen.getByText(CARD.title)).toBeTruthy()
    expect(screen.getByText(CARD.lede)).toBeTruthy()
    expect(screen.getByText(CARD.status)).toBeTruthy()
    expect(screen.getByText(CARD.statusDetail)).toBeTruthy()
  })

  it('leaves the second status line out rather than drawing an empty one', async () => {
    await renderScreen(<PlanCard {...CARD} statusDetail={null} onPress={jest.fn()} />)

    expect(screen.getByText(CARD.status)).toBeTruthy()
    expect(screen.queryByText(CARD.statusDetail)).toBeNull()
  })

  it('is a button named after what it says, not "card"', async () => {
    await renderScreen(<PlanCard {...CARD} onPress={jest.fn()} />)

    // Title AND status, because six cards announced by title alone tell a
    // screen-reader user nothing about which one is worth opening — the figure
    // is the whole point of the card.
    expect(
      screen.getByRole('button', { name: `${CARD.title}. ${CARD.status}` }),
    ).toBeTruthy()
  })

  it('opens on a press', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<PlanCard {...CARD} onPress={onPress} />)

    await user.press(screen.getByRole('button', { name: `${CARD.title}. ${CARD.status}` }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it.each(ACCENTS)('renders on accent pair %i', async (accent) => {
    // Six cards, three audited accent pairs. Passing an accent must not change
    // anything the card SAYS — the tint is the only thing that moves, and it is
    // read off `theme.colors.accents`, which only has three entries.
    await renderScreen(<PlanCard {...CARD} accent={accent} onPress={jest.fn()} />)

    expect(screen.getByText(CARD.title)).toBeTruthy()
  })
})
