import { render, screen } from '@testing-library/react-native'

import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'

describe('ScreenIntro', () => {
  it('draws the pill, the headline and the prose', async () => {
    await render(
      <ScreenIntro
        chip="A notebook for tomorrow"
        title="Our plans."
        lede="All the things we're going to do together."
      />,
    )

    expect(screen.getByText('A notebook for tomorrow')).toBeTruthy()
    expect(screen.getByText('Our plans.')).toBeTruthy()
    expect(screen.getByText("All the things we're going to do together.")).toBeTruthy()
  })

  it('prints the aside beside the headline when there is a figure to report', async () => {
    await render(<ScreenIntro chip="Sealed Vault" title="Time Capsules" aside="12 waiting for us" />)

    expect(screen.getByText('12 waiting for us')).toBeTruthy()
  })

  it('leaves out the lines it was given nothing for', async () => {
    await render(<ScreenIntro chip="Sealed Vault" title="Time Capsules" />)

    // Three of the ten frames carry an aside and the rest do not, so the header
    // has to collapse cleanly rather than reserve a blank column for it.
    expect(screen.getByText('Time Capsules')).toBeTruthy()
    expect(screen.queryByText('12 waiting for us')).toBeNull()
  })

  it('renders with and without the pill icon, since the frames disagree', async () => {
    const withoutIcon = await render(<ScreenIntro chip="Sealed Vault" title="Time Capsules" />)
    expect(screen.getByText('Sealed Vault')).toBeTruthy()
    withoutIcon.unmount()

    await render(<ScreenIntro chip="Sealed Vault" chipIcon="lock" title="Time Capsules" />)
    expect(screen.getByText('Sealed Vault')).toBeTruthy()
  })

  it('announces nothing of its own, so the headline is read as text and not as a control', async () => {
    await render(<ScreenIntro chip="Sealed Vault" title="Time Capsules" />)

    // The pill is a label, not a filter. It carried no `onPress` in any frame,
    // and giving it a role would put a decorative word in the focus order.
    expect(screen.queryByRole('button')).toBeNull()
  })
})
