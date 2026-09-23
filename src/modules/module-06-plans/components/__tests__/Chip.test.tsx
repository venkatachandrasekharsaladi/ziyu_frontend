import { render, screen, userEvent } from '@testing-library/react-native'

import { Chip } from '@/modules/module-06-plans/components/Chip'

/**
 * The four tones the chip carries. Only that each one still renders is
 * assertable: the tones are Unistyles `variants`, and the Jest mock strips
 * `variants` entirely (see the header of `jest.config.js`), so the colour a tone
 * paints is not readable from a test. What IS worth guarding is that naming a
 * tone never changes what the chip SAYS or how it is announced.
 */
const TONES = ['neutral', 'brand', 'success', 'warning'] as const

describe('Chip', () => {
  it('prints its label', async () => {
    await render(<Chip label="Travel" />)

    expect(screen.getByText('Travel')).toBeTruthy()
  })

  it.each(TONES)('renders the %s tone with the same label', async (tone) => {
    await render(<Chip label="Travel" tone={tone} />)

    expect(screen.getByText('Travel')).toBeTruthy()
  })

  it('is a button when it is given something to do', async () => {
    await render(<Chip label="Open itinerary" onPress={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Open itinerary' })).toBeTruthy()
  })

  it('calls back on a press', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()
    await render(<Chip label="Open itinerary" onPress={onPress} />)

    await user.press(screen.getByRole('button', { name: 'Open itinerary' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is NOT a button when it is only reporting a status', async () => {
    await render(<Chip label="3 days planned" tone="success" icon="check-circle" />)

    // A status badge is not a control the user has failed to be allowed to
    // press. Rendering it as a disabled Pressable would put it in the focus
    // order and announce it as unavailable, which is a lie about a label.
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('3 days planned')).toBeTruthy()
  })

  it('reports whether it is the chip currently chosen', async () => {
    await render(<Chip label="Travel" selected onPress={jest.fn()} />)

    // Selection is drawn as a filled pill. Colour alone does not reach a screen
    // reader, so the state has to travel in `accessibilityState` as well.
    expect(screen.getByRole('button', { name: 'Travel' }).props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('says so when it is not the chosen one, rather than saying nothing', async () => {
    await render(<Chip label="Travel" onPress={jest.fn()} />)

    // `selected: false`, not `undefined` — an unset state reads as "this is not
    // a thing that can be selected", which in a filter row is the wrong answer.
    expect(screen.getByRole('button', { name: 'Travel' }).props.accessibilityState).toMatchObject({
      selected: false,
    })
  })

  it('reads the count out with the label instead of leaving it a loose number', async () => {
    await render(<Chip label="Travel" count={12} onPress={jest.fn()} />)

    // "Travel, 12" — announced as one thing. Without this the count is a
    // separate, unattached "12" somewhere after the word Travel.
    expect(screen.getByRole('button', { name: 'Travel, 12' })).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
  })

  it('drops the count entirely when there is none, rather than drawing a zero', async () => {
    await render(<Chip label="Travel" onPress={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Travel' })).toBeTruthy()
    expect(screen.queryByText('0')).toBeNull()
  })

  it('keeps a count of zero, because none is a figure a filter needs to show', async () => {
    await render(<Chip label="Wild" count={0} onPress={jest.fn()} />)

    // `count === undefined` is the test in the component, not `!count` — a
    // filter that has nothing behind it still has to say so.
    expect(screen.getByRole('button', { name: 'Wild, 0' })).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })
})
