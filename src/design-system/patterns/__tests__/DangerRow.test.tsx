import { screen, userEvent } from '@testing-library/react-native'

import { DangerRow } from '@/design-system/patterns/DangerRow'
import { renderScreen } from '@/test/renderScreen'

const COPY = {
  confirmTitle: 'Sign out?',
  confirmBody: 'You will need your email and password to get back in.',
  confirmLabel: 'Sign out',
  cancelLabel: 'Stay signed in',
}

describe('DangerRow', () => {
  it('does not act on the first tap', async () => {
    const onConfirm = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <DangerRow icon="log-out" label="Log Out" onConfirm={onConfirm} {...COPY} />,
    )
    await user.press(screen.getByRole('button', { name: 'Log Out' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByText(COPY.confirmTitle)).toBeTruthy()
  })

  it('acts once confirmed', async () => {
    const onConfirm = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <DangerRow icon="log-out" label="Log Out" onConfirm={onConfirm} {...COPY} />,
    )
    await user.press(screen.getByRole('button', { name: 'Log Out' }))
    await user.press(screen.getByRole('button', { name: COPY.confirmLabel }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('backs out without acting', async () => {
    const onConfirm = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <DangerRow icon="log-out" label="Log Out" onConfirm={onConfirm} {...COPY} />,
    )
    await user.press(screen.getByRole('button', { name: 'Log Out' }))
    await user.press(screen.getByRole('button', { name: COPY.cancelLabel }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByText(COPY.confirmTitle)).toBeNull()
  })
})
