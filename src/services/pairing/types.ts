/**
 * THE PAIRING BOUNDARY.
 *
 * Mirrors `services/auth` exactly: a typed interface, errors as codes rather
 * than strings, and a mock implementation until a provider exists. Swapping in
 * a real one is a change to `index.ts` and nothing else.
 */
export type PairingErrorCode =
  | 'CODE_INVALID'
  | 'CODE_EXPIRED'
  | 'CANNOT_PAIR_WITH_SELF'
  | 'NETWORK'
  | 'UNKNOWN'

export type PairingError = {
  code: PairingErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: PairingError }

export type Profile = {
  name: string
  /** How the partner sees them. M01-S02, carried from Figma 522:349 per D31. */
  nickname?: string
  /** `YYYY-MM-DD`. */
  birthday?: string
  pronouns?: string
  photoUri?: string
  /**
   * E.164, digits and a leading `+`. Optional because nothing in onboarding
   * asks for it — it is collected in Settings → Personal Details, and the only
   * feature that requires it is the phone gate on account deletion.
   *
   * NOT IN ANY BACKEND CONTRACT. Added for the settings cluster; whoever
   * writes the real pairing contract has to add it there too. See the spec's
   * open items.
   */
  phone?: string
  /** True only after the code sent to `phone` has been entered correctly. */
  phoneVerified?: boolean
}

export type Partner = {
  id: string
  name: string
  photoUri?: string
  /**
   * How you refer to them. Mirrors `Profile.nickname` — the same question,
   * asked about the other person, on Space -> Edit Partner Details.
   *
   * NOT IN ANY BACKEND CONTRACT, exactly like `Profile.phone` above. Added for
   * the Space cluster; whoever writes the real pairing contract has to add both
   * of these there too.
   */
  nickname?: string
  pronouns?: string
}

export type Invite = {
  /** Six characters, no separator. The separator is display only. */
  code: string
  expiresAt: string
}

export type PairingService = {
  createProfile: (input: Profile) => Promise<Result<Profile>>
  createInvite: () => Promise<Result<Invite>>
  /** Resolves the partner behind a code without committing to them yet. */
  redeemCode: (input: { code: string }) => Promise<Result<Partner>>
  /** Commits the relationship. */
  confirmPartner: (input: { partnerId: string }) => Promise<Result<null>>
  cancelInvite: (input: { code: string }) => Promise<Result<null>>
}
