import { createMockPairingService } from '@/services/pairing/mock'

describe('mock pairing service', () => {
  const pairing = createMockPairingService({ latencyMs: 0 })

  it('creates an invite with a six-character code', async () => {
    const result = await pairing.createInvite()

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.code).toHaveLength(6)
  })

  it('redeems the reserved valid code and names the partner', async () => {
    const result = await pairing.redeemCode({ code: 'L8V7QK' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('Chandu')
  })

  it('rejects an unknown code', async () => {
    const result = await pairing.redeemCode({ code: 'ZZZZZZ' })

    expect(result).toEqual({ ok: false, error: { code: 'CODE_INVALID' } })
  })

  it('reports an expired code distinctly from an invalid one', async () => {
    const result = await pairing.redeemCode({ code: 'EXPIRE' })

    expect(result).toEqual({ ok: false, error: { code: 'CODE_EXPIRED' } })
  })

  it('refuses to pair someone with themselves', async () => {
    // The first thing anyone tries, and the last thing anyone handles.
    const result = await pairing.redeemCode({ code: 'SELF12' })

    expect(result).toEqual({ ok: false, error: { code: 'CANNOT_PAIR_WITH_SELF' } })
  })

  it('surfaces a network failure', async () => {
    const result = await pairing.redeemCode({ code: 'OFFLIN' })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('is case-insensitive and tolerant of surrounding space', async () => {
    const result = await pairing.redeemCode({ code: '  l8v7qk ' })

    expect(result.ok).toBe(true)
  })

  it('confirms a partner', async () => {
    const result = await pairing.confirmPartner({ partnerId: 'partner-chandu' })

    expect(result.ok).toBe(true)
  })

  it('cancels an invite', async () => {
    const result = await pairing.cancelInvite({ code: 'L8V7QK' })

    expect(result.ok).toBe(true)
  })

  it('is asynchronous, so loading states are real', async () => {
    const slow = createMockPairingService({ latencyMs: 20 })
    const started = Date.now()

    await slow.createInvite()

    expect(Date.now() - started).toBeGreaterThanOrEqual(15)
  })

  it('issues an invite that does not expire mid-session', async () => {
    // A fixture that expires while you are looking at it is a debugging puzzle.
    const result = await pairing.createInvite()

    expect(result.ok).toBe(true)
    if (result.ok) expect(new Date(result.value.expiresAt).getTime()).toBeGreaterThan(Date.now())
  })
})
