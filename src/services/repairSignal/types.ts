export type RepairSignal = {
  id: string
  status: 'open' | 'mutual'
  sentByMe: boolean
  mutual: boolean
  createdAt: string
  partnerSignaledAt?: string | null
  expiresAt: string
}

export type RepairSignalResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'NO_COUPLE' | 'FORBIDDEN' | 'NETWORK' | 'UNKNOWN' } }

export type RepairSignalService = {
  current: () => Promise<RepairSignalResult<RepairSignal | null>>
  send: () => Promise<RepairSignalResult<RepairSignal>>
  cancel: () => Promise<RepairSignalResult<void>>
}
