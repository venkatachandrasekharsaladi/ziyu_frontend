import {
  emailOnlySchema,
  PASSWORD_RULES,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/modules/module-00-auth/state/authSchemas'

describe('signInSchema', () => {
  it('accepts a valid pair', () => {
    expect(signInSchema.safeParse({ email: 'a@example.com', password: 'x' }).success).toBe(true)
  })

  it('rejects a malformed email with the message the screen shows', () => {
    const result = signInSchema.safeParse({ email: 'nope', password: 'x' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a valid email address')
    }
  })

  it('rejects an empty password', () => {
    expect(signInSchema.safeParse({ email: 'a@example.com', password: '' }).success).toBe(false)
  })

  it('does not impose strength rules on sign in', () => {
    // Rejecting a weak password a user already has is a dead end.
    expect(signInSchema.safeParse({ email: 'a@example.com', password: 'a' }).success).toBe(true)
  })

  it('trims the email, so a trailing space is not a validation failure', () => {
    const result = signInSchema.safeParse({ email: '  a@example.com  ', password: 'x' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('a@example.com')
    }
  })
})

describe('signUpSchema', () => {
  it('accepts a password meeting every rule', () => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password: 'hunter22!' }).success).toBe(
      true,
    )
  })

  it.each([
    ['too short', 'ab1'],
    ['missing a number', 'abcdefgh'],
    ['missing a letter', '12345678'],
    ['longer than the contract maximum', `${'a'.repeat(128)}1`],
  ])('rejects a password %s', (_why, password) => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password }).success).toBe(false)
  })

  /**
   * The contract's policy is 8-128 characters with at least one letter and one
   * number (`schemas/VALIDATION.md`). The client must not be stricter than that
   * or it blocks passwords the server would accept.
   */
  it.each([
    ['the contract signup example', 'LoveOS@123'],
    ['the contract reset example', 'NewLoveOS@123'],
    ['no special character, which the contract does not require', 'hunter22'],
    ['exactly the contract maximum', `${'a'.repeat(127)}1`],
  ])('accepts %s', (_why, password) => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password }).success).toBe(true)
  })
})

describe('PASSWORD_RULES', () => {
  it('is the same set the schema enforces, so the checklist cannot disagree', () => {
    const passing = 'hunter22!'

    expect(PASSWORD_RULES.every((rule) => rule.test(passing))).toBe(true)
    expect(signUpSchema.safeParse({ email: 'a@example.com', password: passing }).success).toBe(true)
  })

  it('fails every rule on an empty password', () => {
    expect(PASSWORD_RULES.some((rule) => rule.test(''))).toBe(false)
  })

  it('agrees with the schema on every rejecting password', () => {
    // The property that matters: if any rule fails, the schema must reject.
    for (const password of ['ab1!', 'abcdefgh!', 'abcdefg1', '', 'short1!']) {
      const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(password))
      const schemaAccepts = signUpSchema.safeParse({
        email: 'a@example.com',
        password,
      }).success

      expect(schemaAccepts).toBe(allRulesPass)
    }
  })

  it.each(PASSWORD_RULES.map((rule) => [rule.id, rule] as const))(
    'rule %s has a human label',
    (_id, rule) => {
      expect(rule.label.length).toBeGreaterThan(0)
    },
  )
})

describe('resetPasswordSchema', () => {
  it('accepts a valid password confirmed correctly', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewLoveOS@123',
      confirmPassword: 'NewLoveOS@123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a mismatch, and says so on the confirm field', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewLoveOS@123',
      confirmPassword: 'NewLoveOS@124',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]

      // On the confirm field, not the form: the user must know WHICH box to fix.
      expect(issue?.path).toEqual(['confirmPassword'])
      expect(issue?.message).toBe('Both passwords need to match.')
    }
  })

  it('applies the same policy the rest of the app applies', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: '12345678',
      confirmPassword: '12345678',
    })

    expect(result.success).toBe(false)
  })

  it('does not report a mismatch when the password itself is the problem', () => {
    // Matching but weak. Telling someone their passwords disagree when they do
    // not sends them hunting for a typo that is not there.
    const result = resetPasswordSchema.safeParse({
      newPassword: 'short1',
      confirmPassword: 'short1',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.every((issue) => issue.path[0] !== 'confirmPassword')).toBe(true)
    }
  })
})

describe('emailOnlySchema', () => {
  it('accepts a valid address and rejects a malformed one', () => {
    expect(emailOnlySchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(emailOnlySchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})
