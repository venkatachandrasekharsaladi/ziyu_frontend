/**
 * THE SERVER ERROR SURFACE.
 *
 * WHY A CLASS AND NOT A `Result`: the five service boundaries disagree about
 * how failure is reported — `auth`, `pairing`, `story` and `memories` return
 * `Result<T>`, `chat` throws. A transport that picked one would force the other
 * to be re-wrapped at every call site. So the transport always *throws* an
 * `ApiError`, and each adapter converts that into whatever its own interface
 * promised. One rule per module, applied in one place.
 *
 * WHY CODES SURVIVE AND MESSAGES DO NOT: `ERROR_CODES.md` is explicit that a
 * client renders its own copy from a code and never displays the server's
 * prose. `message` is carried here for logs and nothing else — no screen reads
 * it. That is also why the per-module mappers below narrow to each module's
 * own union rather than leaking the server's full vocabulary upward: a screen
 * that only knows four outcomes must not be handed a fifth.
 *
 * `NETWORK` and `UNKNOWN` are synthesised locally. They are not server codes:
 * one means the request never got an answer, the other means it got an answer
 * nobody anticipated.
 */
import { AUTH_ERROR_CODES, type AuthErrorCode } from '@/services/auth/types'
import type { MemoryErrorCode } from '@/services/memories/types'
import type { PairingErrorCode } from '@/services/pairing/types'
import type { StoryErrorCode } from '@/services/story/types'

/** A single field rejection from `VALIDATION_ERROR`. */
export type FieldIssue = {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly code: string
  /** Absent when the request never reached the server. */
  readonly status?: number
  readonly issues?: FieldIssue[]
  /** Echoed from `x-request-id`; the one value worth quoting in a bug report. */
  readonly requestId?: string

  constructor(
    code: string,
    message: string,
    options: { status?: number; issues?: FieldIssue[]; requestId?: string } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = options.status
    this.issues = options.issues
    this.requestId = options.requestId
  }
}

/** The request never got an answer: airplane mode, DNS, timeout, TLS. */
export const networkError = (cause?: unknown): ApiError =>
  new ApiError('NETWORK', cause instanceof Error ? cause.message : 'Network request failed')

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError

// ── Per-module narrowing ────────────────────────────────────────────────────

const AUTH_CODES = new Set<string>(AUTH_ERROR_CODES)

export function toAuthErrorCode(error: unknown): AuthErrorCode {
  if (!isApiError(error)) return 'UNKNOWN'
  /**
   * `UNAUTHORIZED` is not in the client's union, but it means exactly what
   * `TOKEN_INVALID` means to a screen: the session is gone, sign in again.
   * Collapsing it here keeps the two states the UI actually distinguishes.
   */
  if (error.code === 'UNAUTHORIZED') return 'TOKEN_INVALID'
  return AUTH_CODES.has(error.code) ? (error.code as AuthErrorCode) : 'UNKNOWN'
}

export function toPairingErrorCode(error: unknown): PairingErrorCode {
  if (!isApiError(error)) return 'UNKNOWN'
  switch (error.code) {
    case 'CODE_INVALID':
    case 'CODE_EXPIRED':
    case 'CANNOT_PAIR_WITH_SELF':
    case 'NETWORK':
      return error.code
    /**
     * The pairing union has no `ALREADY_PAIRED`, and inventing one would mean
     * touching a screen. A code that cannot be redeemed by this account is,
     * from the redeem screen's point of view, a code that does not work.
     */
    case 'ALREADY_PAIRED':
      return 'CODE_INVALID'
    default:
      return 'UNKNOWN'
  }
}

export function toMemoryErrorCode(error: unknown): MemoryErrorCode {
  if (!isApiError(error)) return 'UNKNOWN'
  if (error.code === 'NOT_FOUND' || error.code === 'NETWORK') return error.code
  return 'UNKNOWN'
}

export function toStoryErrorCode(error: unknown): StoryErrorCode {
  if (isApiError(error) && error.code === 'NETWORK') return 'NETWORK'
  return 'UNKNOWN'
}
