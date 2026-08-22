import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { EventRow } from '@/design-system/patterns/EventRow'
import { activeTheme } from '@/test/activeTheme'
import { renderScreen } from '@/test/renderScreen'

const fill = (index: number) =>
  screen.getAllByTestId('event-row-tile')[index].props.style.find(
    (s: { backgroundColor?: string } | undefined) => s?.backgroundColor,
  )?.backgroundColor

describe('EventRow', () => {
  it('shows the title, the detail line and the trailing value', async () => {
    await renderScreen(
      <EventRow icon="film" label="Movie Night" detail="Friday, 8 PM" trailing="2 days" />,
    )

    expect(screen.getByText('Movie Night')).toBeTruthy()
    expect(screen.getByText('Friday, 8 PM')).toBeTruthy()
    expect(screen.getByText('2 days')).toBeTruthy()
  })

  it('drops the detail line rather than reserving empty space for it', async () => {
    await renderScreen(<EventRow icon="film" label="Movie Night" />)

    // A row with nothing to say about when should not leave a gap where the
    // time would have been.
    expect(screen.queryByText('Friday, 8 PM')).toBeNull()
  })

  it('is not announced as a button when there is nowhere to go', async () => {
    await renderScreen(<EventRow icon="film" label="Movie Night" />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('is a labelled button when it has a destination', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<EventRow icon="film" label="Movie Night" onPress={onPress} />)

    await user.press(screen.getByRole('button', { name: 'Movie Night' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not throw when pressed without a handler', async () => {
    await renderScreen(<EventRow icon="film" label="Movie Night" />)

    expect(() => fireEvent.press(screen.getByText('Movie Night'))).not.toThrow()
  })

  // `activeTheme()` and not a fixed palette: this file runs in both Jest
  // projects, so the expected tints are whichever theme is configured. Pinning
  // the lavender hexes here passed in light and failed in dark — the exact bug
  // the two-project setup exists to find, caught on this very test.
  it('gives consecutive rows different accent tiles', async () => {
    await renderScreen(
      <>
        <EventRow icon="film" label="First" index={0} />
        <EventRow icon="coffee" label="Second" index={1} />
      </>,
    )

    expect(fill(0)).toBe(activeTheme().colors.accents[0].soft)
    expect(fill(1)).toBe(activeTheme().colors.accents[1].soft)
    expect(fill(0)).not.toBe(fill(1))
  })

  it('wraps the accents instead of running out on a long list', async () => {
    const past = activeTheme().colors.accents.length

    await renderScreen(
      <>
        <EventRow icon="film" label="First" index={0} />
        <EventRow icon="coffee" label="Wrapped" index={past} />
      </>,
    )

    // Index N reuses accent 0. Without the modulo this row rendered untinted.
    expect(fill(1)).toBe(activeTheme().colors.accents[0].soft)
  })
})
