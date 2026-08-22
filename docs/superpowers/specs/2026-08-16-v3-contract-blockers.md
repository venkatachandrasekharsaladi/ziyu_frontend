# Auth Contracts v3 — Integration Blockers

Date: 2026-08-16
Contract: `LoveOS-Signin-Signup-API-Contracts-v3/` (13 endpoints, OpenAPI 3.0.3 v3.0.0)
Status: **Blocked pending answers.** No implementation started.

Raised under the integration rule *"if something required by the UI is missing from the
contract, stop and report it rather than invent it"*, and under the v3 README's own rule
*"if a future document disagrees with OpenAPI, resolve the disagreement before implementation;
do not silently choose one."*

---

## Summary

| # | Blocker | Needs | Blocks |
|---|---|---|---|
| B1 | `/auth/providers/{provider}/link` has no request body in OpenAPI, but the Markdown defines one | Backend | Goal 12 (linking) |
| B2 | Nothing returns which providers are linked | Backend | Goal 12 (unlinking UI) |
| B3 | Contract password policy contradicts the shipped on-screen checklist | Product decision | Goal 1 (signup) |
| B4 | No deep-link format for verification / reset tokens | Backend | Goals 3, 8 |
| B5 | No reset-password screen exists, and UI changes are forbidden | Product decision | Goal 8 |
| B6 | No logout entry point exists in the app | Product decision | Goal 10 |
| B7 | No Google/Apple SDK or client ID; the contract cannot supply one | Product decision | Goals 5, 6 |
| B8 | v3 drops `pairingStatus` and every couples/profile/onboarding endpoint | Backend + product | Post-login routing |

Goals 2 (login), 4 (resend), 7 (forgot), 9 (refresh) and 11 (session) are **unblocked**.

---

## B1 — `/auth/providers/{provider}/link` has no request body in OpenAPI

`contracts/auth/12-link-provider.md` specifies a body:

```json
Google: {"idToken": "google_identity_token"}
Apple:  {"identityToken": "...", "authorizationCode": "..."}
```

`openapi.yaml` (lines 300–312) defines the path, the `provider` path parameter, security and all
six responses — but **no `requestBody` key at all**. Read literally, the OpenAPI says link takes
no body, which cannot work: the server has no way to receive the provider token.

The v3 README names `openapi.yaml` as source of truth #1 and forbids silently choosing between
disagreeing documents.

**Needed:** add `requestBody` to the OpenAPI path, with a schema per provider (probably a
`oneOf` of a `GoogleLinkRequest` and an `AppleLinkRequest`, neither of which currently exists in
`components/schemas`).

---

## B2 — Nothing reports which providers are linked

`GET /auth/session` returns:

```json
{"user":{"id","email","emailVerified"},"session":{"expiresIn","refreshExpiresAt"},"requestId"}
```

There is no `linkedProviders` field, and no other endpoint exposes one. An unlink UI must show
what is currently linked before offering to unlink it, and must know whether unlinking is even
possible — `DELETE /auth/providers/{provider}` returns `409 ACCOUNT_CONFLICT` when it would
leave the account with no login method, which the client can only avoid triggering blindly.

**Needed:** either a `linkedProviders: ["google"]` array on `GET /auth/session`, or a dedicated
`GET /auth/providers`. Until then, linking/unlinking cannot be built as a UI.

---

## B3 — The contract's password policy contradicts the shipped checklist

`schemas/VALIDATION.md` states the MVP policy: **min 8, max 128, at least one letter and one
number.** `openapi.yaml` agrees on the bounds (`SignupRequest.password: minLength 8, maxLength 128`).

The app ships a different policy in `PASSWORD_RULES`
([authSchemas.ts:16-20](../../src/modules/module-00-auth/state/authSchemas.ts#L16-L20)):
**8+ characters, one number, one special character.** No letter requirement, no maximum.

Three concrete divergences:

| Password | App | Contract | Result today |
|---|---|---|---|
| `hunter22` | rejected (no special char) | valid | UI blocks a password the backend would accept |
| `12345678!` | accepted (no letter rule) | invalid | Backend returns 422 `WEAK_PASSWORD` after submit |
| 200 chars | accepted (no maximum) | invalid | Backend returns 422 `WEAK_PASSWORD` after submit |

This is not a silent fix. `PASSWORD_RULES` is rendered as a live on-screen checklist by
[`PasswordRequirements`](../../src/modules/module-00-auth/components/PasswordRequirements.tsx),
deliberately derived from one list so the checklist and the submit schema cannot disagree.
Aligning to the contract **changes visible UI text** — which the integration brief forbids —
while leaving it as-is **contradicts the contract**, which the brief also forbids.

**Needed:** a decision. Either the contract's policy is authoritative and the checklist changes
to "8–128 characters / one letter / one number", or the backend adopts the app's stricter policy
(and `VALIDATION.md` changes). The two cannot both stand.

---

## B4 — No deep-link format for verification and reset tokens

`POST /auth/verify-email` and `POST /auth/password/reset` both consume an opaque single-use
token. `VALIDATION.md` confirms those tokens are *"never returned in API responses"* — so the
only delivery channel is the emailed link.

Nothing in v3 specifies what that link looks like: no URL scheme, no universal-link domain, no
path, no query-parameter name. The app declares `"scheme": "loveosapp"` in `app.json` and has
`expo-linking` installed, but cannot register a handler for a format nobody has defined.

**Needed:** the exact link the backend emails, for both flows. For example
`loveosapp://verify-email?token=…` plus an `https://loveos.app/verify-email?token=…` universal
link for users who open mail on desktop. Also needed: whether the app or a web page is the
intended landing target.

Without this, verification-by-token and password reset cannot be reached by a real user, however
correctly the endpoints are implemented.

---

## B5 — No reset-password screen exists

Goal 8 is "Reset Password". `POST /auth/password/reset` takes `{token, newPassword}`, so a user
must be able to type a new password. The app has no such screen — `(auth)/` contains only
`welcome`, `sign-in`, `sign-up`, `verify-email` and `forgot-password`.

Building it means new UI, which the brief forbids. Not building it leaves goal 8 unreachable.

**Needed:** either a Figma design to build against, or explicit approval to compose one from
existing design-system primitives, or agreement that the endpoint ships uncalled.

---

## B6 — No logout entry point exists

Goal 10 is "Logout". `module-05-profile` is empty scaffolding (`.gitkeep` only, no screens), and
`grep` finds zero occurrences of sign-out or logout anywhere in `src/`. There is no button, menu
or gesture from which a user can sign out.

**Needed:** the same decision as B5. The service method is trivial and will be implemented and
tested regardless; the question is only whether anything calls it.

---

## B7 — No provider SDK, and the contract cannot supply the client ID

The Google and Apple buttons already exist on the sign-in screen
([SignInScreen.tsx:119-122](../../src/modules/module-00-auth/screens/SignInScreen.tsx#L119-L122)),
rendered and pressable with `onPress={() => {}}` and a comment marking OAuth out of scope. Wiring
them is therefore **not** a UI change — good news for goals 5 and 6.

But the contract's `POST /auth/oauth/google` expects an `idToken` the *client* must obtain, and
`/auth/oauth/apple` expects an `identityToken` plus `authorizationCode`. Producing those requires
a native provider SDK — `@react-native-google-signin/google-signin` and
`expo-apple-authentication` — neither of which is installed, and both of which force a dev-client
rebuild.

They also require a Google **OAuth client ID** per platform (iOS, Android, and a web client ID
for ID-token audience). These are public identifiers, not secrets, so they do not violate the
"no provider secrets in the app" rule — but they are deployment configuration that the contract
does not carry and I will not guess.

**Needed:** approval to add the two SDKs, plus the iOS/Android/web Google client IDs and
confirmation that `com.loveos.app` is the registered bundle identifier and Apple Services ID.

---

## B8 — v3 drops `pairingStatus` and the entire couples/profile/onboarding surface

v2 (`LoveOS-Authentication-API-Contracts-v2/`) defined 18 endpoints including
`/users/me/profile`, `/couples/*` and `/onboarding/complete`. v3 is scoped to authentication and
defines 13, none of them couples-related.

Two consequences:

1. **v3's login response has no `pairingStatus`.** v2's did, and the approved design (D9) used it
   to route after sign-in: unverified → verify-email, not paired → onboarding, paired → home.
   With v3 alone, the client knows `emailVerified` but not pairing state, so post-login routing
   can only send everyone to onboarding — the behaviour the design set out to fix.
2. **The v2 pairing work has no v3 successor.** It is unclear whether v2 remains authoritative
   for `/couples/*`, `/users/me/profile` and `/onboarding/complete`, or whether those are being
   redesigned and should not be built yet.

**Needed:** confirmation of whether v2 still governs the non-auth endpoints, and where
`pairingStatus` now comes from after login — `GET /couples/status` as a second call, or a field
restored to the login response.

---

## Smaller items (not blocking, decided defensively)

- **`Idempotency-Key`** is "recommended" on signup and described generally in `VALIDATION.md`,
  but no endpoint list or key format is given. Plan: a v4 UUID on signup only, regenerated per
  distinct submission and reused across retries of the same submission. Generating one needs
  `expo-crypto`; React Native has no reliable global `crypto.randomUUID`.
- **`SessionResponse.user` and `.session` declare no `required` arrays** in the OpenAPI, unlike
  every other response schema. Read literally every field is optional. Plan: follow
  `11-session-status.md` and treat all fields as required.
- **`Retry-After`** is specified for 429 in `RATE_LIMITING.md` but appears in no OpenAPI response
  header block. Plan: read it when present, ignore it when absent.
- **`requestId` now appears in success bodies**, not only errors. Plan: capture it on every
  response for logging.

---

## What v3 resolved

For the record, v3 answers four questions raised against v2:

- `EMAIL_ALREADY_VERIFIED` now exists, so `EMAIL_ALREADY_EXISTS` is no longer overloaded.
- Refresh-token TTL is published (2592000s) and returned per-response as `refreshExpiresIn`.
- Refresh failures are split into four distinct codes, including `REFRESH_TOKEN_REUSED`.
- **`openapi.yaml` now specifies every response schema.** This removes the reason codegen was
  rejected in the earlier design (D2) and should be re-decided.
