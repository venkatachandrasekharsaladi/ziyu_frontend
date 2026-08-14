# M01 Pairing Cluster (S01–S09, S11) — Design

**Date:** 14 August 2026
**Screens:** M01-S01 Relationship Setup · S02 Create Your Profile · S03 Invite Your Partner ·
S04 Enter Partner Code · S05 Invitation Sent · S06 Partner Found · S07 Connecting ·
S08 Relationship Connected · S09 Is This Your Person · S11 Our Story Begins
**Retired:** M01-S10 Relationship Confirmation — see D30
**Figma:** `t0FGzFLXoVXSUYa7mkjSbR`, page *LOVEOS APP*, board `543:3` "Login"
**Companion:** [M00 auth cluster](2026-08-13-auth-cluster-design.md) · [M00-S01 Welcome](2026-08-11-welcome-screen-design.md) · `SCREENS.md`
**Status:** Approved for implementation. Normalisation approved 14 Aug 2026.

This is **Cluster 2** of four. It follows the auth cluster and consumes everything that
cluster settled — `Input`, `Button`, `Card`, `Divider`, `AppHeader`, `FooterPrompt`, the
token layer and the test harness. It adds the components the pairing flow forces:
`Avatar`, `PhotoPicker`, `CodeDisplay`, `CodeInput`, `DateField` and a status-screen
pattern.

---

## 1. Goal

Build the flow that turns two authenticated individuals into one shared relationship.

**Done means:** all ten screens render, the invite/accept path works end to end against a
mock pairing service, a profile can be created including photo, name, nickname, birthday and
pronouns, and every screen is reachable by the routes in §8.

**Not included:** a real backend, real invitations, deep links, push notifications, or
photo upload to storage. The pairing service is a mock behind a typed boundary, exactly as
`AuthService` is.

---

## 2. How the designs were read

The Figma **MCP integration is exhausted** — Starter tier allows 20 tool calls per month and
they are spent until roughly mid-September. These designs were read instead through the
**Figma REST API** with a read-only personal access token, which is available on every plan
and returns the same node data: real values, not colours sampled from a screenshot.

That matters for trust. The Welcome spec records three values that were wrong precisely
because they came from a rendered image. Nothing here does.

Tooling lives in the session scratchpad (`figma-api.js`, `analyze.js`, `drift.js`) and is
disposable; the token is read from a file outside the repo, never printed and never
committed.

---

## 3. Which frames are canonical

The board `543:3` holds 23 frames, and several screens appear **twice** — an earlier pass and
a later one. The later frames were chosen: they carry sentence-case button labels matching
the built design system, and they are what `SCREENS.md` already maps.

| Screen | Earlier | **Canonical** |
|---|---|---|
| Create Your Profile | `522:349` | **`522:598`** |
| Relationship Connected! | `522:506` | **`522:802`** |
| Is this your person? | `522:559` | **`522:764`** |

The remaining canonical IDs: S01 `522:302`, S03 `522:422`, S04 `522:461`, S05 `522:655`,
S06 `522:709`, S07 `522:738`, S11 `522:834`. S06 and S07 are **not** in the board; they are
top-level on the page.

---

## 4. Decisions taken

Numbering continues from the auth cluster, which ended at D28.

| # | Decision | Rationale |
|---|---|---|
| D29 | **Normalise these ten screens to the existing system, and log every deviation** | Same policy as D12, approved again for this cluster. Four values that D5, D18 and D20 already removed had reappeared — see §5. Building them as drawn would put two page backgrounds and two heading inks across Modules 00 and 01. |
| D30 | **M01-S10 Relationship Confirmation is retired as a duplicate of M01-S08** | `SCREENS.md` §1.4 flagged that the two read almost identically and Figma only ever drew one. Marked `SUPERSEDED BY M01-S08`; the ID is retired and never reused, per rule 1. |
| D31 | **Build `522:598`'s layout but carry the pronouns and nickname fields across from `522:349`** | The later pass silently dropped both. For an app about how two people refer to each other, pronouns are meaningful, and both are optional fields on a form being built anyway — adding them later means migrating stored profiles. Logged as a deliberate deviation from the canonical frame. |
| D32 | **The decorative palette stays local to its artwork; it is not tokenised** | `#FFE5A3`, `#E9A4C7`, `#BEA8FF`, `#ECE6F0` and `#000000` appear only inside vectors, sparkles, blur overlays and a polaroid illustration. Promoting illustration colours to semantic tokens invites someone to use "sparkle pink" as a UI colour. |
| D33 | **The noise overlay stays dropped** | Same 390×390-image-in-a-full-bleed-frame artifact D19 removed from auth. It reappears on several of these screens and is dropped for the same reason. |
| D34 | **`Bricolage Grotesque` and `Material Symbols Outlined` are treated as Figma slips, not intent** | Two text nodes ("Our safe space ✨", "just a moment") use Bricolage at *body* size 16/24, and one node is the literal string `"star"` in an icon font. A display face would not appear twice at body size. No second family is installed. Recorded as an open item for the designer rather than silently honoured. |
| D35 | **One pairing boundary, mirroring `AuthService`** | The screens talk to a typed `PairingService` with a mock implementation. Same shape, same `Result`/error-code discipline, same swap point. |
| D36 | **The relationship lives in Zustand; forms do not** | `ARCHITECTURE.md` puts session and relationship in Zustand and states "never lift a form into a global store". Profile creation stays in `react-hook-form`; only the resulting relationship state is global. |
| D37 | **M01-S06 Partner Found is a full screen, not a sheet** | Its frame is 390×613 with its own background, which reads as a sheet. But it is reached by following an invite link, has no parent screen to sit over, and `SCREENS.md` lists it as a screen with its own ID. Built as a screen with vertically centred content; the short frame is treated as the designer sizing to content. Recorded so it can be revisited. |

---

## 5. The four regressions

Each was already decided against for auth, and each reappeared here.

| Value | Used for | Normalised to | Original decision |
|---|---|---|---|
| `#FFFCF9` cream page | Backgrounds of S02, S05, S06, S07 | `surface.page` `#FDF7FF` | **D18** |
| `#1D1A21` | Headings on S03, S04; "Copy Code" label | `text.heading` `#33264A` | **D5** |
| `#7A7583` | "DO THIS LATER", "YOUR UNIQUE CODE", "That's not them" | `text.body` `#494552` | **D20.1** |
| `#F2ECF6` · `#21005D` · `#6B7280` | Photo well, secondary button, Copy Code, code characters | `surface.field` · `brand.primary` · `text.body` | near-duplicates |

### The `#7A7583` case is worse here than in auth

In auth it was only a placeholder. Here it labels content people must read — most sharply
**"YOUR UNIQUE CODE"**, which sits directly above the pairing code a user has to transcribe.

On the cream background it measures **4.37:1**, below the 4.5:1 AA floor. On the normalised
lavender page it would be 4.42:1 — still failing. `text.body` `#494552` reaches **8.83:1**.

No new colour tokens are added by this cluster. Every value folds into the existing set,
which the contrast suite already covers.

---

## 6. Type and geometry folding

| Drawn | Folded to | Note |
|---|---|---|
| 44/55 (S01), 44/48 (S02, S03, S04 …) | `h1` 40/44 | Two near-duplicate display sizes plus the tokenised one is three ways to set a headline |
| 28/34 wordmark (S01) | `wordmark` 20/26 | The wordmark is fixed chrome; it does not resize per screen |
| 18/27 button labels (S01) | `labelStrong` 16/24 | `body` on a filled pill reads as prose, not a control |
| 16/20 placeholder (S02) | `label` 16/24 | Off the 4pt line-height rhythm by 4 |
| Buttons 47pt (S04) | `control.height` 56 | D14. 47 clears the 44pt touch minimum but breaks the shared rhythm |
| Header 80pt, 48×48 edges | `AppHeader` as built | Their "Placeholder for symmetry" rectangle is the same device `AppHeader` already uses |
| Radii 2, 8, 16, 24, 300 | `field` 12 · `medallion` 32 · `pill` | 300 is a pill on a 192pt element; 2 is a hairline detail inside artwork and stays local |

Content column is **350pt** on every screen — 390 minus 20pt each side, which is exactly the
`AuthScreenLayout` inset. No layout change needed.

---

## 7. New components

**`primitives/Avatar.tsx`** — `size`, `uri?`, `initials`, `ring?`. Falls back to initials on a
`surface.soft` circle when there is no photo. Consumed by S02, S06, S09 and every later
cluster.

**`primitives/CodeDisplay.tsx`** — renders a pairing code as `L8V · 7QK`. The middle dot is
presentation only and never part of the value. `accessibilityLabel` spells the code out
character by character, because a screen reader saying "el eight vee dot seven queue kay" as
one word is useless for transcription — `SCREENS.md` §7 already calls this out for M01-S03.

**`primitives/CodeInput.tsx`** — six segmented boxes with a separator after the third.
Handles paste of a full code, backspace across boxes, and auto-advance. One hidden input
backs all six so the keyboard and autofill behave; the boxes are presentation. Invalid codes
surface through the same `error` treatment `Input` uses.

**`primitives/DateField.tsx`** — three segments, `mm / dd / yyyy`, as drawn on S02. Not a
calendar: a birthday is typed faster than it is scrolled to. Validates a real date, so
31/02 fails.

**`patterns/PhotoPicker.tsx`** — circular well with an "Add Photo" affordance. `expo-image-picker`
is **not** installed by this cluster (`INSTALL-PLAN.md` schedules it for Phase 6); the picker
takes an `onPick` callback and the screen supplies a stub, so the layout is real and the
wiring lands with the library.

**`patterns/StatusScreen.tsx`** — the shape S07 and S08 share: centred illustration, headline,
lede, optional actions. S07 adds a pulse animation on the illustration; S08 is static.

**Not built:** a bottom-sheet container (D37), calendar picker, image cropper.

---

## 8. Flow and routing

```
src/app/(onboarding)/_layout.tsx          Stack, headerShown: false
src/app/(onboarding)/setup.tsx            → RelationshipSetupScreen      M01-S01
src/app/(onboarding)/profile.tsx          → CreateProfileScreen          M01-S02
src/app/(onboarding)/invite.tsx           → InvitePartnerScreen          M01-S03
src/app/(onboarding)/enter-code.tsx       → EnterPartnerCodeScreen       M01-S04
src/app/(onboarding)/invitation-sent.tsx  → InvitationSentScreen         M01-S05
src/app/(onboarding)/partner-found.tsx    → PartnerFoundScreen           M01-S06
src/app/(onboarding)/connecting.tsx       → ConnectingScreen             M01-S07
src/app/(onboarding)/connected.tsx        → RelationshipConnectedScreen  M01-S08
src/app/(onboarding)/confirm-partner.tsx  → ConfirmPartnerScreen         M01-S09
src/app/(onboarding)/story-begins.tsx     → OurStoryBeginsScreen         M01-S11
```

The group is `(onboarding)`, which the scaffold already provides.

| From | Action | To |
|---|---|---|
| M00-S04 Verify Email | continue | **S01** — replaces the current dead end |
| S01 | Invite My Partner | S02 |
| S01 | I Have a Partner Code | S04 |
| S01 | Do this later | S11 |
| S02 | Continue | S03 |
| S03 | Share Invite / Copy Code | S05 |
| S04 | Connect | S06 |
| S05 | (partner accepts) | S06 |
| S06 | Continue | S09 |
| S06 | That's not them | S04 |
| S09 | Yes, Connect Us | S07 |
| S09 | Cancel | S04 |
| S07 | (completes) | S08 |
| S08 | Continue | S11 |
| S11 | Let's Begin / Skip for now | Cluster 3 — **not yet built** |

**S11's exits have nowhere to go.** Cluster 3 (M01-S12…S19) does not exist, so both actions
route to a placeholder, exactly as `verify-email` was handled in the auth cluster. Recorded
so it surfaces rather than being forgotten.

Profile creation sits on the *invite* branch only, matching S01's two paths: the person who
invites creates a profile first; the person entering a code is identified by the invite.

---

## 9. The pairing boundary

```
src/services/pairing/types.ts   PairingService — createProfile · createInvite ·
                                redeemCode · confirmPartner · cancelInvite
                                Result<T, PairingError> with a code union
src/services/pairing/mock.ts    In-memory. Reserved codes make every path reachable:
                                  L8V7QK  → valid, partner "Chandu"
                                  EXPIRED → CODE_EXPIRED
                                  BADCODE → CODE_INVALID
                                  SELF123 → CANNOT_PAIR_WITH_SELF
src/services/pairing/index.ts   The swap point
```

`CANNOT_PAIR_WITH_SELF` exists because redeeming your own invite is the obvious first thing
a developer tests and the least obvious thing to handle.

Relationship state goes in `src/state/relationshipStore.ts` (Zustand), holding
`{ status, code, partner, profile }`. Nothing persists — `expo-secure-store` and MMKV are
still not installed, and there is no real token or record to keep.

---

## 10. Error handling

| Case | Behaviour |
|---|---|
| Invalid code | `CodeInput` shows the error treatment plus a message; the code is kept so it can be corrected, not cleared |
| Expired code | Message names the problem and offers "I need an invitation" → S01 |
| Pairing with self | Explicit message; never a generic failure |
| Network | Form-level "No connection…", identical wording to auth |
| Cancel invitation (S05) | Confirms before destroying, since the partner may already hold the code |
| Photo pick fails / declined | Falls back to initials; never blocks Continue, since the photo is optional |
| Birthday invalid | Field-level message; 31/02 and future dates both rejected |

---

## 11. Testing

Extends the existing suite; no new tooling.

| Test | Asserts |
|---|---|
| `Avatar` | Renders a photo when given one, initials when not |
| `CodeDisplay` | Formats `L8V7QK` as `L8V · 7QK`; the separator is absent from the accessible label |
| `CodeDisplay` a11y | The label spells characters individually |
| `CodeInput` | Typing advances, backspace retreats, paste fills all six |
| `CodeInput` | Emits only the six characters — never the separator |
| `DateField` | Rejects 31/02 and future dates; accepts a real birthday |
| `PhotoPicker` | Renders the add affordance; `onPick` fires |
| Pairing mock | Each reserved code returns its documented error |
| S02 | Submits name, nickname, birthday, pronouns; photo optional |
| S04 | Invalid code shows the message and keeps the entry |
| S06 | "That's not them" returns to S04 |
| S09 | "Yes, Connect Us" advances to S07 |
| Navigation | Every edge of the §8 table |
| Contrast | Extended with the new pairs from §5 |

---

## 12. Open items

1. **Figma is behind the code** — unchanged from the auth cluster, and now also true of this
   one. MCP writes need a paid tier; REST reads work.
2. **`SCREENS.md` node IDs for M01-S12…S17 are wrong.** The canonical source is the board, so
   the inventory's `(Final)` mappings must be corrected before Cluster 3. Not actioned here.
3. **Two stray Bricolage Grotesque nodes and one Material Symbols glyph** (D34) should be
   corrected in Figma.
4. **M01-S06 as screen vs sheet** (D37) — revisit once the flow is walked on a device.
5. **S11's exits are placeholders** until Cluster 3 exists.
6. **No device run for Module 00 yet** — carried forward; the web flow is verified.
7. **`expo-image-picker` deferred** to Phase 6, so the photo well is not yet wired.

---

## 13. Out of scope

A real backend, real invitations, deep links, push notifications, photo upload and storage,
the birthday/important-dates screens (Cluster 3), the home dashboard (Cluster 4), and dark
theme.
