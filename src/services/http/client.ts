/**
 * THE HTTP TRANSPORT.
 *
 * One `fetch` for the whole app. Everything above it — the five service
 * adapters — describes *what* to call; this file owns *how*: base URL,
 * authentication, envelope unwrapping, timeouts, and the single genuinely
 * subtle part, token refresh.
 *
 * ── THE ENVELOPE ───────────────────────────────────────────────────────────
 * Every response is `{ data, meta, requestId }` or `{ error, requestId }`.
 * Unwrapping here means no adapter ever writes `response.data.data`, and no
 * adapter can forget to check for an error body. A 2xx with an `error` key, or
 * a 4xx with none, is treated as malformed rather than trusted.
 *
 * ── WHY REFRESH LIVES HERE ─────────────────────────────────────────────────
 * An access token lasts 15 minutes, so expiry is a routine event, not an
 * error. If each adapter handled it, five modules would each need the same
 * retry logic and would each get the concurrency wrong. Instead:
 *
 *   1. A request that will land expired refreshes *before* being sent.
 *   2. A request that comes back `TOKEN_EXPIRED` anyway refreshes and replays
 *      once. Once, not in a loop — a second failure is a real sign-out, and
 *      retrying it would be an infinite loop against our own server.
 *   3. Concurrent requests share ONE refresh. Six screens mounting at the
 *      same instant must not fire six refreshes: refresh tokens ROTATE, so the
 *      five losers would present an already-used token, the server would read
 *      that as theft, and it would revoke every session the user has. The
 *      in-flight promise below is not an optimisation — it is what stops the
 *      app from logging itself out.
 *
 * ── TIMEOUTS ───────────────────────────────────────────────────────────────
 * `fetch` has no default timeout: on a flaky mobile connection a request can
 * hang until the OS gives up, and the spinner never stops. Every request gets
 * an `AbortController` and surfaces as `NETWORK`, which is what the screens
 * already know how to render.
 *
 * ── WHAT IS NOT HERE ───────────────────────────────────────────────────────
 * No caching, no deduplication, no retry-on-5xx. React Query is already a
 * dependency and does all three better; a second half-implementation competing
 * with it would be worse than none.
 */
import { API_URL, isMockMode } from '@/config/env'
import { ApiError, networkError, type FieldIssue } from '@/services/http/errors'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hydrate,
  isAccessTokenExpired,
  setTokens,
} from '@/services/http/tokens'

const DEFAULT_TIMEOUT_MS = 15_000

export type QueryValue = string | number | boolean | undefined | null

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Serialised as JSON. Use `form` for multipart. */
  body?: unknown
  form?: FormData
  query?: Record<string, QueryValue>
  /** Set false for the public auth endpoints, so a dead token is not attached. */
  authenticated?: boolean
  signal?: AbortSignal
  timeoutMs?: number
}

/** `meta` is open-ended by design; only `nextCursor` is contractual today. */
export type ResponseMeta = {
  nextCursor?: string | null
  [key: string]: unknown
}

export type ApiResponse<T> = {
  data: T
  meta: ResponseMeta
  requestId?: string
}

// ── URL building ────────────────────────────────────────────────────────────

function baseUrl(): string {
  if (isMockMode) {
    /**
     * Reached only if an HTTP adapter was constructed without a configured
     * server. The message names the variable rather than letting a request go
     * to `/v1/...` on an undefined host and fail as a confusing DNS error.
     */
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set, but an HTTP service was used. '
        + 'Copy .env.example to .env, set it, and restart the dev server.',
    )
  }
  return `${API_URL}/v1`
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  if (!query) return url

  const pairs: string[] = []
  for (const key of Object.keys(query)) {
    const value = query[key]
    // `false` and `0` are meaningful; only absent values are dropped.
    if (value === undefined || value === null || value === '') continue
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }

  return pairs.length > 0 ? `${url}?${pairs.join('&')}` : url
}

// ── Envelope parsing ────────────────────────────────────────────────────────

type ErrorBody = {
  error?: { code?: unknown; message?: unknown; issues?: unknown }
  requestId?: unknown
}

function readIssues(value: unknown): FieldIssue[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .filter((issue): issue is { field: string; message: string } =>
      typeof issue === 'object'
      && issue !== null
      && typeof (issue as { field?: unknown }).field === 'string'
      && typeof (issue as { message?: unknown }).message === 'string')
    .map((issue) => ({ field: issue.field, message: issue.message }))
}

function toApiError(status: number, payload: unknown, requestId?: string): ApiError {
  const body = (payload ?? {}) as ErrorBody
  const code = typeof body.error?.code === 'string' ? body.error.code : null

  if (!code) {
    /**
     * A 4xx/5xx that is not an envelope — a proxy 502 page, a gateway timeout,
     * an HTML error. There is no code to map, so it becomes `UNKNOWN` rather
     * than a fabricated one that a screen might handle as if it were real.
     */
    return new ApiError('UNKNOWN', `Request failed with status ${status}`, { status, requestId })
  }

  return new ApiError(
    code,
    typeof body.error?.message === 'string' ? body.error.message : code,
    { status, issues: readIssues(body.error?.issues), requestId },
  )
}

// ── Refresh ─────────────────────────────────────────────────────────────────

/** The shared in-flight refresh. See the header note on rotation. */
let refreshInFlight: Promise<boolean> | null = null

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  let response: Response
  try {
    response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    /**
     * The network died mid-refresh. The token is probably still good, so the
     * session is NOT cleared — signing someone out because a tunnel dropped
     * would be the worst possible reading of a transient failure.
     */
    return false
  }

  if (!response.ok) {
    // The server rejected the token: revoked, rotated, or expired. Really gone.
    await clearTokens()
    return false
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { accessToken?: unknown; refreshToken?: unknown; expiresIn?: unknown }
  } | null

  const data = payload?.data
  if (
    typeof data?.accessToken !== 'string'
    || typeof data.refreshToken !== 'string'
    || typeof data.expiresIn !== 'number'
  ) {
    await clearTokens()
    return false
  }

  await setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  })
  return true
}

/**
 * Coalesces concurrent callers onto one refresh. Every caller awaits the same
 * promise and sees the same outcome; the slot is cleared in `finally` so the
 * next expiry starts a fresh exchange.
 */
function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    const pending = performRefresh()
    refreshInFlight = pending
    // Cleared only if this call still owns the slot, so a later refresh that
    // started in the meantime is not discarded by an earlier one settling.
    void pending.then(
      () => {
        if (refreshInFlight === pending) refreshInFlight = null
      },
      () => {
        if (refreshInFlight === pending) refreshInFlight = null
      },
    )
    return pending
  }
  return refreshInFlight
}

// ── The request ─────────────────────────────────────────────────────────────

async function send(
  path: string,
  options: RequestOptions,
  attachToken: boolean,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  // A caller's own cancellation (screen unmounted) must still win.
  const onAbort = () => controller.abort()
  options.signal?.addEventListener('abort', onAbort)

  const headers: Record<string, string> = { accept: 'application/json' }

  /**
   * `Content-Type` is set for JSON only. For `FormData` the runtime must add it
   * itself, because it has to append the multipart boundary — writing
   * `multipart/form-data` by hand produces a body the server cannot parse.
   */
  if (options.form === undefined && options.body !== undefined) {
    headers['content-type'] = 'application/json'
  }

  if (attachToken) {
    const token = getAccessToken()
    if (token) headers.authorization = `Bearer ${token}`
  }

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
      signal: controller.signal,
      // Lets the browser target carry the refresh cookie; ignored by RN.
      credentials: 'include',
    })
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * Performs a request and returns the unwrapped envelope.
 *
 * Throws `ApiError` for everything: a server error code, a transport failure
 * (`NETWORK`) or an unreadable response (`UNKNOWN`). Adapters convert.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const authenticated = options.authenticated ?? true

  if (authenticated) {
    await hydrate()
    // Pre-emptive: refresh before spending a round trip on a token we know is dead.
    if (isAccessTokenExpired() && getRefreshToken()) await refreshSession()
  }

  let response: Response
  try {
    response = await send(path, options, authenticated)
  } catch (error) {
    throw networkError(error)
  }

  // The reactive path: the token expired between the check and the server.
  if (response.status === 401 && authenticated && getRefreshToken()) {
    const refreshed = await refreshSession()
    if (refreshed) {
      try {
        response = await send(path, options, true)
      } catch (error) {
        throw networkError(error)
      }
    }
  }

  const requestId = response.headers.get('x-request-id') ?? undefined

  // 204 has no body, and `response.json()` on an empty body throws.
  if (response.status === 204) {
    return { data: undefined as T, meta: {}, requestId }
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) throw toApiError(response.status, payload, requestId)

  if (typeof payload !== 'object' || payload === null || !('data' in payload)) {
    throw new ApiError('UNKNOWN', 'Malformed response envelope', {
      status: response.status,
      requestId,
    })
  }

  const envelope = payload as { data: T; meta?: ResponseMeta; requestId?: string }
  return {
    data: envelope.data,
    meta: envelope.meta ?? {},
    requestId: envelope.requestId ?? requestId,
  }
}

/** Thin sugar. Adapters that ignore `meta` — most of them — read better for it. */
export async function get<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  return (await request<T>(path, { method: 'GET', query })).data
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return (await request<T>(path, { method: 'POST', body })).data
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return (await request<T>(path, { method: 'PUT', body })).data
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  return (await request<T>(path, { method: 'PATCH', body })).data
}

export async function del<T>(path: string): Promise<T> {
  return (await request<T>(path, { method: 'DELETE' })).data
}

/** Exposed for the auth adapter's sign-out, which must not recurse into refresh. */
export { refreshSession }
