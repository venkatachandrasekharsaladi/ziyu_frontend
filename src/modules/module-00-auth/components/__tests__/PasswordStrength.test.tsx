import { render, screen } from '@testing-library/react-native'

import { RESET_PASSWORD_COPY as COPY } from '@/copy/resetPassword'
import { PasswordStrength } from '@/modules/module-00-auth/components/PasswordStrength'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

describe('PasswordStrength', () => {
  it('draws one bar per contract rule', async () => {
    await render(<PasswordStrength value="" />)

    // Three bars because the contract has three rules, not because three is a
    // nice number. If the policy gains a rule the meter gains a bar.
    expect(screen.getAllByTestId(/^strength-bar-/)).toHaveLength(PASSWORD_RULES.length)
  })

  it('fills nothing and reads weak on an empty password', async () => {
    await render(<PasswordStrength value="" />)

    expect(screen.queryAllByTestId('strength-bar-filled')).toHaveLength(0)
    expect(screen.getByText(COPY.strengthLevels.weak)).toBeTruthy()
  })

  it('reads weak while only one rule passes', async () => {
    // 'abc' is too short and has no digit, so only the letter rule passes.
    await render(<PasswordStrength value="abc" />)

    expect(screen.getAllByTestId('strength-bar-filled')).toHaveLength(1)
    expect(screen.getByText(COPY.strengthLevels.weak)).toBeTruthy()
  })

  it('reads fair when two rules pass', async () => {
    await render(<PasswordStrength value="abcdefgh" />)

    expect(screen.getAllByTestId('strength-bar-filled')).toHaveLength(2)
    expect(screen.getByText(COPY.strengthLevels.fair)).toBeTruthy()
  })

  it('reads strong only when the password actually satisfies the contract', async () => {
    await render(<PasswordStrength value="hunter22" />)

    expect(screen.getAllByTestId('strength-bar-filled')).toHaveLength(3)
    expect(screen.getByText(COPY.strengthLevels.strong)).toBeTruthy()
  })

  it('does not call an over-long password strong', async () => {
    // The Stitch prototype called anything past six characters "Strong", which
    // would label a 129-character password the server rejects as the best kind.
    // It satisfies letter and number but breaks the maximum, so it is Fair at
    // best — and never the top of the scale.
    await render(<PasswordStrength value={`${'a'.repeat(128)}1`} />)

    expect(screen.queryByText(COPY.strengthLevels.strong)).toBeNull()
    expect(screen.getAllByTestId('strength-bar-filled')).toHaveLength(2)
  })

  it('labels itself, so the meter is not a row of anonymous bars', async () => {
    await render(<PasswordStrength value="" />)

    expect(screen.getByText(COPY.strengthLabel)).toBeTruthy()
  })

  it('states strength as text, so it is not carried by colour alone', async () => {
    await render(<PasswordStrength value="hunter22" />)

    expect(screen.getByLabelText(`${COPY.strengthLabel}: ${COPY.strengthLevels.strong}`)).toBeTruthy()
  })
})
