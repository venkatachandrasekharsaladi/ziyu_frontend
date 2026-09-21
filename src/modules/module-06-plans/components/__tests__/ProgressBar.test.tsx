import { render, screen } from '@testing-library/react-native'

import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'

/**
 * The width the fill was actually drawn at.
 *
 * The clamp has two consequences and they have to be checked separately: the
 * number a screen reader announces, and the box the eye sees. A clamp applied to
 * only one of them still ships a fill spilling out of its own track — so the
 * percentage string is read straight off the rendered style rather than inferred
 * from `accessibilityValue`.
 */
function fillWidth(): unknown {
  const [fill] = screen.getByRole('progressbar').children

  if (typeof fill === 'string') throw new Error('the track drew text, not a fill')

  const style = Array.isArray(fill.props.style)
    ? Object.assign({}, ...fill.props.style.filter(Boolean))
    : fill.props.style

  return style.width
}

describe('ProgressBar', () => {
  it('announces itself as a progress bar, on a 0–100 scale', async () => {
    await render(<ProgressBar value={0.28} />)

    // Percent rather than raw counts, so one scale serves all five screens that
    // draw this — "7 of 25 tiles" and "8 of 50 promises" are the same bar.
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 28,
    })
  })

  it('rounds to a whole percent rather than announcing a fraction', async () => {
    await render(<ProgressBar value={0.286} />)

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 29 })
  })

  it('draws an empty track at zero', async () => {
    await render(<ProgressBar value={0} />)

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 0 })
    expect(fillWidth()).toBe('0%')
  })

  it('draws a full track at one', async () => {
    await render(<ProgressBar value={1} />)

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 100 })
    expect(fillWidth()).toBe('100%')
  })

  it('clamps a value past its own target instead of overflowing the track', async () => {
    // A legitimate state, not a bug in the caller: three of the five screens
    // that draw this compute a denominator the couple chose — a 50-promise
    // target, 7 planned moments — so doing more than was promised is allowed,
    // and 1.4 would otherwise paint a 140%-wide fill out of the card.
    await render(<ProgressBar value={1.4} />)

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 100 })
    expect(fillWidth()).toBe('100%')
  })

  it('clamps a negative value to an empty track', async () => {
    // Reachable through a target that was lowered below what is already done.
    await render(<ProgressBar value={-0.5} />)

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 0 })
    expect(fillWidth()).toBe('0%')
  })

  it('prints the label, the trailing figure and the footnote it is given', async () => {
    await render(
      <ProgressBar value={0.28} label="7 / 25" trailing="28% Completed" footnote="18 to go" />,
    )

    expect(screen.getByText('7 / 25')).toBeTruthy()
    expect(screen.getByText('28% Completed')).toBeTruthy()
    expect(screen.getByText('18 to go')).toBeTruthy()
  })

  it('is a bare track when it is given nothing to say', async () => {
    await render(<ProgressBar value={0.5} />)

    // The queue rows on Watch Together draw the track alone. The header row has
    // to disappear with its contents rather than leave an empty line of spacing.
    expect(screen.getByRole('progressbar')).toBeTruthy()
    expect(screen.queryByText('7 / 25')).toBeNull()
  })

  it('still draws the header row when only one of its two halves is given', async () => {
    await render(<ProgressBar value={0.5} trailing="50% Completed" />)

    expect(screen.getByText('50% Completed')).toBeTruthy()
  })
})
