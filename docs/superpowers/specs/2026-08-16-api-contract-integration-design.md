# API Contract Integration — Design

Date: 2026-08-16
Status: Approved, ready for planning
Contract version: **v2** (`LoveOS-Authentication-API-Contracts-v2/`) — 18 endpoint files,
`schemas/ERROR_CODES.md`, `schemas/realtime-pairing.md`, `openapi.yaml`.
Supersedes v1, which this design originally targeted; see §14 for what changed and why.

## 1. Why

The app has four service boundaries (`auth`, `pairing`, `story`, `memories`), each a typed
interface backed by an in-memory mock, each with a documented one-line swap point in its
`index.ts`. Those boundaries were built deliberately so that a real provider could be dropped
in without touching a screen.

A backend contract now exists for authentication, profile, pairing and onboarding — 18
endpoints against `https://api.loveos.app/api/v1`. No server implements it yet. This design
makes the client speak that contract exactly, while keeping the mocks as the default so the
app continues to run and every existing test stays green.

The measure of success is that standing up the server requires setting one environment
variable and nothing else.

## 2. Scope

### In

- A typed HTTP transport with response validation, error-envelope parsing and token attachment.
- Token persistence (`expo-secure-store`), rotating refresh, and a session store.
- All 18 contract endpoints implemented across four service boundaries.
- Contract error codes adopted verbatim, and the copy to render them.
- A realtime port for `couple:pairing-status-changed`, defined and left unimplemented (D12).
- Rewiring the ten existing screens onto the new shapes.

### Out

- **New screens.** Six endpoints have no UI to drive them: `verify-email` by token,
  `password/reset` by token, both OAuth routes, `invitations/{id}/send`, and `auth/logout` —
  `module-05-profile` is still empty scaffolding, so there is nowhere to sign out from. All six
  are implemented, typed and tested, but left uncalled. Inventing screens without Figma is out
  of bounds.
- **A realtime transport.** The contract names an event but not a wire protocol (§12.1).
- **Polling `GET /couples/status`.** v2 explicitly forbids it: *"Use on startup/reconnect.
  Do not continuously poll."*
- **`@tanstack/react-query`.** Installed but unused. Adopting it is a separate migration
  touching every screen; the current `async`/`await` + `Result<T>` pattern is coherent and tested.
- **OpenAPI codegen.** See D2.
- **The `story`, `memories` and `home` services.** No contracts cover them.

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Mocks stay the default; HTTP activates on `EXPO_PUBLIC_API_URL` | No server exists. Zero-config today, one variable tomorrow. |
| D2 | Hand-written client, not OpenAPI codegen | v2's `openapi.yaml` types every **request** but no **response** — each is `{description: "Created"}` with no `content`. Responses are what validation protects, so codegen would emit `any` for every return value. The endpoint `.md` files remain the only source of response shapes. |
| D3 | Install `expo-secure-store` | The refresh token is a persistent credential. Reverses the earlier "no provider, so no storage" note in `relationshipStore.ts`, which that note anticipated. |
| D4 | Access token in memory, refresh token in keychain | At `expiresIn: 3600` persisting the access token buys little and widens exposure. |
| D5 | Adopt the published error enum verbatim | `ERROR_CODES.md` defines 24 codes. Using them as the app's own codes makes the mapping the identity function, so there is nothing to drift. |
| D6 | Four service boundaries, not two | `PUT /users/me/profile` is a user resource; `POST /onboarding/complete` is neither user nor couple. |
| D7 | Wire vocabulary stops at the boundary | The app keeps `name`/`photoUri`; the contract's `displayName`/`photoUrl` are mapped in the HTTP implementation. `photoUri` matches React Native's `source={{ uri }}`. |
| D8 | Real single-flight refresh against `POST /auth/refresh` | v2 adds the endpoint. Supersedes v1's fail-closed workaround. |
| D9 | Sign-in routes on real `emailVerified` / `pairingStatus` | The existing unconditional push to verify-email is commented as deferred because `(app)` had no routes. It now has five. |
| D10 | Shared error copy with per-screen overrides | Widening the unions would otherwise force ~15 keys into each of six copy files. |
| D11 | Rotation is atomic; reuse is fatal | `/auth/refresh` rotates the refresh token. The new pair is persisted before the replayed request goes out. `REFRESH_TOKEN_REUSED` means the server suspects theft — the only safe response is an immediate local sign-out. |
| D12 | Realtime as a port, not an implementation | The event is specified; the transport is not, and no realtime client is installed. The interface and its schema land now; the socket lands when the backend names one. |
| D13 | Branch on `error.code`, never `message`/`details` | Mandated by the v2 README. The status-code table (§5.2) is a fallback for bodies that aren't conforming envelopes, not the primary path. |

## 4. Configuration

`src/config/api.ts`

```ts
export const API = {
  /** Absent in every environment until a server exists. */
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
  timeoutMs: 15_000,
} as const

/** The single condition that decides mock vs. HTTP across all four boundaries. */
export const USE_HTTP_SERVICES = API.baseUrl !== null
```

Each `index.ts` becomes:

```ts
export const authService: AuthService = USE_HTTP_SERVICES
  ? createHttpAuthService()
  : createMockAuthService()
```

The swap point keeps the role its comment already claims; it now switches rather than hard-codes.

## 5. Transport

### 5.1 The client — `src/services/api/client.ts`

One entry point:

```ts
type RequestOptions<T> = {
  body?: unknown
  /** Attach the bearer token; refresh once on 401. */
  auth?: boolean
  /** Validated before the value is returned. Omit for 204. */
  schema?: ZodType<T>
}

function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: RequestOptions<T>,
): Promise<ApiResult<T>>
```

Responsibilities, in order: build `${API.baseUrl}${path}`; set `Content-Type` and `Accept`;
attach `Authorization: Bearer <accessToken>` when `auth`; apply an `AbortController` timeout
of `API.timeoutMs`; on 401 with `auth`, refresh once and replay (§5.5); parse the body;
validate against `schema`; return.

It **never throws** for an HTTP-level failure. Expected failure is a value, matching the
codebase's existing `Result<T>` discipline. It throws only on programmer error, such as a
missing `baseUrl` when `USE_HTTP_SERVICES` is true.

```ts
type ApiResult<T> =
  | { ok: true; status: number; value: T }
  | { ok: false; status: number | null; code: ApiErrorCode; message: string | null; requestId: string | null }
```

`status` is `null` when the request never reached the server (timeout, DNS, offline).

Eleven of the eighteen endpoints declare `Auth: Bearer access token`. Everything under
`/couples/*`, `/users/me/profile`, `/onboarding/complete` and `/auth/logout` is authenticated —
including `invitations/lookup`, which means partner-code entry requires a live session.

### 5.2 Error envelope — `src/services/api/errors.ts`

One envelope across every endpoint:

```json
{"error":{"code":"ERROR_CODE","message":"Human-readable message","details":{}},"requestId":"req_123456"}
```

Per D13, `error.code` is the only field branched on. It is matched against the published enum
in `ERROR_CODES.md`; `message` is for logs and `details` is ignored entirely.

Parsing is defensive, because a code-first rule only helps when there *is* a code. A 502 from a
load balancer arrives as HTML; a crashed process may return an empty body. Any body that isn't
a conforming envelope, or that carries a code outside the enum, falls back to the status:

| Status | Fallback `ApiErrorCode` |
|---|---|
| 400 | `INVALID_REQUEST` |
| 401 | `TOKEN_INVALID` |
| 403 | `EMAIL_NOT_VERIFIED` on `/auth/login`, else `INVITATION_NOT_OWNED` |
| 404 | `INVITATION_NOT_FOUND` |
| 409 | `PAIRING_CONFLICT` |
| 422 | `VALIDATION_ERROR` |
| 429 | `RATE_LIMITED` |
| 5xx | `INTERNAL_ERROR` |
| no response | `NETWORK` |
| body failed `schema` | `CONTRACT_VIOLATION` |

`requestId` is preserved on every failure and included in any log line, so a user-reported
problem is traceable in backend logs.

`CONTRACT_VIOLATION` is a transport-level code only. It never reaches a screen; each domain
mapper collapses it to `UNKNOWN` after logging. Domain error codes are the user-facing
vocabulary; transport codes are the diagnostic one.

### 5.3 Response validation — `src/services/api/schemas.ts`

`zod` is already a dependency. Every endpoint gets a schema derived from its contract example.
A response that fails validation becomes `CONTRACT_VIOLATION` rather than an `undefined` that
surfaces three screens later as a blank name.

This carries more weight under v2 than it did under v1: because `openapi.yaml` specifies no
response schemas (D2), these zod schemas are the *only* machine-checkable statement of what the
server must return. They are the contract test.

### 5.4 Tokens — `src/services/api/tokens.ts`

```ts
export type Tokens = { accessToken: string; refreshToken: string; expiresAt: number }

export type TokenStorage = {
  read: () => Promise<Tokens | null>
  write: (tokens: Tokens) => Promise<void>
  clear: () => Promise<void>
}
```

Two adapters:

- `secureTokenStorage` — `expo-secure-store` for the refresh token; access token and `expiresAt`
  held in a module-scoped variable, never written to disk (D4). On cold start the access token
  is absent, so the first authenticated call refreshes.
- `memoryTokenStorage` — injected in tests; no native dependency.

`expiresAt` is computed as `Date.now() + expiresIn * 1000` at the moment of receipt.

**Installing `expo-secure-store` requires a dev-client rebuild.** Call this out in the plan;
it is the one step that isn't pure JavaScript.

### 5.5 Refresh and rotation

`POST /auth/refresh` takes `{refreshToken}` and returns a **new pair** plus `expiresIn`. The old
refresh token is invalidated on success, so this is rotation, not renewal, and the ordering
matters (D11):

1. A 401 on an authenticated call suspends that call.
2. Concurrent 401s join the same in-flight refresh — single-flight, never N refreshes. This is
   not just efficiency: with rotation, two parallel refreshes would make the second one look
   like token reuse and trip the server's theft detection.
3. On success the new pair is written to storage **before** any suspended call is replayed. A
   crash between exchange and persist otherwise strands the client holding a dead token.
4. Each suspended call replays exactly once. A second 401 is terminal.

Failure handling is by code:

| `error.code` | Meaning | Client behaviour |
|---|---|---|
| `TOKEN_EXPIRED` | Refresh token aged out | Clear session, route to sign-in |
| `TOKEN_INVALID` | Malformed or unknown | Clear session, route to sign-in |
| `REFRESH_TOKEN_REVOKED` | Session ended server-side | Clear session, route to sign-in |
| `REFRESH_TOKEN_REUSED` | Server suspects theft | Clear session **immediately**, abandon all in-flight calls, route to sign-in |
| `RATE_LIMITED` / `INTERNAL_ERROR` | Transient | Fail the original call; keep the session |

The distinction in the last row matters: a 429 on refresh is not a reason to sign someone out.

`REFRESH_TOKEN_REUSED` and `REFRESH_TOKEN_REVOKED` never reach a screen. They belong to an
internal `RefreshErrorCode`, not to any domain union — no screen has a sensible message for
"your refresh token was replayed" beyond "please sign in again."

### 5.6 Sign-out

`POST /auth/logout` takes the bearer token *and* `{refreshToken}` in the body, and returns 204.
The client always clears local storage, whatever the server answers — a failed revocation must
not leave a user apparently signed in. A non-2xx is logged with its `requestId` and swallowed.

## 6. Session — `src/state/sessionStore.ts`

```ts
type SessionState = {
  status: 'anonymous' | 'authenticated'
  userId: string | null
  email: string | null
  emailVerified: boolean
  pairingStatus: PairingStatus | null   // 'NOT_PAIRED' | 'INVITATION_PENDING' | 'ACTIVE'
  /** Set at sign-up, before a session exists, so resend has an address to use. */
  pendingEmail: string | null

  signedIn: (session: AuthSession) => void
  signedUp: (email: string, userId: string) => void
  setPairingStatus: (status: PairingStatus) => void
  setEmailVerified: (verified: boolean) => void
  signedOut: () => void
}
```

Not persisted, matching `relationshipStore`. The only durable artefact is the refresh token in
the keychain. `pendingEmail` is what removes the `resendVerification({ email: '' })` placeholder
in `VerifyEmailScreen`.

`signedOut` is called both by the user signing out and by the transport on a terminal refresh
failure, so there is exactly one path that tears a session down.

## 7. Service interfaces

Today each domain declares its own `Result<T>` bound to its own error type. That duplication
grows with two more boundaries, so the generic moves to `src/services/api/types.ts`:

```ts
export type ApiResultShape<T, E> = { ok: true; value: T } | { ok: false; error: { code: E } }
```

Each domain keeps a one-line alias, so existing call sites and their `result.ok` /
`result.error.code` narrowing are untouched:

```ts
// services/auth/types.ts
export type Result<T> = ApiResultShape<T, AuthErrorCode>
```

**Notation:** the interfaces below are written `Result<T, XxxErrorCode>` so each signature names
its own error type on sight. In code they use the single-parameter domain alias — `Result<Session>`
in `services/auth`, and so on.

Every union below is a **subset of the published enum** (D5) plus exactly two client-only
members, `NETWORK` and `UNKNOWN`, which describe conditions no server can report.

### 7.1 `services/auth`

```ts
export type AuthErrorCode =
  // published enum
  | 'INVALID_REQUEST'         // 400
  | 'INVALID_EMAIL'           // 400 resend, forgot
  | 'INVALID_PROVIDER_TOKEN'  // 400 oauth
  | 'INVALID_CREDENTIALS'     // 401 login, oauth
  | 'TOKEN_INVALID'           // 401 verify-email, reset
  | 'TOKEN_EXPIRED'           // 401 verify-email, reset
  | 'EMAIL_NOT_VERIFIED'      // 403 login
  | 'EMAIL_ALREADY_EXISTS'    // 409 signup, and verify-email when already verified
  | 'ACCOUNT_CONFLICT'        // 409 oauth
  | 'WEAK_PASSWORD'           // 422 signup, reset
  | 'RATE_LIMITED'            // 429
  | 'INTERNAL_ERROR'          // 500
  // client-only
  | 'NETWORK' | 'UNKNOWN'

export type AuthUser = { id: string; email: string; emailVerified: boolean }

export type AuthSession = {
  tokens: Tokens
  user: AuthUser
  pairingStatus: PairingStatus
  /** OAuth only. */
  isNewUser?: boolean
}

export type SignUpOutcome = { userId: string; email: string; verificationRequired: boolean }

export type AuthService = {
  signUp: (input: Credentials) => Promise<Result<SignUpOutcome, AuthErrorCode>>
  signIn: (input: Credentials) => Promise<Result<AuthSession, AuthErrorCode>>
  verifyEmail: (input: { token: string }) => Promise<Result<{ userId: string }, AuthErrorCode>>
  resendVerification: (input: EmailOnly) => Promise<Result<null, AuthErrorCode>>
  requestPasswordReset: (input: EmailOnly) => Promise<Result<null, AuthErrorCode>>
  resetPassword: (input: { token: string; newPassword: string }) => Promise<Result<null, AuthErrorCode>>
  signInWithGoogle: (input: { idToken: string }) => Promise<Result<AuthSession, AuthErrorCode>>
  signInWithApple: (input: AppleCredentials) => Promise<Result<AuthSession, AuthErrorCode>>
  /** Always clears locally, whatever the server answers (§5.6). */
  signOut: () => Promise<void>
}
```

`requestPasswordReset` and `resendVerification` keep resolving `ok` for unknown addresses. The
contracts state this explicitly ("never reveal whether the account exists"); the existing mock
comment already defends it. Both remain 202-shaped: acknowledgement, not confirmation.

Two v2 quirks worth naming, because they will otherwise look like bugs:

- `EMAIL_ALREADY_EXISTS` is reused by `verify-email` for an already-verified address. Same code,
  two meanings, so the copy is resolved per screen rather than globally (§8).
- OAuth failure is plain `INVALID_CREDENTIALS` at 401; the provider-specific code
  (`INVALID_PROVIDER_TOKEN`) sits at 400. Reading it the other way round is the natural mistake.

`refresh` is deliberately absent from this interface. It is transport concern, driven by 401s
inside the client, never called by a screen.

### 7.2 `services/profile` (new)

```ts
export type ProfileErrorCode =
  | 'INVALID_REQUEST' | 'TOKEN_INVALID' | 'TOKEN_EXPIRED'
  | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  | 'NETWORK' | 'UNKNOWN'

export type Profile = {
  name: string
  nickname?: string
  /** `YYYY-MM-DD`. */
  birthday?: string
  pronouns?: string
  photoUri?: string        // wire: photoUrl
}

export type SavedProfile = Profile & { id: string; profileComplete: boolean }

export type ProfileService = {
  updateProfile: (input: Profile) => Promise<Result<SavedProfile, ProfileErrorCode>>
}
```

Moved off `pairingService`. `Profile` moves with it; `relationshipStore` updates its import.

### 7.3 `services/pairing`

```ts
export type PairingErrorCode =
  | 'INVALID_INVITATION_CODE'  // 400 lookup, connect
  | 'INVALID_EMAIL'            // 400 send
  | 'TOKEN_INVALID' | 'TOKEN_EXPIRED'   // 401
  | 'INVITATION_NOT_OWNED'     // 403 send, cancel, connect
  | 'INVITATION_NOT_FOUND'     // 404
  | 'INVITATION_EXPIRED'       // 409
  | 'INVITATION_ALREADY_USED'  // 409
  | 'ALREADY_PAIRED'           // 409
  | 'CANNOT_PAIR_WITH_SELF'    // 409 connect
  | 'PAIRING_CONFLICT'         // 409
  | 'VALIDATION_ERROR'         // 422 create
  | 'CONFIRMATION_REQUIRED'    // 422 connect
  | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  | 'NETWORK' | 'UNKNOWN'

export type InvitationStatus = 'PENDING' | 'SENT' | 'CONSUMED' | 'CANCELLED' | 'EXPIRED'
export type PairingStatus = 'NOT_PAIRED' | 'INVITATION_PENDING' | 'ACTIVE'

export type Invitation = {
  invitationId: string
  /** Six characters, no separator. The separator is display only. */
  code: string
  expiresAt: string
  status: InvitationStatus
  shareUrl?: string
}

export type Partner = { id: string; name: string; photoUri?: string }  // wire: displayName, photoUrl

export type InvitationLookup = {
  invitationId: string
  code: string
  status: InvitationStatus
  inviter: Partner
}

export type Couple = {
  coupleId: string
  status: 'ACTIVE'
  partners: { userId: string; name: string }[]
  uniqueCode: string
}

export type PairingSnapshot =
  | { status: 'NOT_PAIRED'; coupleId: null; pendingInvitation: null }
  | { status: 'INVITATION_PENDING'; coupleId: null; pendingInvitation: Invitation }
  | { status: 'ACTIVE'; coupleId: string; partner: Partner }

export type PairingService = {
  /** `delivery` has one legal value; email delivery goes through `sendInvite`. */
  createInvite: (input: { delivery: 'SHARE_CODE' }) => Promise<Result<Invitation, PairingErrorCode>>
  sendInvite: (input: { invitationId: string; email: string }) => Promise<Result<{ status: InvitationStatus }, PairingErrorCode>>
  /** Resolves the inviter behind a code without consuming it. */
  lookupCode: (input: { code: string }) => Promise<Result<InvitationLookup, PairingErrorCode>>
  /** Commits the relationship. */
  connectPartner: (input: { invitationCode: string; confirm: true }) => Promise<Result<Couple, PairingErrorCode>>
  /** Startup and reconnect only — v2 forbids polling. */
  getStatus: () => Promise<Result<PairingSnapshot, PairingErrorCode>>
  /** 204, so there is nothing to return. */
  cancelInvite: (input: { invitationId: string }) => Promise<Result<null, PairingErrorCode>>
}
```

Two renames, both because the old names now misdescribe the contract:

- `redeemCode` → `lookupCode`. `POST /couples/invitations/lookup` deliberately does not consume
  the invitation; "redeem" implied it did.
- `confirmPartner({ partnerId })` → `connectPartner({ invitationCode, confirm })`.
  `POST /couples/connections` keys on the invitation code. `partnerId` was never a contract concept.

`confirm` is typed as the literal `true`, so the 422 case is unreachable from the client.
`CONFIRMATION_REQUIRED` stays in the union for a server that disagrees.

### 7.4 `services/onboarding` (new)

```ts
export type OnboardingErrorCode =
  | 'INVALID_REQUEST' | 'TOKEN_INVALID' | 'TOKEN_EXPIRED'
  | 'PAIRING_CONFLICT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR'
  | 'NETWORK' | 'UNKNOWN'

export type OnboardingService = {
  complete: (input: { profileComplete: boolean; pairingStatus: PairingStatus })
    => Promise<Result<{ onboardingComplete: boolean; nextRoute: string }, OnboardingErrorCode>>
}
```

`nextRoute` is **advisory**. The client validates it against a known route allowlist and falls
back to `/(app)/home`. A server string is not permitted to drive navigation unchecked.

### 7.5 Realtime — `src/services/pairing/realtime.ts` (D12)

```ts
export type PairingStatusChanged = { status: PairingStatus; coupleId: string | null; partner?: Partner }

export type RealtimePort = {
  /** Returns an unsubscribe function. */
  onPairingStatusChanged: (handler: (event: PairingStatusChanged) => void) => () => void
  connect: () => Promise<void>
  disconnect: () => void
}
```

Shipped implementation is `createNoopRealtime()`: `connect` resolves, `onPairingStatusChanged`
registers nothing, `disconnect` is a no-op. The event's zod schema is written and tested now, so
adding a transport is one file plus one line in `index.ts`.

The contract's reconciliation rule — *"Client reconciles with `GET /couples/status` after
reconnect"* — is honoured today by calling `getStatus()` on startup, which is correct behaviour
whether or not a socket ever connects.

## 8. Error copy

Adopting the published enum gives unions of 8–17 members. Because screens index
`COPY.errors[result.error.code]` and the records are `as const`, every key would otherwise have
to appear in all six screen copy files.

Instead, `src/copy/errors.ts` holds one exhaustive `Record<Code, string>` per domain — the
compiler enforces completeness in exactly one place — and each screen's copy file keeps only
its bespoke overrides. Screens resolve through a helper:

```ts
export function authErrorMessage(code: AuthErrorCode, overrides?: Partial<Record<AuthErrorCode, string>>): string {
  return overrides?.[code] ?? AUTH_ERROR_COPY[code]
}
```

`SIGN_IN_COPY.errors` shrinks to the one message that is genuinely screen-specific
(`INVALID_CREDENTIALS`); the rest come from the shared map. Existing bespoke wording is preserved
as overrides, not discarded.

Two codes need per-screen overrides rather than a single global string:

- `EMAIL_ALREADY_EXISTS` — "that email is already registered" on sign-up, "this email is already
  verified — you can sign in" on verify-email.
- `TOKEN_INVALID` / `TOKEN_EXPIRED` — "this link has expired, request a new one" on
  verify-email and reset-password, but "your session ended, please sign in again" anywhere the
  code escapes the transport layer.

## 9. Screen changes

| Screen | Change |
|---|---|
| `SignInScreen` | Persist tokens, populate `sessionStore`, then route on real data (§9.1). |
| `CreateAccountScreen` | `signUp` returns no tokens; store `pendingEmail`; `verificationRequired` gates the push to verify-email. |
| `VerifyEmailScreen` | `resendVerification({ email })` reads `pendingEmail ?? email` from session. Placeholder removed. The "Continue" button stays user-asserted — token verification needs a deep link, which is out of scope. |
| `ForgotPasswordScreen` | No behaviour change; `RATE_LIMITED` and `INVALID_EMAIL` become distinguishable. Repeated taps are the common real-world 429. |
| `CreateProfileScreen` | Imports `profileService.updateProfile`; now an authenticated call. |
| `InvitePartnerScreen` | `createInvite({ delivery: 'SHARE_CODE' })`; stores the whole `Invitation`. |
| `InvitationSentScreen` | `cancelInvite({ invitationId })` — now 204, so success is simply `ok`. Shares `shareUrl` when the server supplies one, falling back to today's `COPY.shareMessage(code)`. |
| `EnterPartnerCodeScreen` | `lookupCode`; stores partner **and** `invitationId` / `invitationCode`. Requires a live session, since the endpoint is authenticated. |
| `ConnectingScreen` | `connectPartner({ invitationCode, confirm: true })`; stores `coupleId`. |
| `WelcomeHomeScreen` | Calls `onboardingService.complete()` before entering the app. It is the single crossing point into `(app)` — the only `router.replace('/(app)/home')` in the onboarding flow. A failure keeps the user on the screen with a retry rather than entering an app the server believes is unconfigured. |

### 9.1 Sign-in routing (D9)

Today's code pushes to verify-email unconditionally, with a comment explaining that branching on
`emailVerified` would push into `(app)`, "which has no routes yet." `(app)` now has `home` and
four `memories` routes, and `POST /auth/login` returns `emailVerified` and `pairingStatus`. The
deferral is therefore resolvable:

```
!emailVerified                → /(auth)/verify-email
pairingStatus !== 'ACTIVE'    → /(onboarding)/setup
otherwise                     → /(app)/home
```

`replace`, not `push`, in all three cases: a completed sign-in should not remain in the back stack.

## 10. State changes

`relationshipStore` gains what the contract requires the client to carry between steps:

```ts
invitation: Invitation | null      // the invite this user issued
invitationCode: string | null      // the code this user redeemed (needed by connectPartner)
coupleId: string | null
```

`setInvite(code)` becomes `setInvite(invitation)`. `setPartner(partner)` becomes
`setPartner(partner, invitationCode)` — today the code is discarded at
`EnterPartnerCodeScreen`, and `connectPartner` cannot work without it.

`Profile` is re-imported from `@/services/profile/types`.

## 11. Testing

### 11.1 Conformance suite (the central guarantee)

One file of assertions, executed twice — once against the mock, once against the HTTP
implementation with `fetch` stubbed to return **the exact JSON literals from the 18 contract
files**. The contract examples are the fixtures.

```ts
describe.each([
  ['mock', createMockAuthService({ latencyMs: 0 })],
  ['http', createHttpAuthService({ fetch: stubbedFetch, storage: memoryTokenStorage })],
])('%s auth service', (_name, auth) => { /* shared assertions */ })
```

This is what stops the mock drifting from the contract, and stops the client drifting from
either. Both implementations therefore accept their collaborators by injection.

### 11.2 Client unit tests

Timeout → `NETWORK`; offline → `NETWORK`; HTML error body → status-derived code; conforming
envelope → its code and `requestId`; a code outside the published enum → status fallback;
schema mismatch → `CONTRACT_VIOLATION`.

### 11.3 Refresh and rotation

The highest-risk area in the design, and the least visible when it breaks:

- A 401 triggers exactly one refresh, then one replay.
- Ten concurrent 401s trigger **one** refresh, not ten — the rotation-safety property in D11.
- The rotated pair is persisted before any replay is issued.
- `REFRESH_TOKEN_REUSED` clears the session immediately and abandons in-flight calls.
- `RATE_LIMITED` on refresh fails the original call but **keeps** the session.
- A second 401 after a successful refresh is terminal, not an infinite loop.
- Cold start with a refresh token but no access token refreshes before the first call.

### 11.4 Token storage

Round-trip, clear, and cold-start-with-no-access-token, all against `memoryTokenStorage`.

### 11.5 Realtime

The event schema parses the contract's example payload; the no-op port satisfies the interface;
`getStatus()` is called on startup.

### 11.6 Screen tests

The existing suites are updated for the new shapes. New assertions: resend sends the session
address rather than `''`; sign-in routes to each of the three destinations; connect uses the
redeemed code; cancel treats 204 as success.

TDD throughout, matching how the auth and pairing clusters were built.

## 12. Open questions for the backend team

v2 closed every question raised against v1. These are what remain.

1. **Realtime transport is unnamed.** `realtime-pairing.md` specifies an event and a payload but
   not a protocol — WebSocket, SSE, or a vendor SDK — nor a URL or an auth handshake. *Client
   behaviour:* the port ships as a no-op (D12) and `getStatus()` runs on startup.
2. **`openapi.yaml` specifies no response schemas.** All 18 paths type their requests; every
   response is a bare `description`. This blocks codegen (D2) and means the response shapes in
   the `.md` files are unverifiable against the spec.
3. **Three `openapi.yaml` / `.md` disagreements.** `verify-email` omits the 409 its `.md`
   documents; `/couples/connections` describes 403 only as "Forbidden" where the `.md` names
   `INVITATION_NOT_OWNED`; `AppleLoginRequest.name` is an untyped `object` where the `.md` shows
   `{firstName, lastName}`. *Client behaviour:* the `.md` files win.
4. **`EMAIL_ALREADY_EXISTS` is overloaded.** It means "that address is taken" on signup and
   "already verified" on verify-email. Handled with per-screen copy (§8); a distinct
   `EMAIL_ALREADY_VERIFIED` would be cleaner.
5. **`INVITATION_NOT_OWNED` at 403 on `/couples/connections`** reads oddly — the connecting user
   is by definition *not* the owner of the invitation. Possibly intended as "not valid for you".
   Worth confirming the semantics.
6. **No refresh-token TTL is published.** `expiresIn: 3600` covers the access token only, so the
   client cannot pre-emptively warn before a session dies; it discovers expiry by being refused.

## 13. File manifest

**New**

```
src/config/api.ts
src/services/api/client.ts
src/services/api/errors.ts
src/services/api/schemas.ts
src/services/api/tokens.ts
src/services/api/refresh.ts
src/services/api/types.ts
src/services/auth/http.ts
src/services/pairing/http.ts
src/services/pairing/realtime.ts
src/services/profile/{types,mock,http,index}.ts
src/services/onboarding/{types,mock,http,index}.ts
src/state/sessionStore.ts
src/copy/errors.ts
```

Plus `__tests__` for the client, refresh, tokens, realtime, and a conformance suite per service.

**Modified**

```
package.json                       (expo-secure-store)
src/services/auth/{types,mock,index}.ts
src/services/pairing/{types,mock,index}.ts
src/state/relationshipStore.ts
src/copy/{signIn,createAccount,verifyEmail,forgotPassword,createProfile,
          invitePartner,invitationSent,enterPartnerCode,connecting}.ts
10 screens (§9)
```

**Prerequisite:** the working tree has uncommitted changes to `homeDashboard.ts` and
`HomeDashboardScreen.tsx`, plus untracked `module-03-memories`, `services/memories`,
`app/(app)/memories/` and the `AppScreenLayout` pattern. These should be committed before a
refactor this wide lands on top of them.

**Also:** the repo holds both `LoveOS-Authentication-API-Contracts-v1/` and `-v2/`. v2 is the
source of truth; v1 should be deleted and v2 renamed to `api-contracts/`. The v1 rename was
blocked by a filesystem lock (a process holds open directory handles — files inside rename
fine, directories do not) and needs the holder closed first.

## 14. What changed from v1

The design was written against v1 and reviewed with the backend team; v2 answers all six
questions it raised. Recorded because the reasoning behind several decisions changed, not just
the values.

| v1 finding | v2 resolution | Design impact |
|---|---|---|
| No refresh endpoint | `POST /auth/refresh`, with rotation | D8 reversed: real single-flight refresh. New §5.5 and D11 — rotation makes single-flight a correctness requirement, not an optimisation |
| No logout endpoint | `POST /auth/logout` (204) | New `signOut` (§5.6, §7.1) |
| `error.code` values unspecified | `ERROR_CODES.md`, 24 codes | D5 rewritten: the enum is adopted verbatim, so the mapping is the identity function. Every union in §7 changed |
| Self-pairing indistinguishable | Explicit `CANNOT_PAIR_WITH_SELF` | The `details`-sniffing workaround is deleted; D13 now forbids reading `details` at all |
| `openapi.yaml` was a stub | Full 18-path spec, requests typed | D2 **unchanged** — responses are still unspecified, so codegen remains unviable. New open question §12.2 |
| No realtime channel | `couple:pairing-status-changed` | D12: port defined, transport deferred (§7.5). Polling moves from "not needed" to "explicitly forbidden" |

Corrections v2 forced that were not gaps in v1, but errors in the design's assumptions:

- `delivery` is `enum: [SHARE_CODE]` — a single-member union, not `SHARE_CODE | EMAIL`.
- `DELETE /couples/invitations/{id}` is **204**, not 200 with a body, so `cancelInvite` returns `null`.
- The 500 code is `INTERNAL_ERROR`, not `SERVER_ERROR`.
- There is no `UNAUTHENTICATED`; 401 is `TOKEN_INVALID` / `TOKEN_EXPIRED` everywhere.
- Invitation errors are `INVITATION_EXPIRED` / `INVITATION_ALREADY_USED`, not `CODE_*`.
- OAuth 401 is `INVALID_CREDENTIALS`; `INVALID_PROVIDER_TOKEN` is a 400.
- `ALREADY_VERIFIED`, `INVITATION_PENDING` and `INVALID_DELIVERY` do not exist; the first is
  `EMAIL_ALREADY_EXISTS`, the other two are `PAIRING_CONFLICT` and `VALIDATION_ERROR`.
