import { RESERVED_RESET_TOKENS, createMockAuthService } from '@/services/auth/mock'

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

    expect(result).toEqual({ ok: false, error: { code: 'EMAIL_ALREADY_EXISTS' } })
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

/**
 * Reset password. Contract: `contracts/auth/08-reset-password.md`.
 *
 * The reserved tokens exist so every documented failure is reachable by hand on
 * a device and deterministically here, the same trick the reserved addresses
 * above play for sign in.
 */
describe('mock auth service — resetPassword', () => {
  const auth = createMockAuthService({ latencyMs: 0 })

  it('resets with the reserved valid token', async () => {
    const result = await auth.resetPassword({
      token: RESERVED_RESET_TOKENS.valid,
      newPassword: 'NewLoveOS@123',
    })

    expect(result).toEqual({ ok: true, value: null })
  })

  it('reports an expired token distinctly from an invalid one', async () => {
    const result = await auth.resetPassword({
      token: RESERVED_RESET_TOKENS.expired,
      newPassword: 'NewLoveOS@123',
    })

    expect(result).toEqual({ ok: false, error: { code: 'TOKEN_EXPIRED' } })
  })

  it('reports a consumed token as invalid, per the contract test cases', async () => {
    // CONTRACT_TEST_CASES.md: "Used token -> 401 TOKEN_INVALID".
    const result = await auth.resetPassword({
      token: RESERVED_RESET_TOKENS.used,
      newPassword: 'NewLoveOS@123',
    })

    expect(result).toEqual({ ok: false, error: { code: 'TOKEN_INVALID' } })
  })

  it('rejects an unknown token', async () => {
    const result = await auth.resetPassword({
      token: 'never-issued',
      newPassword: 'NewLoveOS@123',
    })

    expect(result).toEqual({ ok: false, error: { code: 'TOKEN_INVALID' } })
  })

  it('rejects a missing token as a malformed request, not a bad token', async () => {
    const result = await auth.resetPassword({ token: '', newPassword: 'NewLoveOS@123' })

    expect(result).toEqual({ ok: false, error: { code: 'INVALID_REQUEST' } })
  })

  it('enforces the contract password policy server-side too', async () => {
    // The client validates first, but a server that trusted the client would be
    // no server at all.
    const result = await auth.resetPassword({
      token: RESERVED_RESET_TOKENS.valid,
      newPassword: 'short1',
    })

    expect(result).toEqual({ ok: false, error: { code: 'WEAK_PASSWORD' } })
  })

  it('surfaces a network failure', async () => {
    const result = await auth.resetPassword({
      token: RESERVED_RESET_TOKENS.offline,
      newPassword: 'NewLoveOS@123',
    })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('is asynchronous, so loading states are real', async () => {
    const slow = createMockAuthService({ latencyMs: 20 })
    const started = Date.now()

    await slow.resetPassword({
      token: RESERVED_RESET_TOKENS.valid,
      newPassword: 'NewLoveOS@123',
    })

    expect(Date.now() - started).toBeGreaterThanOrEqual(15)
  })
})

/**
 * Sign out. Contract: `contracts/auth/10-logout.md`.
 *
 * Returns nothing and cannot fail from the caller's side. The contract's 204 is
 * a courtesy: the session is gone locally whatever the server says, so there is
 * no outcome for a screen to branch on and no `Result` to hand it.
 */
describe('mock auth service - signOut', () => {
  const auth = createMockAuthService({ latencyMs: 0 })

  it('resolves', async () => {
    await expect(auth.signOut()).resolves.toBeUndefined()
  })

  it('resolves even with no session to end, so the caller needs no guard', async () => {
    await auth.signOut()

    await expect(auth.signOut()).resolves.toBeUndefined()
  })

  it('is asynchronous, so the button can show a loading state', async () => {
    const slow = createMockAuthService({ latencyMs: 20 })
    const started = Date.now()

    await slow.signOut()

    expect(Date.now() - started).toBeGreaterThanOrEqual(15)
  })
})
