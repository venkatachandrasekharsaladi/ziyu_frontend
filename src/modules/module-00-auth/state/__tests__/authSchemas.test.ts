import {
  emailOnlySchema,
  PASSWORD_RULES,
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
    ['too short', 'ab1!'],
    ['missing a number', 'abcdefgh!'],
    ['missing a special character', 'abcdefg1'],
  ])('rejects a password %s', (_why, password) => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password }).success).toBe(false)
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

describe('emailOnlySchema', () => {
  it('accepts a valid address and rejects a malformed one', () => {
    expect(emailOnlySchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(emailOnlySchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})
