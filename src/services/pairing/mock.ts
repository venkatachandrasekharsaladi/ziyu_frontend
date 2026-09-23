import type {
  CoupleLifecycle,
  Invite,
  PairingErrorCode,
  PairingService,
  Partner,
  Profile,
  Result,
} from '@/services/pairing/types'

/**
 * Reserved codes, so every path is reachable by hand on a device and
 * deterministically in tests. Six characters each, matching real codes.
 */
const RESERVED: Record<string, PairingErrorCode | 'VALID'> = {
  L8V7QK: 'VALID',
  EXPIRE: 'CODE_EXPIRED',
  SELF12: 'CANNOT_PAIR_WITH_SELF',
  OFFLIN: 'NETWORK',
  BROKEN: 'UNKNOWN',
}

/** The partner behind the valid reserved code. Matches the Figma copy. */
const MOCK_PARTNER: Partner = { id: 'partner-chandu', name: 'Chandu' }

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function fail(code: PairingErrorCode): Result<never> {
  return { ok: false, error: { code } }
}

type MockOptions = {
  /** Default is deliberately slow enough that loading states are visible. */
  latencyMs?: number
}

export function createMockPairingService({ latencyMs = 600 }: MockOptions = {}): PairingService {
  let lifecycle: CoupleLifecycle = {
    status: 'connected',
    sharedWritesAllowed: true,
    unpairPending: false,
    unpairRequestedByMe: false,
  }
  return {
    async createProfile(input: Profile) {
      await wait(latencyMs)

      return { ok: true, value: input }
    },

    async createInvite() {
      await wait(latencyMs)

      const invite: Invite = {
        code: 'L8V7QK',
        // Fixed rather than computed: a mock that expires while you are looking
        // at it is a debugging puzzle, not a fixture.
        expiresAt: '2099-01-01T00:00:00.000Z',
      }

      return { ok: true, value: invite }
    },

    async redeemCode({ code }) {
      await wait(latencyMs)

      const clean = code.trim().toUpperCase()
      const reserved = RESERVED[clean]

      if (reserved === 'VALID') return { ok: true, value: MOCK_PARTNER }
      if (reserved) return fail(reserved)

      return fail('CODE_INVALID')
    },

    async confirmPartner({ partnerId }) {
      await wait(latencyMs)

      if (!partnerId) return fail('UNKNOWN')

      return { ok: true, value: null }
    },

    async cancelInvite({ code }) {
      await wait(latencyMs)

      if (RESERVED[code.trim().toUpperCase()] === 'NETWORK') return fail('NETWORK')

      return { ok: true, value: null }
    },

    async getSpace() {
      await wait(latencyMs)

      return {
        ok: true,
        value: {
          coupleId: 'mock-couple',
          coverStyle: 'dawn',
          status: 'inviting',
        },
      }
    },

    async getLifecycle() {
      await wait(latencyMs)
      return { ok: true, value: lifecycle }
    },

    async pause() {
      await wait(latencyMs)
      lifecycle = { ...lifecycle, status: 'paused', sharedWritesAllowed: false }
      return { ok: true, value: lifecycle }
    },

    async reactivate() {
      await wait(latencyMs)
      lifecycle = { ...lifecycle, status: 'connected', sharedWritesAllowed: true }
      return { ok: true, value: lifecycle }
    },

    async requestUnpair() {
      await wait(latencyMs)
      lifecycle = {
        status: 'paused', sharedWritesAllowed: false,
        unpairPending: true, unpairRequestedByMe: true,
      }
      return { ok: true, value: lifecycle }
    },

    async cancelUnpair() {
      await wait(latencyMs)
      lifecycle = { ...lifecycle, unpairPending: false, unpairRequestedByMe: false }
      return { ok: true, value: lifecycle }
    },
  }
}
