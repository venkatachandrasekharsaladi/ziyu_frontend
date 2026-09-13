import { screen } from '@testing-library/react-native'

import { CoupleHeader } from '@/modules/module-05-profile/components/CoupleHeader'
import { renderScreen } from '@/test/renderScreen'

/**
 * Every prop but `name` and `daysLabel` is optional, and each one changes what
 * the header draws. The counter in particular went unrendered on the hub for
 * the whole of this branch — the component asked for a number its only caller
 * never passed — so both halves of every pair are asserted here rather than
 * only the happy one.
 */
describe('CoupleHeader', () => {
  it('shows both names when there is a partner', async () => {
    await renderScreen(<CoupleHeader name="Alex" partnerName="Pedro" daysLabel="days together" />)

    expect(screen.getByText('Alex & Pedro')).toBeTruthy()
    expect(screen.getByLabelText('Pedro')).toBeTruthy()
  })

  it('shows one name, and one avatar, before a partner has joined', async () => {
    await renderScreen(<CoupleHeader name="Alex" daysLabel="days together" />)

    expect(screen.getByText('Alex')).toBeTruthy()
    expect(screen.getByLabelText('Alex')).toBeTruthy()
    expect(screen.queryByText(/&/)).toBeNull()
  })

  it('shows the photos when there are photos', async () => {
    await renderScreen(
      <CoupleHeader
        name="Alex"
        partnerName="Pedro"
        photoUri="https://example.com/a.jpg"
        partnerPhotoUri="https://example.com/p.jpg"
        daysLabel="days together"
      />,
    )

    expect(screen.getAllByTestId('avatar-image')).toHaveLength(2)
  })

  it('falls back to initials when there are none', async () => {
    await renderScreen(<CoupleHeader name="Alex" partnerName="Pedro" daysLabel="days together" />)

    expect(screen.queryByTestId('avatar-image')).toBeNull()
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('P')).toBeTruthy()
  })

  it('names the space when it has one', async () => {
    await renderScreen(
      <CoupleHeader name="Alex" spaceName="Our little world" daysLabel="days together" />,
    )

    expect(screen.getByText('Our little world')).toBeTruthy()
  })

  it('draws nothing where the space name would go when there is none', async () => {
    await renderScreen(<CoupleHeader name="Alex" spaceName={null} daysLabel="days together" />)

    expect(screen.queryByText('Our little world')).toBeNull()
  })

  it('counts the days when the couple recorded when they met', async () => {
    await renderScreen(
      <CoupleHeader name="Alex" daysTogether={1395} daysLabel="days together" />,
    )

    // `CountUp` labels itself with the FINAL value, never a frame of the ramp,
    // so this is the figure a screen reader gets as well as the one on screen.
    expect(screen.getByLabelText('1,395 days together')).toBeTruthy()
  })

  it('stays quiet when they did not — null is what daysSince hands back', async () => {
    await renderScreen(<CoupleHeader name="Alex" daysTogether={null} daysLabel="days together" />)

    expect(screen.queryByText(/days together/)).toBeNull()
  })

  it('stays quiet when the caller passes nothing at all', async () => {
    await renderScreen(<CoupleHeader name="Alex" daysLabel="days together" />)

    expect(screen.queryByText(/days together/)).toBeNull()
  })

  it('shows a zero-day count rather than treating it as absent', async () => {
    await renderScreen(<CoupleHeader name="Alex" daysTogether={0} daysLabel="days together" />)

    expect(screen.getByLabelText('0 days together')).toBeTruthy()
  })
})
