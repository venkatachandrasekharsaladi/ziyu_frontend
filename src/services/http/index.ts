/**
 * THE HTTP LAYER — one entry point.
 *
 * Adapters import from here rather than reaching into individual files, so the
 * public surface of the transport is visible in one place and everything else
 * is free to move.
 */
export { del, get, patch, post, put, request, refreshSession } from '@/services/http/client'
export type { ApiResponse, QueryValue, RequestOptions, ResponseMeta } from '@/services/http/client'

export { ApiError, isApiError, networkError } from '@/services/http/errors'
export type { FieldIssue } from '@/services/http/errors'
export {
  toAuthErrorCode,
  toMemoryErrorCode,
  toPairingErrorCode,
  toStoryErrorCode,
} from '@/services/http/errors'

export {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getTokens,
  hydrate,
  isAccessTokenExpired,
  setTokens,
  subscribeToTokens,
} from '@/services/http/tokens'
export type { Tokens } from '@/services/http/tokens'
