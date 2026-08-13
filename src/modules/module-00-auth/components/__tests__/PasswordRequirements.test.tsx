import { render, screen } from '@testing-library/react-native'

import { PasswordRequirements } from '@/modules/module-00-auth/components/PasswordRequirements'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

describe('PasswordRequirements', () => {
  it('lists every rule', async () => {
    await render(<PasswordRequirements value="" />)

    for (const rule of PASSWORD_RULES) {
      expect(screen.getByText(rule.label)).toBeTruthy()
    }
  })

  it('marks nothing met on an empty password', async () => {
    await render(<PasswordRequirements value="" />)

    expect(screen.queryAllByTestId('rule-met')).toHaveLength(0)
    expect(screen.getAllByTestId('rule-unmet')).toHaveLength(PASSWORD_RULES.length)
  })

  it('marks a rule met as soon as it passes', async () => {
    await render(<PasswordRequirements value="abcdefgh" />)

    // Only the length rule passes: no digit, no special character.
    expect(screen.getAllByTestId('rule-met')).toHaveLength(1)
  })

  it('marks every rule met on a fully valid password', async () => {
    await render(<PasswordRequirements value="hunter22!" />)

    expect(screen.getAllByTestId('rule-met')).toHaveLength(PASSWORD_RULES.length)
  })

  it('announces met state as text, so it is not carried by colour alone', async () => {
    await render(<PasswordRequirements value="hunter22!" />)

    for (const rule of PASSWORD_RULES) {
      expect(screen.getByLabelText(`${rule.label}: met`)).toBeTruthy()
    }
  })

  it('announces unmet state as text too', async () => {
    await render(<PasswordRequirements value="" />)

    for (const rule of PASSWORD_RULES) {
      expect(screen.getByLabelText(`${rule.label}: not met`)).toBeTruthy()
    }
  })
})
