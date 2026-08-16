# API Contract Integration — Design

Date: 2026-08-16
Status: Approved, ready for planning
Source contracts: `LoveOS-Authentication-API-Contracts-v1/` — 16 endpoint files, `schemas/common.md`,
`README.md`. To be renamed `api-contracts/`; see §13.

## 1. Why

The app has four service boundaries (`auth`, `pairing`, `story`, `memories`), each a typed
interface backed by an in-memory mock, each with a documented one-line swap point in its
`index.ts`. Those boundaries were built deliberately so that a real provider could be dropped
in without touching a screen.

A backend contract now exists for authentication, profile, pairing and onboarding — 16
endpoints against `https://api.loveos.app/api/v1`. No server implements it yet. This design
makes the client speak that contract exactly, while keeping the mocks as the default so the
app continues to run and every existing test stays green.

The measure of success is that standing up the server requires setting one environment
variable and nothing else.

## 2. Scope

### In

- A typed HTTP transport with response validation, error-envelope parsing and token attachment.
- Token persistence (`expo-secure-store`) and a session store.
- All 16 contract endpoints implemented across four service boundaries.
- Contract-faithful error taxonomies and the copy to render them.
- Rewiring the ten existing screens onto the new shapes.

### Out

- **New screens.** Five endpoints have no UI to drive them (`verify-email` by token,
  `password/reset` by token, both OAuth routes, `invitations/{id}/send`). They are implemented,
  typed and tested, but left uncalled. Inventing screens without Figma is out of bounds.
- **`GET /couples/status` polling.** The method is implemented; no screen polls it yet.
- **`@tanstack/react-query`.** Installed but unused. Adopting it is a separate migration
  touching every screen; the current `async`/`await` + `Result<T>` pattern is coherent and tested.
- **`openapi.yaml`.** The supplied file is a stub (`paths: {}`). The 16 markdown files remain
  the source of truth. Authoring the full spec is deferred; no codegen.
- **The `story`, `memories` and `home` services.** No contracts cover them.

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Mocks stay the default; HTTP activates on `EXPO_PUBLIC_API_URL` | No server exists. Zero-config today, one variable tomorrow. |
| D2 | Hand-written client, not OpenAPI codegen | The supplied spec has no paths; authoring it creates a second source of truth to keep in sync with the `.md` files, and generated clients don't speak `Result<T>`. |
| D3 | Install `expo-secure-store` | The refresh token is a persistent credential. Reverses the earlier "no provider, so no storage" note in `relationshipStore.ts`, which that note anticipated. |
| D4 | Access token in memory, refresh token in keychain | At `expiresIn: 3600` persisting the access token buys little and widens exposure. |
| D5 | Full contract fidelity in error codes | Users get "that password is too weak", not "something went wrong". |
| D6 | Four service boundaries, not two | `PUT /users/me/profile` is a user resource; `POST /onboarding/complete` is neither user nor couple. |
| D7 | Wire vocabulary stops at the boundary | The app keeps `name`/`photoUri`; the contract's `displayName`/`photoUrl` are mapped in the HTTP implementation. `photoUri` matches React Native's `source={{ uri }}`. |
| D8 | Refresh fails closed | The contracts define no refresh endpoint (see §11). A 401 that cannot be refreshed clears the session and routes to sign-in. |
| D9 | Sign-in routes on real `emailVerified` / `pairingStatus` | The existing unconditional push to verify-email is commented as deferred because `(app)` had no routes. It now has five. |
| D10 | Shared error copy with per-screen overrides | Widening the unions would otherwise force ~15 keys into each of six copy files. |

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
of `API.timeoutMs`; on 401 with `auth`, attempt refresh once and replay; parse the body;
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

### 5.2 Error envelope — `src/services/api/errors.ts`

The contracts define one envelope:

```json
{"error":{"code":"ERROR_CODE","message":"Human-readable message","details":{}},"requestId":"req_123"}
```

Parsing is defensive. A 502 from a load balancer arrives as HTML; a crashed process may return
an empty body. Any body that isn't a conforming envelope falls back to a status-derived code:

| Status | Fallback `ApiErrorCode` |
|---|---|
| 400 | `BAD_REQUEST` |
| 401 | `UNAUTHENTICATED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 422 | `UNPROCESSABLE` |
| 429 | `RATE_LIMITED` |
| 5xx | `SERVER_ERROR` |
| no response | `NETWORK` |
| body failed `schema` | `CONTRACT_VIOLATION` |

`requestId` is preserved on every failure and included in any log line, so a user-reported
problem is traceable in backend logs.

`CONTRACT_VIOLATION` is a transport-level code only. It never reaches a screen; each domain
mapper collapses it to that domain's `UNKNOWN` after logging. Domain error codes are the
user-facing vocabulary; transport codes are the diagnostic one.

### 5.3 Response validation — `src/services/api/schemas.ts`

`zod` is already a dependency. Every endpoint gets a schema derived from its contract example.
A response that fails validation becomes `CONTRACT_VIOLATION` rather than an `undefined` that
surfaces three screens later as a blank name. This is the mechanism that makes the integration
verifiable rather than hopeful.

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

### 5.5 Refresh

Single-flight: concurrent 401s share one in-flight refresh rather than firing N of them.
Behind a port:

```ts
type RefreshPort = (refreshToken: string) => Promise<ApiResult<Tokens>>
```

Per D8 the shipped implementation returns `NOT_IMPLEMENTED` because no contract defines the
endpoint (§11). The consequence is explicit: a 401 on an authenticated call clears the session
and routes to sign-in. The seam is marked so that adding the endpoint is a one-function change.

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

### 7.1 `services/auth`

```ts
export type AuthErrorCode =
  | 'INVALID_REQUEST'        // 400
  | 'INVALID_CREDENTIALS'    // 401 login
  | 'EMAIL_NOT_VERIFIED'     // 403 login
  | 'EMAIL_ALREADY_EXISTS'   // 409 signup
  | 'WEAK_PASSWORD'          // 422 signup, reset
  | 'TOKEN_INVALID'          // 401 verify-email, reset
  | 'TOKEN_EXPIRED'          // 401 where details identify expiry
  | 'ALREADY_VERIFIED'       // 409 verify-email
  | 'PROVIDER_FAILED'        // 401 oauth
  | 'ACCOUNT_CONFLICT'       // 409 oauth
  | 'RATE_LIMITED'           // 429
  | 'UNAUTHENTICATED'        // 401 on an authenticated route
  | 'SERVER_ERROR'           // 5xx
  | 'NETWORK'
  | 'UNKNOWN'

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
}
```

`requestPasswordReset` and `resendVerification` keep resolving `ok` for unknown addresses. The
contracts state this explicitly ("never reveal whether an email exists"); the existing mock
comment already defends it. Both remain 202-shaped: acknowledgement, not confirmation.

`EMAIL_TAKEN` is renamed to `EMAIL_ALREADY_EXISTS` to match the contract's own vocabulary, so
the mapping table is the identity function wherever it can be.

### 7.2 `services/profile` (new)

```ts
export type ProfileErrorCode =
  | 'INVALID_REQUEST' | 'VALIDATION_FAILED' | 'UNAUTHENTICATED'
  | 'RATE_LIMITED' | 'SERVER_ERROR' | 'NETWORK' | 'UNKNOWN'

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
  | 'INVALID_REQUEST'         // 400
  | 'CODE_INVALID'            // 400 bad format, 404 not found
  | 'CODE_EXPIRED'            // 409 expired
  | 'CODE_ALREADY_USED'       // 409 used or consumed
  | 'CANNOT_PAIR_WITH_SELF'   // 409 where details identify self-pairing (§11)
  | 'ALREADY_PAIRED'          // 409 create-invite, connections
  | 'INVITATION_PENDING'      // 409 create-invite with one outstanding
  | 'INVITATION_NOT_FOUND'    // 404
  | 'INVITATION_NOT_VALID'    // 403 connections
  | 'NOT_OWNER'               // 403 send, cancel
  | 'CONFIRM_REQUIRED'        // 422 connections
  | 'INVALID_DELIVERY'        // 422 create-invite
  | 'RATE_LIMITED' | 'UNAUTHENTICATED' | 'SERVER_ERROR' | 'NETWORK' | 'UNKNOWN'

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
  createInvite: (input: { delivery: 'SHARE_CODE' | 'EMAIL' }) => Promise<Result<Invitation, PairingErrorCode>>
  sendInvite: (input: { invitationId: string; email: string }) => Promise<Result<{ status: InvitationStatus }, PairingErrorCode>>
  /** Resolves the inviter behind a code without consuming it. */
  lookupCode: (input: { code: string }) => Promise<Result<InvitationLookup, PairingErrorCode>>
  /** Commits the relationship. */
  connectPartner: (input: { invitationCode: string; confirm: true }) => Promise<Result<Couple, PairingErrorCode>>
  getStatus: () => Promise<Result<PairingSnapshot, PairingErrorCode>>
  cancelInvite: (input: { invitationId: string }) => Promise<Result<{ status: InvitationStatus }, PairingErrorCode>>
}
```

Two renames, both because the old names now misdescribe the contract:

- `redeemCode` → `lookupCode`. `POST /couples/invitations/lookup` deliberately does not consume
  the invitation; "redeem" implied it did.
- `confirmPartner({ partnerId })` → `connectPartner({ invitationCode, confirm })`.
  `POST /couples/connections` keys on the invitation code. `partnerId` was never a contract concept.

`confirm` is typed as the literal `true`, so the 422 "confirm must be true" case is unreachable
from the client. `CONFIRM_REQUIRED` remains in the union for a server that disagrees.

### 7.4 `services/onboarding` (new)

```ts
export type OnboardingErrorCode =
  | 'INVALID_STATE'        // 400
  | 'INCONSISTENT_STATE'   // 409
  | 'SETUP_INCOMPLETE'     // 422
  | 'UNAUTHENTICATED' | 'SERVER_ERROR' | 'NETWORK' | 'UNKNOWN'

export type OnboardingService = {
  complete: (input: { profileComplete: boolean; pairingStatus: PairingStatus })
    => Promise<Result<{ onboardingComplete: boolean; nextRoute: string }, OnboardingErrorCode>>
}
```

`nextRoute` is **advisory**. The client validates it against a known route allowlist and falls
back to `/(app)/home`. A server string is not permitted to drive navigation unchecked.

## 8. Error copy

Widening the unions to 15–17 members would force every key into all six screen copy files,
because screens index `COPY.errors[result.error.code]` and the records are `as const`.

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

## 9. Screen changes

| Screen | Change |
|---|---|
| `SignInScreen` | Persist tokens, populate `sessionStore`, then route on real data (below). |
| `CreateAccountScreen` | `signUp` returns no tokens; store `pendingEmail`; `verificationRequired` gates the push to verify-email. |
| `VerifyEmailScreen` | `resendVerification({ email })` reads `pendingEmail ?? email` from session. Placeholder removed. The "Continue" button stays user-asserted — token verification needs a deep link, which is out of scope. |
| `ForgotPasswordScreen` | No behaviour change; `RATE_LIMITED` becomes distinguishable, which matters here because repeated taps are the common real-world 429. |
| `CreateProfileScreen` | Imports `profileService.updateProfile`; now an authenticated call. |
| `InvitePartnerScreen` | `createInvite({ delivery: 'SHARE_CODE' })`; stores the whole `Invitation`. |
| `InvitationSentScreen` | `cancelInvite({ invitationId })`; shares `shareUrl` when the server supplies one, falling back to today's `COPY.shareMessage(code)`. |
| `EnterPartnerCodeScreen` | `lookupCode`; stores partner **and** `invitationId` / `invitationCode`. |
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

## 11. Open questions for the backend team

These are gaps in the contract, not in this design. Each has a defined client behaviour so the
work is not blocked.

1. **No token refresh endpoint.** `POST /auth/login`, `/auth/oauth/google` and `/auth/oauth/apple`
   all return a `refreshToken`, but no endpoint exchanges it. *Client behaviour until resolved:*
   refresh fails closed; a 401 clears the session and routes to sign-in, meaning users are
   signed out after `expiresIn` (one hour). This needs answering before any real deployment.
2. **No sign-out endpoint.** Nothing revokes a refresh token server-side. *Client behaviour:*
   sign-out clears local storage only.
3. **Self-pairing is not distinguishable.** `POST /couples/connections` returns a generic 409
   for it. *Client behaviour:* the HTTP mapper looks for a self-pairing marker in
   `error.details` and falls back to `ALREADY_PAIRED`. A dedicated code would be better.
4. **`error.code` values are unspecified.** The envelope defines the shape but only two literal
   codes appear anywhere (`EMAIL_ALREADY_EXISTS`, `WEAK_PASSWORD`). *Client behaviour:* map on
   HTTP status first, refine by `error.code` when it matches a known string. A published enum
   would let the mapping be exact.
5. **`openapi.yaml` is a stub** with `paths: {}`, so it cannot be used for codegen or validation.
6. **`GET /couples/status` has no realtime channel.** Reaching `ACTIVE` requires the partner to
   act. Polling is the only option available and no screen does it yet.

## 12. Testing

### 12.1 Conformance suite (the central guarantee)

One file of assertions, executed twice — once against the mock, once against the HTTP
implementation with `fetch` stubbed to return **the exact JSON literals from the 16 contract
files**. The contract examples are the fixtures.

```ts
describe.each([
  ['mock', createMockAuthService({ latencyMs: 0 })],
  ['http', createHttpAuthService({ fetch: stubbedFetch, storage: memoryTokenStorage })],
])('%s auth service', (_name, auth) => { /* shared assertions */ })
```

This is what stops the mock drifting from the contract, and stops the client drifting from
either. Both implementations therefore accept their collaborators by injection.

### 12.2 Client unit tests

Timeout → `NETWORK`; offline → `NETWORK`; HTML error body → status-derived code; conforming
envelope → its code and `requestId`; schema mismatch → `CONTRACT_VIOLATION`; 401 with `auth`
→ one refresh attempt, then sign-out; concurrent 401s → exactly one refresh call.

### 12.3 Token storage

Round-trip, clear, and cold-start-with-no-access-token, all against `memoryTokenStorage`.

### 12.4 Screen tests

The existing suites are updated for the new shapes. New assertions: resend sends the session
address rather than `''`; sign-in routes to each of the three destinations; connect uses the
redeemed code.

TDD throughout, matching how the auth and pairing clusters were built.

## 13. File manifest

**New**

```
src/config/api.ts
src/services/api/client.ts
src/services/api/errors.ts
src/services/api/schemas.ts
src/services/api/tokens.ts
src/services/api/types.ts
src/services/auth/http.ts
src/services/pairing/http.ts
src/services/profile/{types,mock,http,index}.ts
src/services/onboarding/{types,mock,http,index}.ts
src/state/sessionStore.ts
src/copy/errors.ts
```

Plus `__tests__` for the client, tokens, and a conformance suite per service.

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

**Also:** rename `LoveOS-Authentication-API-Contracts-v1/` to `api-contracts/`. This is blocked
by a filesystem lock (a process holds open directory handles; files inside rename fine,
directories do not) and needs the holder closed first.
