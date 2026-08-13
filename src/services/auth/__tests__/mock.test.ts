import { createMockAuthService } from '@/services/auth/mock'

describe('mock auth service', () => {
  const auth = createMockAuthService({ latencyMs: 0 })

  it('signs in with any unreserved address', async () => {
    const result = await auth.signIn({ email: 'a@example.com', password: 'hunter2!' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.email).toBe('a@example.com')
      expect(typeof result.value.emailVerified).toBe('boolean')
    }
  })

  it('rejects the reserved wrong-credentials address', async () => {
    const result = await auth.signIn({ email: 'wrong@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'INVALID_CREDENTIALS' } })
  })

  it('matches reserved addresses case-insensitively', async () => {
    const result = await auth.signIn({ email: 'Wrong@Example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'INVALID_CREDENTIALS' } })
  })

  it('signs up with an unreserved address', async () => {
    const result = await auth.signUp({ email: 'new@example.com', password: 'hunter2!' })

    expect(result.ok).toBe(true)
  })

  it('rejects the reserved taken address on sign up', async () => {
    const result = await auth.signUp({ email: 'taken@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'EMAIL_TAKEN' } })
  })

  it('never reports wrong-credentials from sign up, which would be meaningless', async () => {
    const result = await auth.signUp({ email: 'wrong@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'UNKNOWN' } })
  })

  it('reports success for a password reset even on an unknown address', async () => {
    // Confirming which addresses have accounts is account enumeration. Asserted
    // so it is not later "fixed" into a leak.
    const known = await auth.requestPasswordReset({ email: 'a@example.com' })
    const unknown = await auth.requestPasswordReset({ email: 'nobody@example.com' })

    expect(known.ok).toBe(true)
    expect(unknown.ok).toBe(true)
  })

  it('resends a verification email', async () => {
    const result = await auth.resendVerification({ email: 'a@example.com' })

    expect(result.ok).toBe(true)
  })

  it('surfaces a network failure on the reserved address', async () => {
    const result = await auth.signIn({ email: 'offline@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('surfaces a network failure from a password reset too', async () => {
    const result = await auth.requestPasswordReset({ email: 'offline@example.com' })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('is asynchronous, so loading states are real', async () => {
    const slow = createMockAuthService({ latencyMs: 20 })
    const started = Date.now()

    await slow.signIn({ email: 'a@example.com', password: 'hunter2!' })

    expect(Date.now() - started).toBeGreaterThanOrEqual(15)
  })
})
