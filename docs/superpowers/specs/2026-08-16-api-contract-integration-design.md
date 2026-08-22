# Authentication Integration — Design

Date: 2026-08-16
Status: Approved, ready for planning
Contract: **v3** (`LoveOS-Signin-Signup-API-Contracts-v3/`) — 13 endpoints, OpenAPI 3.0.3 v3.0.0,
`schemas/{COMMON,ERROR_CODES,RATE_LIMITING,SESSIONS,VALIDATION}.md`, `tests/CONTRACT_TEST_CASES.md`.

Open blockers are tracked separately in
[`2026-08-16-v3-contract-blockers.md`](./2026-08-16-v3-contract-blockers.md). This design covers
only what is unblocked.

**Superseded scope.** v3 is authentication-only. The couples, profile and onboarding integration
designed against contracts v2 is held pending blocker B8 and is not part of this work; that
design is preserved at commit `ceb1731`.

## 1. Why

The app has four service boundaries (`auth`, `pairing`, `story`, `memories`), each a typed
interface backed by an in-memory mock, each with a documented one-line swap point in its
`index.ts`. Those boundaries were built deliberately so that a real provider could be dropped
in without touching a screen.

v3 is a developer-ready authentication contract: 13 endpoints, a canonical 18-code error enum,
a published session model, and an OpenAPI document that — unlike v1 and v2 — specifies every
response schema. This design makes the client speak it exactly, while keeping the mocks as the
default so the app continues to run and every existing test stays green.

The measure of success is that standing up the server requires setting one environment variable
and nothing else.

## 2. Scope

Against the twelve integration goals:

| # | Goal | Status |
|---|---|---|
| 1 | Email signup | **In** — including the password-policy correction (§8) |
| 2 | Email login | **In** — including post-login routing (§10.1) |
| 3 | Email verification | **In** at the service layer; unreachable by a user until B4 |
| 4 | Resend verification | **In**, fully wired |
| 5 | Google login | **In** at the service layer; button stays inert (B7) |
| 6 | Apple login | **In** at the service layer; button stays inert (B7) |
| 7 | Forgot password | **In**, fully wired |
| 8 | Reset password | **Deferred** — no screen, awaiting Figma (B5) |
| 9 | Refresh access token | **In** — the core of §6 |
| 10 | Logout | **Deferred** — no entry point, awaiting Figma (B6) |
| 11 | Session validation | **In** — `GET /auth/session` on startup |
| 12 | Provider link/unlink | **Blocked** — B1 and B2 |

### Also out

- **Any UI or UX change**, except the password checklist text, which is a correctness fix the
  contract forces and which you approved explicitly (§8).
- **OpenAPI codegen.** See D2.
- **`@tanstack/react-query`.** Installed but unused. The brief asks for `useAuth()` / `useLogin()`
  hooks, which §9 provides directly; adopting react-query is a separate migration touching every
  screen.
- **The `story`, `memories` and `home` services.** No contract covers them.

### A note on goals 8 and 10

Deferring these leaves two thin gaps in "API functions matching OpenAPI endpoints exactly": there
will be no `resetPassword` and no `authApi.logout`. Both are perhaps twenty lines plus tests once
designs land. One piece of `/auth/logout` is *not* deferred: the local session teardown it would
trigger is needed anyway by terminal refresh failure (§6), so `sessionStore.signedOut()` and
`tokenStorage.clear()` ship now and are tested now. Only the network call and the button are
waiting.

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Mocks stay the default; HTTP activates on `EXPO_PUBLIC_API_URL` | No server exists. Zero-config today, one variable tomorrow. |
| D2 | Hand-written types and zod schemas, not codegen | v3 finally specifies every response, so codegen became viable — but generated types are erased at runtime and this design's core guarantee is *runtime* validation of server responses. One hand-written zod schema per endpoint yields the type via `z.infer` **and** the check, from a single declaration. Adding a codegen toolchain to produce the half that doesn't validate is not worth the build step. |
| D3 | `expo-secure-store`, never `AsyncStorage` | Mandated by the brief. Refresh token to the keychain. |
| D4 | Access token in memory, refresh token in keychain | At `expiresIn: 3600` persisting the access token buys little and widens exposure. |
| D5 | Adopt the canonical error enum verbatim | `ERROR_CODES.md` defines 18 codes and says *"do not create new codes ad hoc"*. Using them as the app's own codes makes the mapping the identity function. |
| D6 | Map the brief's module layout onto the repo's conventions | §4. |
| D7 | Wire vocabulary stops at the boundary | The app keeps its own field names; mapping happens in the HTTP implementation. |
| D8 | Single-flight refresh with rotation | Mandated by the brief and by `SESSIONS.md`. Rotation makes single-flight a correctness requirement, not an optimisation (§6). |
| D9 | The password checklist changes to match the contract | §8. The one approved UI text change. |
| D10 | Shared error copy with per-screen overrides | 18 codes would otherwise force every key into all six copy files. |
| D11 | `REFRESH_TOKEN_REUSED` is fatal and immediate | The server has detected a replayed token and may revoke the whole family. Clear everything at once. |
| D12 | Branch on `error.code`, never `message` or `details` | Mandated by the brief and by `COMMON.md`: *"the message is display-safe but not a stable contract"*. |
| D13 | Nothing sensitive is ever logged | §7. Passwords, tokens and provider tokens never reach a log line, in any build. |

## 4. Where the code goes

The brief proposes `src/api/`, `src/auth/`, `src/navigation/`, `src/screens/`. The repo already
has established homes for every one of those responsibilities, and `expo-router` *requires*
routes to live in `src/app/`, so a `src/navigation/` folder would be dead weight. Per D6 the
responsibilities are kept exactly as briefed and placed in the existing structure:

| Brief | This repo | Why |
|---|---|---|
| `api/client` | `src/services/api/` | Sits beside the boundaries it serves |
| `api/auth` | `src/services/auth/api.ts` | Thin per-endpoint functions, one per OpenAPI path |
| `auth/types` | `src/services/auth/types.ts` | Existing file, extended |
| `auth/services` | `src/services/auth/{http,mock,index}.ts` | The existing mock/http/index swap pattern |
| `auth/storage` | `src/services/api/tokens.ts` | Token storage is transport-level, shared |
| `auth/state` | `src/state/sessionStore.ts` | Beside `relationshipStore`, matching its conventions |
| `auth/hooks` | `src/modules/module-00-auth/hooks/` | Where module hooks already live |
| `auth/validation` | `src/modules/module-00-auth/state/authSchemas.ts` | Existing file, corrected per §8 |
| `navigation` | `src/app/(auth)/…` | expo-router owns routing; unchanged |
| `screens` | `src/modules/module-00-auth/screens/` | Existing screens, unchanged in appearance |

The two-layer split the brief asks for is preserved: `api.ts` holds dumb, contract-exact request
functions returning `ApiResult`; `http.ts` holds the business logic that maps them into the
domain's `Result<T>` and drives the session store. A reader can diff `api.ts` against the
OpenAPI line by line, which is the point of keeping it separate.

## 5. Transport

### 5.1 Configuration — `src/config/api.ts`

```ts
export const API = {
  /** Absent in every environment until a server exists. */
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
  timeoutMs: 15_000,
} as const

export const USE_HTTP_SERVICES = API.baseUrl !== null
```

`index.ts` becomes `USE_HTTP_SERVICES ? createHttpAuthService() : createMockAuthService()`.

### 5.2 The client — `src/services/api/client.ts`

```ts
type RequestOptions<T> = {
  body?: unknown
  auth?: boolean            // attach bearer; refresh once on 401
  schema?: ZodType<T>       // omit for 204
  idempotencyKey?: string
}

function request<T>(method: HttpMethod, path: string, options?: RequestOptions<T>): Promise<ApiResult<T>>
```

Order of work: build `${API.baseUrl}${path}`; set `Content-Type` and `Accept`; add
`Idempotency-Key` when supplied; attach `Authorization: Bearer <accessToken>` when `auth`; apply
an `AbortController` timeout; on 401 with `auth`, refresh once and replay (§6); parse; validate;
return.

It **never throws** on an HTTP-level failure — expected failure is a value, matching the
codebase's existing `Result<T>` discipline. It throws only on programmer error, such as a missing
`baseUrl` when `USE_HTTP_SERVICES` is true.

```ts
type ApiResult<T> =
  | { ok: true; status: number; value: T; requestId: string | null }
  | { ok: false; status: number | null; code: ApiErrorCode
      message: string | null; requestId: string | null; retryAfterSeconds: number | null }
```

`status` is `null` when the request never reached the server. `retryAfterSeconds` is parsed from
the `Retry-After` header on 429 per `RATE_LIMITING.md`, supporting both the delta-seconds and
HTTP-date forms, and is `null` when the header is absent — the contract only promises it *"when
possible"*.

`requestId` is captured on success as well as failure: v3 returns it in every body except 204.

Only four of the thirteen endpoints are authenticated: `logout`, `session`,
`providers/{p}/link` and `providers/{p}`. Of those, exactly one ships here — `GET /auth/session`,
which is therefore the sole exerciser of the bearer header and of the whole 401-refresh-replay
path in §6. `logout` is deferred (B6) and the two provider endpoints are blocked (B1, B2).

Notably `/auth/refresh` is *not* authenticated: it carries the refresh token in the body, not a
bearer header.

### 5.3 Error envelope — `src/services/api/errors.ts`

```json
{"error":{"code":"INVALID_CREDENTIALS","message":"…","details":{}},"requestId":"req_01HXYZ"}
```

Per D12 only `error.code` is branched on, matched against the canonical enum. `message` goes to
logs; `details` is ignored entirely.

Parsing is defensive, because a code-first rule only helps when a code arrives. A 502 from a load
balancer is HTML; a crashed process may send nothing. Any body that is not a conforming envelope,
or that carries a code outside the enum, falls back to the status:

| Status | Fallback |
|---|---|
| 400 | `INVALID_REQUEST` |
| 401 | `TOKEN_INVALID` |
| 403 | `EMAIL_NOT_VERIFIED` |
| 409 | `ACCOUNT_CONFLICT` |
| 422 | `VALIDATION_ERROR` |
| 429 | `RATE_LIMITED` |
| 5xx | `INTERNAL_ERROR` |
| no response | `NETWORK` |
| failed `schema` | `CONTRACT_VIOLATION` |

`NETWORK`, `UNKNOWN` and `CONTRACT_VIOLATION` are the only client-invented codes, and they
describe conditions no server can report — they are not new *server* codes, so `ERROR_CODES.md`'s
prohibition is respected. `CONTRACT_VIOLATION` never reaches a screen; it collapses to `UNKNOWN`
after logging.

### 5.4 Response validation — `src/services/api/schemas.ts`

One zod schema per response, derived from the OpenAPI component schemas and cross-checked against
the endpoint Markdown examples. Types come from `z.infer`, so there is exactly one declaration per
shape (D2).

The nine schemas mirror v3's components: `SignupResponse`, `VerifyResponse`, `MessageResponse`,
`AuthResponse`, `RefreshResponse`, `SessionResponse`, `LinkResponse`, `Error`, and a shared `User`.

Two deliberate deviations from the OpenAPI, both following the endpoint Markdown, both recorded
in the blockers document: `SessionResponse.user` and `.session` declare no `required` array in the
spec, so a literal reading makes every field optional; `11-session-status.md` shows them all
present, and the client requires them.

### 5.5 Token storage — `src/services/api/tokens.ts`

```ts
export type Tokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number         // Date.now() + expiresIn * 1000
  refreshExpiresAt: number  // Date.now() + refreshExpiresIn * 1000
}

export type TokenStorage = {
  read: () => Promise<Tokens | null>
  write: (tokens: Tokens) => Promise<void>
  clear: () => Promise<void>
}
```

`secureTokenStorage` keeps the refresh token and `refreshExpiresAt` in `expo-secure-store`, and
the access token plus `expiresAt` in a module-scoped variable that never touches disk (D4). On
cold start there is no access token, so the first authenticated call refreshes.
`memoryTokenStorage` is injected in tests and needs no native module.

`refreshExpiresAt` is new in v3 and worth storing: it lets the client know a session is
unrecoverable *before* spending a request to find out.

**Installing `expo-secure-store` requires a dev-client rebuild** — the one step in this work that
is not pure JavaScript. `expo-crypto` is needed too, for `Idempotency-Key` (§5.6).

### 5.6 Idempotency

`01-signup.md` recommends `Idempotency-Key` on signup; `VALIDATION.md` describes the general
mechanism. Only signup carries one. The key is a v4 UUID from `expo-crypto`, generated once per
distinct submission and **reused across retries of that submission** — which is the entire point,
and which the contract tests check both ways: same key and same body returns the original result,
same key with a changed body returns `400 INVALID_REQUEST`. Editing the form after a failure
therefore mints a new key.

## 6. Refresh and rotation

`POST /auth/refresh` takes `{refreshToken}` and returns a **new pair**. `SESSIONS.md`: rotation is
mandatory, the previous token dies immediately, and reuse detection may revoke the whole family.

1. A 401 on an authenticated call suspends that call.
2. Concurrent 401s join one in-flight refresh. This is a correctness requirement, not an
   optimisation: with rotation, a second parallel refresh presents an already-rotated token and
   looks exactly like theft, tripping `REFRESH_TOKEN_REUSED` and destroying a healthy session.
3. On success the new pair is persisted **before** any suspended call is replayed. A crash between
   exchange and persist otherwise strands the client holding a dead token.
4. Each suspended call replays exactly once. A second 401 is terminal.

`SESSIONS.md` also asks clients to *"refresh before expiry rather than wait for a 401 where
practical"*. So an authenticated request whose stored `expiresAt` is already past — or within a
30-second skew margin — refreshes first rather than spending a round trip to be refused. The
reactive 401 path stays as the backstop for clock skew and server-side revocation.

Failure handling is by code:

| Code | Client behaviour |
|---|---|
| `REFRESH_TOKEN_REUSED` | Clear storage and session **immediately**, abandon every in-flight call, route to sign-in |
| `REFRESH_TOKEN_REVOKED` | Clear, route to sign-in |
| `REFRESH_TOKEN_EXPIRED` | Clear, route to sign-in |
| `REFRESH_TOKEN_INVALID` | Clear, route to sign-in |
| `RATE_LIMITED` | Fail the original call, honour `Retry-After`, **keep the session** |
| `INTERNAL_ERROR` / `NETWORK` | Fail the original call, **keep the session** |

The last two rows matter: a 429 or a dropped connection on refresh is not a reason to sign
someone out. Only the four `REFRESH_TOKEN_*` codes end a session.

These four never reach a screen. They live in an internal `RefreshErrorCode`, not in any domain
union — no screen has a sensible message for "your refresh token was replayed" beyond "please
sign in again."

## 7. Logging and redaction

Per D13 and the brief. A single `src/services/api/log.ts` is the only place the transport logs,
and it takes structured fields rather than free text. It records method, path, status,
`requestId`, `error.code` and duration — never a request or response body.

Field names on a deny-list (`password`, `newPassword`, `accessToken`, `refreshToken`, `idToken`,
`identityToken`, `authorizationCode`, `token`) are replaced with `'[redacted]'` if any caller
passes them, so the guarantee survives a future careless edit rather than depending on discipline.
A unit test asserts each one.

## 8. Password policy — the one approved UI change

`VALIDATION.md` and the OpenAPI both state: **8–128 characters, at least one letter and one
number.** The shipped `PASSWORD_RULES` say 8+ characters, one number, one **special character** —
no letter rule and no maximum. Three real divergences:

| Password | Today | Contract |
|---|---|---|
| `hunter22` | rejected — no special character | valid; the UI blocks a password the server accepts |
| `12345678!` | accepted — no letter rule | invalid; 422 `WEAK_PASSWORD` after submit |
| 200 characters | accepted — no maximum | invalid; 422 `WEAK_PASSWORD` after submit |

The contract wins. `PASSWORD_RULES` becomes:

```ts
export const PASSWORD_RULES = [
  { id: 'length',  label: '8–128 characters', test: (v) => v.length >= 8 && v.length <= 128 },
  { id: 'letter',  label: 'One letter',       test: (v) => /[A-Za-z]/.test(v) },
  { id: 'number',  label: 'One number',       test: (v) => /\d/.test(v) },
] as const
```

The structure is untouched: still three rules, still one list feeding both the live checklist and
the submit schema, so the two still cannot disagree. Only the labels and predicates change. The
`PasswordRequirements` component and its layout are not modified at all.

Client validation now matches the contract exactly — never stricter, so no valid password is
blocked; never looser, so `WEAK_PASSWORD` should become unreachable in practice. It stays in the
error union regardless, because the backend owns final validation.

## 9. Service interface and hooks

### 9.1 `src/services/auth/types.ts`

The domain result type keeps its existing single-parameter shape, so no current call site or
`result.ok` narrowing changes. The generic moves to `src/services/api/types.ts` so the other
boundaries can share it when their contracts arrive:

```ts
// services/api/types.ts
export type ApiResultShape<T, E> = { ok: true; value: T } | { ok: false; error: { code: E } }
// services/auth/types.ts
export type Result<T> = ApiResultShape<T, AuthErrorCode>
```

```ts
export type AuthErrorCode =
  | 'INVALID_REQUEST' | 'INVALID_EMAIL' | 'INVALID_PROVIDER_TOKEN'
  | 'INVALID_CREDENTIALS' | 'TOKEN_INVALID' | 'TOKEN_EXPIRED'
  | 'EMAIL_NOT_VERIFIED' | 'EMAIL_ALREADY_EXISTS' | 'EMAIL_ALREADY_VERIFIED'
  | 'ACCOUNT_CONFLICT' | 'WEAK_PASSWORD' | 'VALIDATION_ERROR'
  | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  | 'NETWORK' | 'UNKNOWN'          // client-only

export type AuthUser = { id: string; email: string; emailVerified: boolean }
export type AuthSession = { user: AuthUser; isNewUser?: boolean }
export type SignUpOutcome = { userId: string; email: string; emailVerified: boolean; verificationRequired: boolean }
export type SessionSummary = { user: AuthUser; expiresIn: number; refreshExpiresAt: string }

export type AuthService = {
  signUp: (input: Credentials) => Promise<Result<SignUpOutcome>>
  signIn: (input: Credentials) => Promise<Result<AuthSession>>
  verifyEmail: (input: { token: string }) => Promise<Result<{ userId: string }>>
  resendVerification: (input: EmailOnly) => Promise<Result<null>>
  requestPasswordReset: (input: EmailOnly) => Promise<Result<null>>
  signInWithGoogle: (input: { idToken: string }) => Promise<Result<AuthSession>>
  signInWithApple: (input: AppleCredentials) => Promise<Result<AuthSession>>
  /** Startup session validation. */
  getSession: () => Promise<Result<SessionSummary>>
}
```

Tokens are deliberately **absent** from `AuthSession`. `signIn` writes them straight to
`TokenStorage` and hands the caller only the user. No screen should ever hold a token, and a type
that cannot carry one is a stronger guarantee than a convention that says not to.

`resetPassword` and `signOut` are absent per §2. `refresh` is absent because it is transport
concern, driven by 401s inside the client and never called by a screen.

`requestPasswordReset` and `resendVerification` resolve `ok` for unknown addresses. Both contracts
say the response must not reveal whether an account exists; the existing mock already defends
this.

### 9.2 Hooks — `src/modules/module-00-auth/hooks/`

The brief asks for `useAuth()`, `useLogin()`, `useSignup()`. These wrap the service in the
submit-state pattern the screens already hand-roll, so each screen loses its `useState` triple:

```ts
useAuth()    // { status, user, isLoading } from sessionStore — read-only
useLogin()   // { login, isPending, error }  — error is an AuthErrorCode, not a string
useSignup()  // { signup, isPending, error }
useResendVerification()  // adds the existing cooldown timer
```

Hooks return **codes**, never rendered strings. Copy resolution stays in the screen, which is
where the per-screen overrides live (§10.2). No new state library: plain `useState` plus the
store, the same as the rest of the codebase.

## 10. Screens and state

### 10.1 Screen changes

No screen changes appearance. Behaviour changes are confined to what the contract dictates.

| Screen | Change |
|---|---|
| `CreateAccountScreen` | `useSignup()`; carries an `Idempotency-Key`; stores `pendingEmail`; `verificationRequired` gates the push to verify-email. No auto-login — signup returns no tokens, and the brief forbids inventing one. |
| `SignInScreen` | `useLogin()`; tokens land in secure storage; `sessionStore` populated; routing per below. OAuth handlers stay empty (B7). |
| `VerifyEmailScreen` | Resend reads the real address from session, removing the `email: ''` placeholder. `EMAIL_ALREADY_VERIFIED` now has its own message. "Continue" stays user-asserted until B4. |
| `ForgotPasswordScreen` | `INVALID_EMAIL` and `RATE_LIMITED` become distinguishable; `Retry-After` feeds the existing cooldown when present. |
| `src/app/_layout.tsx` | Calls `getSession()` once on startup (goal 11) — restores a session from the keychain, or clears it if the server refuses. |

**Post-login routing.** v3's login response carries `emailVerified` but **not** `pairingStatus`,
which v2's did (blocker B8). The brief is explicit for login — *"navigate to authenticated
application"* — so:

```
403 EMAIL_NOT_VERIFIED  → /(auth)/verify-email     (the contract's own instruction)
success                 → /(app)/home
```

`replace`, not `push`. New users still reach onboarding through the signup path, which is
untouched: sign-up → verify-email → `/(onboarding)/setup`. Only a returning sign-in goes straight
home. **Assumption to revisit under B8:** a verified user who abandoned onboarding will now land
on `/(app)/home` rather than being returned to setup. Restoring that needs a pairing signal the
v3 contract does not carry.

### 10.2 Error copy

`src/copy/errors.ts` holds one exhaustive `Record<AuthErrorCode, string>` — the compiler enforces
completeness in one place — and each screen keeps only its bespoke overrides, resolved through
`authErrorMessage(code, COPY.errors)`. Existing wording is preserved as overrides.

Codes needing a per-screen override rather than one global string:

- `EMAIL_ALREADY_EXISTS` — signup only, per `ERROR_CODES.md`.
- `EMAIL_ALREADY_VERIFIED` — verify-email only. "You're already verified — you can sign in."
- `TOKEN_INVALID` / `TOKEN_EXPIRED` — "this link has expired, request a new one" on verify-email,
  but "your session ended, please sign in again" wherever the code escapes the transport layer.

### 10.3 Session — `src/state/sessionStore.ts`

```ts
type SessionState = {
  status: 'loading' | 'anonymous' | 'authenticated'
  user: AuthUser | null
  /** Set at sign-up, before a session exists, so resend has an address. */
  pendingEmail: string | null

  signedIn: (user: AuthUser) => void
  signedUp: (email: string) => void
  setEmailVerified: (verified: boolean) => void
  signedOut: () => void
}
```

`status` starts `'loading'` so the startup `getSession()` call has a state to occupy. Not
persisted — the only durable artefact is the refresh token in the keychain. `signedOut` is called
by terminal refresh failure and, later, by the sign-out button, so exactly one path tears a
session down.

## 11. Testing

### 11.1 Contract test cases

`tests/CONTRACT_TEST_CASES.md` enumerates 25 cases the backend must satisfy. Every one that is
client-observable becomes a test here, named after its contract line, so the two suites can be
read side by side. That includes the four refresh cases and both idempotency cases.

### 11.2 Conformance suite

One file of assertions run twice — against the mock, and against the HTTP implementation with
`fetch` stubbed to return **the exact JSON literals from the 13 endpoint files**. The contract
examples are the fixtures, so neither implementation can drift from the contract or from each
other. Both therefore take their collaborators by injection.

### 11.3 Refresh and rotation

The highest-risk area, and the least visible when it breaks:

- One 401 → exactly one refresh, then one replay.
- Ten concurrent 401s → **one** refresh, not ten.
- The rotated pair is persisted before any replay is issued.
- `REFRESH_TOKEN_REUSED` clears everything and abandons in-flight calls.
- `RATE_LIMITED` on refresh fails the call but **keeps** the session.
- A second 401 after a successful refresh is terminal, not a loop.
- An expired `expiresAt` refreshes pre-emptively, spending no wasted request.
- Cold start with a refresh token and no access token refreshes before the first call.

### 11.4 Client, storage, redaction

Timeout and offline → `NETWORK`; HTML body → status fallback; unknown code → status fallback;
schema mismatch → `CONTRACT_VIOLATION`; `Retry-After` in both formats and absent. Storage
round-trip, clear, cold start. And one test per redacted field name (§7) asserting it never
appears in log output.

### 11.5 Validation and screens

`PASSWORD_RULES` is re-tested against the contract's own examples. `LoveOS@123` and
`NewLoveOS@123` pass. `hunter22` now passes where it used to fail, closing the first divergence
in §8. `12345678` fails for want of a letter, and 129 characters fails on length — the two cases
that used to reach the server and come back 422. The existing property test, that the checklist
and the schema agree on every input, is kept unchanged and still passes.

Screen tests are updated for the new shapes: resend sends the session address rather than `''`;
sign-in routes home on success and to verify-email on 403; signup reuses its idempotency key
across a retry.

TDD throughout, matching how the auth and pairing clusters were built.

## 12. File manifest

**New**

```
src/config/api.ts
src/services/api/{client,errors,schemas,tokens,refresh,log,types}.ts
src/services/auth/{api,http}.ts
src/state/sessionStore.ts
src/copy/errors.ts
src/modules/module-00-auth/hooks/{useAuth,useLogin,useSignup,useResendVerification}.ts
```

Plus `__tests__` for the client, refresh, tokens, redaction, and a conformance suite.

**Modified**

```
package.json                    (expo-secure-store, expo-crypto)
src/services/auth/{types,mock,index}.ts
src/modules/module-00-auth/state/authSchemas.ts     (§8)
src/copy/{signIn,createAccount,verifyEmail,forgotPassword}.ts
src/app/_layout.tsx             (startup session validation)
4 screens (§10.1)
```

`PasswordRequirements.tsx` is **not** modified — it renders whatever `PASSWORD_RULES` contains.

**Prerequisite:** the working tree still has uncommitted changes to `homeDashboard.ts` and
`HomeDashboardScreen.tsx`, plus untracked `module-03-memories`, `services/memories`,
`app/(app)/memories/` and `AppScreenLayout`. These should be committed before this lands on top.

**Contracts folders:** v1, v2 and v3 all sit in the repo root. v3 governs authentication; v2's
status for the non-auth endpoints is blocker B8. Consolidating them is deferred until B8 is
answered — and the rename is in any case still blocked by a filesystem lock on every directory in
the project root.
