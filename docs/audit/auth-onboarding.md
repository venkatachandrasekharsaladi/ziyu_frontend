# Auth + Onboarding Audit

Scope: `src/modules/module-00-auth/screens/`, `src/modules/module-01-onboarding/screens/`, their routes in `src/app/(auth)/` and `src/app/(onboarding)/`, and `src/copy/`. Read-only audit, no code changed.

Context: LoveOS pairs exactly two people, no roles, no admin. The backend does not exist — `pairingService`, `authService`, `storyService` are in-memory mocks (`src/services/pairing/mock.ts` etc.) and the relationship/story/space state lives in plain Zustand stores with no persistence middleware (`src/state/relationshipStore.ts:28-29` says so directly). Nothing survives an app restart.

## 1. Routes

`src/app/(auth)/`:
- `welcome.tsx` → WelcomeScreen
- `sign-in.tsx` → SignInScreen
- `sign-up.tsx` → CreateAccountScreen
- `verify-email.tsx` → VerifyEmailScreen
- `forgot-password.tsx` → ForgotPasswordScreen
- `reset-password.tsx` → ResetPasswordScreen

`src/app/(onboarding)/`:
- `setup.tsx` → RelationshipSetupScreen
- `profile.tsx` → CreateProfileScreen
- `invite.tsx` → InvitePartnerScreen
- `invitation-sent.tsx` → InvitationSentScreen
- `enter-code.tsx` → EnterPartnerCodeScreen
- `partner-found.tsx` → PartnerFoundScreen
- `confirm-partner.tsx` → ConfirmPartnerScreen
- `connecting.tsx` → ConnectingScreen
- `connected.tsx` → RelationshipConnectedScreen
- `story-begins.tsx` → OurStoryBeginsScreen
- `story-cover.tsx` → StoryCoverScreen
- `when-we-met.tsx` → WhenWeMetScreen
- `first-date.tsx` → FirstDateMemoryScreen
- `became-us.tsx` → BecameUsScreen
- `first-memory.tsx` → FirstMemoryScreen
- `days-that-matter.tsx` → DaysThatMatterScreen
- `story-recap.tsx` → StoryRecapScreen
- `story-ready.tsx` → StoryReadyScreen
- `personalize.tsx` → PersonalizeSpaceScreen
- `ready-to-come-home.tsx` → ReadyToComeHomeScreen
- `welcome-home.tsx` → WelcomeHomeScreen

Both `_layout.tsx` files (`src/app/(auth)/_layout.tsx`, `src/app/(onboarding)/_layout.tsx`) turn off the native header for the whole group — every screen draws its own chrome via `AuthScreenLayout`.

That's 6 auth screens + 21 onboarding screens = 27 screens total between account creation and the app's home.

## 2. The onboarding journey, mapped

Navigation is all `expo-router` `router.push`/`router.replace` calls inside each screen — there's no central flow definition. The graph, traced from every screen (`file:line` cites the navigation call):

```
(auth)/welcome
 ├─ Sign Up → CreateAccount → VerifyEmail ─┐
 └─ Sign In → SignIn        → VerifyEmail ─┤
                                            ▼
                              (onboarding)/setup  [3-way fork]
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                         ▼
  "Invite My Partner"    "I Have a Partner Code"      "Do this later"
        ▼                       ▼                         ▼
   CreateProfile          EnterPartnerCode          OurStoryBegins
        ▼                    ▼        \
   InvitePartner       PartnerFound   "need an invite" → setup
        ▼                    ▼
  InvitationSent      ConfirmPartner
   (DEAD END —              ▼
   see §5)              Connecting
                             ▼
                   RelationshipConnected
                             ▼
                      OurStoryBegins  ◄── both branches land here
        ┌───────────────────┴───────────────────┐
        ▼ "Let's Begin"                          ▼ "Skip for now"
   StoryCover                              StoryReady
        ▼ "Let's Begin" / "Skip"                 │
   WhenWeMet → FirstDateMemory → BecameUs         │
     → FirstMemory → DaysThatMatter → StoryRecap  │
                    (saves story) ────────────────┤
                                                   ▼
                                            StoryReady
                                                   ▼
                                         PersonalizeSpace
                                                   ▼
                                       ReadyToComeHome
                                                   ▼
                                          WelcomeHome
                                                   ▼
                                          (app)/home
```

**Step count.** From Welcome to Home:
- Longest complete path (code-redeem pairing + full story capture): **24 screens** — Welcome, CreateAccount, VerifyEmail, RelationshipSetup, EnterPartnerCode, PartnerFound, ConfirmPartner, Connecting, RelationshipConnected, OurStoryBegins, StoryCover, WhenWeMet, FirstDateMemory, BecameUs, FirstMemory, DaysThatMatter, StoryRecap, StoryReady, PersonalizeSpace, ReadyToComeHome, WelcomeHome (21 distinct onboarding screens + 3 auth screens).
- The "invite" branch **cannot complete on one device at all** — see §5. It is a shorter tap-count only because it's a dead end, not because it's a lighter flow.
- Shortest possible path to Home: Welcome, CreateAccount, VerifyEmail, RelationshipSetup ("Do this later"), OurStoryBegins ("Skip for now" → straight to StoryReady), PersonalizeSpace (skip), ReadyToComeHome, WelcomeHome — **9 taps, and the user never pairs with anyone and never enters their name.** RelationshipSetupScreen (`src/modules/module-01-onboarding/screens/RelationshipSetupScreen.tsx:27,43`) and OurStoryBeginsScreen (`OurStoryBeginsScreen.tsx:20`) make both of those skippable.

**Verdict: this is too long, and it's a liability.** 21 onboarding screens for a "pair two people and start a shared space" flow is roughly triple what comparable couples apps (Paired, Between, Raft) ask before first use. Worse, the length is front-loaded with account plumbing (3 auth screens) and back-loaded with a 10-screen "story capture" wizard (StoryCover → StoryReady, all optional) that most users will not have real answers for on day one — meeting dates, first-date locations, "when did you become us" are usually not decided in the first two minutes of using an app. The fact that every one of those ten screens is independently skippable is the right mitigation, but it still means the user taps "skip" or "continue" ten times before reaching Home even when they contribute nothing.

## 3. Screen-by-screen

### WelcomeScreen — `src/modules/module-00-auth/screens/WelcomeScreen.tsx`
M00-S01, route `welcome`. Entry point, no back arrow. Shows hero collage, headline/subtitle, "Sign Up" (primary) and "Sign In" (link), privacy footer. Presentation only, no auth/session check. Goes to CreateAccount or SignIn. No previous screen; no error or loading state needed since nothing async happens here.
- Strength: honestly presentation-only, clearly documented as such (`:20-21`).
- Uses `AmbientLayer`, `HeroCollage`, `PrivacyFooter` — see §8 for the uncommitted fixes to these three.

### SignInScreen — `src/modules/module-00-auth/screens/SignInScreen.tsx`
M00-S02, route `sign-in`. Email/password form (`react-hook-form` + `zod`, `mode: 'onBlur'`). Comes from Welcome or CreateAccount's footer link. On success always pushes to VerifyEmail (`:49`) — a hard-coded decision, documented at `:47-48`, because there's no `(app)` route yet to send an already-verified user to. On failure shows a form-level error and clears only the password field (`:53-55`), keeping the typed email — good recovery. "Forgot password" link and disabled Google/Apple buttons present (per the known deliberate disable).
- **UI exists, backend behavior not verified**: `authService.signIn` is presumably a mock; nothing confirms what a "real" successful sign-in (already-verified user) would do, since the code path is permanently short-circuited to VerifyEmail.
- Problem: an already-verified returning user is forced back through VerifyEmail every sign-in. Minor for a mock, but worth flagging before backend integration.

### CreateAccountScreen — `src/modules/module-00-auth/screens/CreateAccountScreen.tsx`
M00-S03, route `sign-up`. Email/password + live `PasswordRequirements` checklist, `zod` schema. On `EMAIL_ALREADY_EXISTS` sets the error on the email field specifically rather than a form banner (`:48-50`) — good targeted error recovery. Success → VerifyEmail. Disabled social buttons present.
- Strength: field-level vs. form-level error routing is deliberate and correct.

### VerifyEmailScreen — `src/modules/module-00-auth/screens/VerifyEmailScreen.tsx`
M00-S04, route `verify-email`. Shows envelope illustration, a 60-second resend cooldown timer, "Resend" (disabled while cooling down), "Continue" (replaces to `/(onboarding)/setup`), "Change Email" (back). No real verification check exists — "Continue" is documented as the user self-asserting they clicked the email link (`:111-117`). This is honest about the gap but means **the verification step is theater**: nothing stops a user from tapping Continue immediately without ever opening an email.
- Strength: countdown format and disabled-button contrast are handled with real care (`:96-107`).
- Problem: no visible state for "I never got the email" beyond Resend; no rate-limit-exceeded messaging shown beyond the generic error map.

### ForgotPasswordScreen / ResetPasswordScreen
Not in the priority list but read for completeness. Both are well-built: ForgotPassword swaps to a "sent" state in place rather than inventing a new screen ID (`:24-27`), and always reports success regardless of whether the address has an account (`:51`) — correct anti-enumeration behavior. ResetPassword has three real states — no-token, form, success — and is explicit that a successful reset **signs the user out** rather than pretending a session exists that the mock contract doesn't grant (`:33-40`). This is the most carefully reasoned screen in the module.

### RelationshipSetupScreen — `src/modules/module-01-onboarding/screens/RelationshipSetupScreen.tsx`
M01-S01, route `setup`. The fork point: "Invite My Partner" → CreateProfile, "I Have a Partner Code" → EnterPartnerCode, "Do this later" → OurStoryBegins (skips pairing entirely). No form, no async, no loading/error state needed.
- Problem: "Do this later" lets a user skip pairing and land in a story-capture flow that assumes a partner ("when did you become us," "your first date") without ever having one. There's no return path back to pairing surfaced anywhere later in the flow once you've taken this branch (see §6).

### CreateProfileScreen — `src/modules/module-01-onboarding/screens/CreateProfileScreen.tsx`
M01-S02, route `profile`. Name (required), nickname, birthday (`DateField` via `Controller`), pronouns (all optional), photo well. Only invite-branch users see this screen — code-redeem users never create a profile here (noted at `RelationshipSetupScreen.tsx:15-16`), so their name is filled from the *other* person's device state or is blank forever, which `ConfirmPartnerScreen.tsx:43-46` explicitly guards against with a `youLabel` fallback.
- **UI exists, backend behavior not verified**: photo picker `onPick` is a stub (`:59`) — `expo-image-picker` isn't installed yet, so avatars are initials-only for the whole flow.
- Form quality: proper `react-hook-form` + `zod`, field-level errors via `FormField`/`DateField`.

### InvitePartnerScreen — `src/modules/module-01-onboarding/screens/InvitePartnerScreen.tsx`
M01-S03, route `invite`. Issues a code on mount (`pairingService.createInvite`), shows it via `CodeDisplay`, "Share" (native `Share.share`) and "Copy" (documented as **not actually wired** — no `expo-clipboard` — it just advances screens, `:61-66`). Both actions go to InvitationSent.
- Problem: the "Copy" button does not copy anything; it's functionally identical to "Share" minus the OS share sheet, which is confusing since it's labelled Copy.

### InvitationSentScreen — `src/modules/module-01-onboarding/screens/InvitationSentScreen.tsx`
M01-S05, route `invitation-sent`. This is where the invite-branch **dead-ends** — see §5 for the full analysis. Shows the same code, "Share Again" (with a real web-share/clipboard fallback chain, `:45-83` — genuinely well done for a hard cross-platform problem), "Copy" (permanently disabled, honestly, `:85-90`), "Cancel Invitation" behind a `ConfirmDialog` (not `Alert.alert`, consistent with the known web-Alert gap). Cancelling replaces to `setup`.
- Strength: the transient `FeedbackBanner` for the clipboard-fallback copy, keyed by timestamp so repeat taps re-announce (`:36-43`), is a nice touch matching the pattern used elsewhere in chat.
- **Critical problem**: no mechanism on this screen ever detects the partner accepting and moves the user forward. See §5.

### EnterPartnerCodeScreen — `src/modules/module-01-onboarding/screens/EnterPartnerCodeScreen.tsx`
M01-S04, route `enter-code`. 6-character `CodeInput`, submit disabled until length 6, error kept until the user edits (`:31-34`, deliberate — a near-miss code shouldn't be retyped from scratch). Success → PartnerFound. "I need an invite" link → back to `setup`. Loading via `Button`'s `loading` prop during submit.
- Only redeemable code in the mock is the fixed `L8V7QK` (`src/services/pairing/mock.ts:15,48`) — every invite issued by `InvitePartnerScreen` is also always `L8V7QK`, so the two branches only ever "connect" by coincidence of a shared hard-coded constant, not by any real handshake. Confirms §5.

### PartnerFoundScreen — `src/modules/module-01-onboarding/screens/PartnerFoundScreen.tsx`
M01-S06, route `partner-found`. Shows the mock partner's avatar/name, "Confirm" → ConfirmPartner, "Not them" (`reject`) → replace `enter-code`. Guards an empty store (deep link/web reload) by bouncing back to enter-code (`:34-39`) — good empty-state handling, though it renders `null` for one frame while doing so (no spinner, likely invisible in practice given it's synchronous).

### ConfirmPartnerScreen — `src/modules/module-01-onboarding/screens/ConfirmPartnerScreen.tsx`
M01-S09, route `confirm-partner`. Shows both avatars side by side, "Confirm" → Connecting, "Cancel" → replace `enter-code`. Same empty-store guard as PartnerFound.
- **Problem — redundant confirmation**: this screen asks essentially the same question PartnerFoundScreen just asked ("is this really your person?") one screen later, with no new information added except seeing your own avatar next to theirs. This is the clearest merge candidate in the flow (see §6).

### ConnectingScreen — `src/modules/module-01-onboarding/screens/ConnectingScreen.tsx`
M01-S07, route `connecting`. Real loading state (`ActivityIndicator`) → calls `pairingService.confirmPartner` → replace `connected` on success, or shows an inline error + Retry button on failure (`:73-84`) — this is the one screen in the whole audit with a textbook loading/error/retry pattern, including an unmount guard so a late response doesn't yank a user who backed out (`:30-43`).

### RelationshipConnectedScreen — `src/modules/module-01-onboarding/screens/RelationshipConnectedScreen.tsx`
M01-S08, route `connected`. Static confirmation, single "Continue" → replace `story-begins`. Note in the code that a formerly-duplicate M01-S10 screen was retired (`:11-13`) — decision hygiene, not a live issue.

### OurStoryBeginsScreen — `src/modules/module-01-onboarding/screens/OurStoryBeginsScreen.tsx`
M01-S11, route `story-begins`. The single landing point for **both** the just-connected couple and the "do this later" solo-skip path. "Let's Begin" → StoryCover, "Skip for now" → replace StoryReady. No differentiation in copy or behavior between "you just paired" and "you skipped pairing entirely," which reinforces the RelationshipSetup problem above.

### StoryCoverScreen / WhenWeMetScreen / FirstDateMemoryScreen / BecameUsScreen / FirstMemoryScreen / DaysThatMatterScreen
Five-to-six-screen "story capture" wizard, all individually optional, each with its own local `useState` (not `react-hook-form`/`zod` — see §9), each writing to `useStoryStore` only on submit, each offering an explicit "Skip" link. `WhenWeMetScreen` is the most sophisticated of these — it has real inline validation (year format, year range, required-date) with `setError`/error-clearing-on-edit (`:40-70`) and a `SegmentedControl` for date precision (exact/month-year/year-only), a genuinely nice bit of UX reasoning (documented `:25-27`).
- **Form quality gap**: `FirstMemoryScreen`, `DaysThatMatterScreen`, `FirstDateMemoryScreen`, `BecameUsScreen` use plain `useState` with no validation at all — every field is free text with no length/format check, inconsistent with the `zod`-validated auth/profile screens and with `WhenWeMetScreen`'s own date validation two screens earlier in the same wizard.
- Story data (dates, notes, photo captions) all live only in `useStoryStore` (no persistence) until `StoryRecapScreen`'s submit — see §7.

### StoryRecapScreen — `src/modules/module-01-onboarding/screens/StoryRecapScreen.tsx`
M01-S18, route `story-recap`. **The point where the story is actually saved** (`storyService.saveStory`, `:71-85`) — everything upstream only lived in the in-memory `useStoryStore`. Has a real empty state ("nothing to show" card, `:97-106`) for a user who skipped every capture screen, and a real error+loading state on save (`:78-81`, `:145`). One of the two best-instrumented screens in the audit alongside ConnectingScreen.

### StoryReadyScreen — `src/modules/module-01-onboarding/screens/StoryReadyScreen.tsx`
M01-S19, route `story-ready`. Checklist recap ("added"/"skipped" per item, never fake-checking something the user didn't fill in — `:18-21`). Single "Continue" → PersonalizeSpace. Reached either from StoryRecap (after save) or directly via any of the three "skip" shortcuts (RelationshipSetup's "later," OurStoryBegins' skip, StoryCover's skip) — meaning this screen can render entirely empty rows for a user who took the shortest path, which it explicitly handles well.

### PersonalizeSpaceScreen — `src/modules/module-01-onboarding/screens/PersonalizeSpaceScreen.tsx`
M01-S20, route `personalize`. Space name (required, validated), short name, cover style (`SegmentedControl`, not a swatch grid — accessibility reasoning at `:17-20`). "Skip" bypasses the required-name validation entirely and still advances (`next` is reused unconditionally as the skip handler).

### ReadyToComeHomeScreen / WelcomeHomeScreen
Static `StatusScreen`s, single CTA each. Both explicitly drop invented design content that would be dishonest (fake "Paris Trip" memory cards; an "Assistant Ready" line for an assistant that doesn't exist) — documented restraint (`ReadyToComeHomeScreen.tsx:12-16`, `WelcomeHomeScreen.tsx:16-18`). `WelcomeHomeScreen` replaces to `/(app)/home`, correctly closing the onboarding stack so back-navigation into setup is impossible from the app.

## 4. Where a real user would drop out

1. **InvitationSentScreen** (waiting for a partner to accept) — the single most likely abandonment point in the whole flow. A user shares a code, sees no confirmation their partner did anything, and the only actions available are re-share or cancel. See §5.
2. **The 10-screen story-capture wizard** (StoryCover through StoryRecap/StoryReady) — even though every field is skippable, tapping "Skip" six-plus times in a row before reaching a usable app is exactly the kind of friction that produces mid-flow abandonment, especially since none of this content is needed to use the app.
3. **VerifyEmailScreen**, if a user genuinely waits for an email that (in this mock world) never resolves into a real verified state — the only way through is to self-assert with "Continue," which isn't discoverable as the intended action versus "wait for the real email."
4. **RelationshipSetupScreen**, for the invite-sender specifically — anyone who chooses "Invite My Partner" and gets to InvitationSentScreen has no forward progress available at all (dead end).

## 5. The partner-invite handoff — make or break

Traced fully: partner A (`RelationshipSetupScreen` → `CreateProfileScreen` → `InvitePartnerScreen` → `InvitationSentScreen`) sees a 6-character code and shares it. Partner B receives **only whatever text `Share.share`/Web Share puts in the message** (`src/copy/invitePartner.ts`'s `shareMessage(code)` — a plain string with the code embedded, no deep link, no app-store link, no context beyond the raw text). Partner B's actual first screen inside the app is `EnterPartnerCodeScreen`, reached however they get there themselves (manually opening the app and navigating to "I Have a Partner Code" — there is **no deep link handling** in `(onboarding)/enter-code.tsx` or anywhere in the routes read that would let a shared link land Partner B directly on this screen with the code pre-filled).

The redemption itself, per `src/services/pairing/mock.ts:14-23,57-67`, only ever succeeds for the single hard-coded code `L8V7QK` — which is also the *only* code `InvitePartnerScreen`'s `createInvite()` ever issues (`mock.ts:44-55`). There is no real code generation, no expiry logic beyond a fixed 2099 date, and critically **no link between the two sides at all**: Partner A's `InvitationSentScreen` never polls, subscribes, or otherwise learns that Partner B redeemed anything. `useRelationshipStore` (`src/state/relationshipStore.ts`) is a single in-memory store — there's no second "session" for it to reflect changes from, since there's no backend and no second device state to sync.

**Conclusion: the invite-and-wait side of pairing is entirely unimplemented as a two-party flow.** It works today only as a demo where one person plays both parts on one device (open Invite Partner, then separately navigate to Enter Code and type the fixed code). For an actual two-person scenario, Partner A currently has no way to ever leave `InvitationSentScreen` except to cancel their own invite. This is the single highest-priority gap in the whole audited surface, and it is squarely the "make-or-break" moment the task asked about.

## 6. Dead ends

- **InvitationSentScreen** — confirmed dead end. Arriving here (by inviting a partner) leaves no forward path; only "cancel and go back to setup" or re-share the same code. See §5.
- No other unconditional dead end was found — every other screen has at least a Continue/Skip and a Back.
- **Soft dead end / no way back to pairing**: once a user takes RelationshipSetupScreen's "Do this later" or either story-flow "Skip for now," there is no button anywhere downstream (StoryReady, PersonalizeSpace, ReadyToComeHome, WelcomeHome) offering to pair with a partner. The only way back into the pairing flow is to `router.back()` manually or relaunch onboarding from scratch — the "later" promise on `setup.tsx` copy ("Do this later") is not honored by any later screen actually re-surfacing the option.

## 7. What happens if the app is closed mid-onboarding

Everything written above `StoryRecapScreen`'s save point lives only in memory (`useRelationshipStore`, `useStoryStore`, `useSpaceStore` — all plain `create()` with no `persist` middleware, confirmed by grep: no `AsyncStorage`/`MMKV`/`SecureStore` reference anywhere in `src/state/`). Concretely:
- A user who closes the app after creating a profile, issuing an invite, or entering a code loses all of it — profile name, invite code, redeemed partner, connection status. On relaunch they land back at `welcome` (there's no session/route restoration logic in either `_layout.tsx`) and start completely over, including re-registering (since `authService` itself is presumably equally unpersisted, though that's module-00's concern, not read here).
- Story-flow answers (met date, first date, "became us," first memory, key dates) are lost unless the user reached `StoryRecapScreen` and tapped "Save" — `storyService.saveStory` is the only place any of this is written anywhere durable-sounding, and even that "durable" store is itself a mock.
- Space name/cover style (`PersonalizeSpaceScreen`) is never explicitly "saved" via a service call at all (no `spaceService` found) — it only ever lives in `useSpaceStore`, so it is lost on close regardless of how far past it the user gets.
- Net effect: **any interruption anywhere in this 21-screen flow costs the user everything and restarts them at screen one.** There is no resume, no draft state, no "continue where you left off." For a flow this long, that is a serious reliability problem independent of the missing backend — it will be equally true once a real backend exists unless resumption is explicitly designed in.

## 8. Empty / loading / error states — screen by screen

| Screen | Loading | Error | Empty |
|---|---|---|---|
| SignInScreen | Button `loading` | Form banner, password cleared | — |
| CreateAccountScreen | Button `loading` | Field-level + form banner | — |
| VerifyEmailScreen | Resend `loading` | Resend error text | — |
| ForgotPasswordScreen | Button `loading` (both states) | Form banner | — |
| ResetPasswordScreen | Button `loading` | Form banner | Explicit no-token state (`StatusScreen`) |
| RelationshipSetupScreen | n/a (no async) | n/a | n/a |
| CreateProfileScreen | Button `loading` | Field-mapped form banner | — |
| InvitePartnerScreen | Code renders only once issued (implicit) | Inline error text | Buttons disabled while `!code` |
| InvitationSentScreen | n/a (code already held) | Cancel-invite error, share-fallback feedback banner | — |
| EnterPartnerCodeScreen | Button `loading` | Kept-on-edit inline error | — |
| PartnerFoundScreen | — | — | Guarded empty-store redirect |
| ConfirmPartnerScreen | — | — | Guarded empty-store redirect, `youLabel` fallback for missing name |
| ConnectingScreen | `ActivityIndicator` | Inline error + Retry, unmount-safe | — |
| RelationshipConnectedScreen | n/a | n/a | n/a |
| Story capture screens (Cover/WhenWeMet/FirstDate/BecameUs/FirstMemory/DaysThatMatter) | n/a (no async until Recap) | Only `WhenWeMetScreen` validates | — |
| StoryRecapScreen | Button `loading` | Save error | **Explicit empty-story card** |
| StoryReadyScreen | — | — | Per-row "skipped" state, handles all-skipped gracefully |
| PersonalizeSpaceScreen | — | Required-name inline error | — |
| ReadyToComeHome / WelcomeHome | n/a | n/a | n/a |

Gaps: none of the six story-capture screens (besides `WhenWeMetScreen`) has any validation or error state — there's simply nothing to fail since they're free-text with no submit call. No screen in the flow has a genuine network-timeout/offline state distinct from its generic error message (the mock's `NETWORK` error code exists in `RESERVED` but is only reachable by typing the magic word "OFFLIN"/"BROKEN" as a code — not something a real network blip would trigger).

## 9. Form quality

`react-hook-form` + `zod` is used consistently and well in module-00 (all four form screens: SignIn, CreateAccount, ForgotPassword, ResetPassword) and in `CreateProfileScreen` (module-01's only `zod`-validated screen — `src/modules/module-01-onboarding/state/profileSchema.ts`). Common pattern: `mode: 'onBlur'`, `FormField` wrapping `Controller`, error kept until next edit, `setValue`/`setError` used precisely (clearing password on auth failure, targeting the email field for `EMAIL_ALREADY_EXISTS`).

Everything else in module-01 past `CreateProfileScreen` — `EnterPartnerCodeScreen`'s code field, and all six story-capture screens — uses raw `useState` with no schema. `EnterPartnerCodeScreen` at least validates length before enabling submit and defers real validation to the service call. The story screens have no validation at all except `WhenWeMetScreen`'s hand-rolled year/date checks. This is an inconsistency worth deliberately deciding on (either "story fields never need validation because they're free text," which is a defensible product call, or bring them in line with the rest of the app).

Keyboard handling is centralized and good: `AuthScreenLayout` (`src/modules/module-00-auth/components/AuthScreenLayout.tsx:58-73`) wraps every form screen in `KeyboardAvoidingView` (iOS `padding`, Android default) + `ScrollView` with `keyboardShouldPersistTaps="handled"` (explicitly to avoid the classic "first tap only dismisses keyboard" bug). This is shared by every module-00 and module-01 screen alike since they all reuse `AuthScreenLayout`.

## 10. Which steps could merge, or defer until after pairing

- **PartnerFoundScreen + ConfirmPartnerScreen should merge.** Both ask "is this the right person" one screen apart with no new information gained between them (§3). Collapsing to one confirm screen removes a full step from the code-redeem path.
- **Defer entirely, post-pairing**: the whole story-capture wizard (StoryCover → StoryRecap, 7 screens) and `PersonalizeSpaceScreen`. None of it is needed to use the app; all of it is more naturally filled in once the couple is actually inside their shared space with time to think, not mid-signup. This would cut the onboarding flow roughly in half.
- **Consider merging** `RelationshipConnectedScreen` into `ConnectingScreen`'s success state (a brief success flash before auto-advancing) rather than a second full screen requiring another tap — `RelationshipConnectedScreen`'s own comment already notes a near-identical screen was retired once before (`:11-13`) for being a duplicate.
- **StoryReadyScreen** could be dropped for a solo-skip user (someone who took every skip) since it summarizes only "skipped" rows in that case — it currently still renders for zero-content users.

## 11. Uncommitted user edits to AmbientLayer / HeroCollage / PrivacyFooter

All three (`git diff` reviewed, not modified) are targeted fixes to the same underlying bug: **Unistyles' `StyleSheet.create` output never reaches `expo-image`** — Unistyles binds directly to the native shadow node and expo-image doesn't process it, so any `styles.foo` handed to an `<Image>` silently drops every property, most visibly `width`/`height`, producing a 0×0 image. The diffs replace `styles.shape` / `styles.image` / `styles.icon` with plain object literals (`AmbientLayer.tsx` per-shape `style` objects now carry `position: 'absolute'` inline; `HeroCollage.tsx` introduces a module-level `IMAGE` const including the load-bearing `mixBlendMode: 'multiply'`; `PrivacyFooter.tsx` inlines the lock icon's `9.33×12.25` size). This matches a pattern already fixed in six other components (`Avatar.tsx:52-58`, `PhotoCarousel.tsx`, `PhotoLightbox.tsx`) and is now enforced by a new regression test, `src/design-system/__tests__/expoImageStyles.test.ts`, which walks every file importing `expo-image` and fails if any `<Image>` tag receives a `styles.*` reference. That test currently passes against the tree including these uncommitted edits — i.e., the fix is consistent with the project-wide rule and closes the last three known offenders. No other issues observed in these three files beyond the fix itself.
