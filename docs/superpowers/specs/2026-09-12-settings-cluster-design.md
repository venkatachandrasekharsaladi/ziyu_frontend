# Settings cluster — design

**Date:** 2026-09-12
**Status:** Approved, ready for implementation planning
**Module:** `src/modules/module-05-profile/`
**Routes:** `src/app/(app)/profile.tsx` + `src/app/(app)/settings/`

---

## 1. Purpose

The Profile tab is one screen today — `OurSpaceScreen`, which its own header
comment calls "a deliberate stub". It carries a heading, a lede, a theme toggle
and a sign-out button, and it says plainly why: sign-out and appearance had
nowhere else to live.

This document turns that stub into the app's settings cluster: 24 screens
covering account, privacy, preferences, billing, support, legal and account
deletion. It is a **frontend-only** build. No service is written, no network
call is made, no backend is touched.

## 2. Decisions taken

Seven decisions were made before design and they bound everything below.

| Decision | Choice | Consequence |
|---|---|---|
| Information architecture | The Profile tab **is** the settings list | No separate gear; the couple header sits above the settings groups on one screen |
| Detail navigation | Pushed full screens, **no bottom bar** | New `SettingsScreenLayout`; the hub keeps `AppScreenLayout` |
| Data layer | None | No new service, no network. Toggles write to a store; billing, sessions, storage sizes and invoices read local mock constants |
| Persistence | **In memory only** | No new dependency. Settings reset on launch, consistent with `relationshipStore`'s stated rule |
| Restart prompts | **Never** | A restart would wipe every setting, since nothing persists. Every setting applies live, language included |
| Build style | New row primitives + hand-written screens | Matches how the repo's other 60 screens are built; copy stays in `src/copy/` |
| Account deletion | Three gates: password, phone code, email code | Requires a phone number, which the app does not currently have — see §7 |

## 3. Architecture

Layered as every other module in this repo:

```
state/preferencesStore.ts        zustand, flat, named setters, reset()
  ↓
design-system/patterns/          SettingsRow, SettingsToggleRow,
                                 SettingsChoiceRow, DangerRow,
                                 SettingsScreenLayout
  ↓
module-05-profile/screens/       24 hand-written screens
  ↓
app/(app)/settings/*.tsx         one-line re-exports
```

Copy lives in `src/copy/settings*.ts`, one file per screen, as everywhere else.
No screen imports a service.

### 3.1 Ownership of state

`preferencesStore` owns **only** preferences that have no existing home:

- notifications (master, per-category, quiet hours, sound/vibration)
- chat (read receipts, typing indicator, auto-save media, voice auto-play,
  message text size)
- memories (On This Day, delivery time, default album, auto-add chat photos)
- privacy (app lock, hide notification content, online status, screenshot
  alerts)
- data (auto-download policy, upload quality)
- language & region (language, date format, clock, first day of week)
- accessibility (text size, reduce motion, haptics, high contrast)
- home layout (which dashboard cards, in which order)
- dates & reminders (lead times per date type)

It owns **nothing** that already has an owner:

| State | Stays in |
|---|---|
| Theme | `useThemeMode` — the single seam to `UnistylesRuntime` |
| Space name, short name, cover style | `spaceStore` |
| Profile fields, partner, pairing status | `relationshipStore` |
| Form values (Personal Details, Feedback, Delete) | `react-hook-form` — never lifted, per `ARCHITECTURE.md` |

### 3.2 Mock data

One `src/modules/module-05-profile/data/` folder holding plain constants:
`MOCK_PLAN`, `MOCK_INVOICES`, `MOCK_SESSIONS`, `MOCK_STORAGE`, `MOCK_FAQ`,
`MOCK_LICENSES`, `LEGAL_TERMS`, `LEGAL_PRIVACY`. Constants, not services —
there is no boundary here to swap, and inventing one would imply a backend
contract that has not been designed.

## 4. Navigation

```
(app)/profile.tsx              → SettingsHomeScreen        (hub, bottom bar)
(app)/settings/
  personal-details.tsx   verify-phone.tsx   partner.tsx    our-space.tsx
  privacy.tsx            security.tsx       data.tsx
  appearance.tsx         accessibility.tsx  notifications.tsx
  chat.tsx               memories.tsx       dates.tsx      home-layout.tsx
  language.tsx
  billing.tsx
  help.tsx               feedback.tsx
  about.tsx              legal/terms.tsx    legal/privacy.tsx
  legal/licenses.tsx
  delete-account.tsx
```

No new `_layout.tsx`. The `(app)` stack already supplies `ios_from_right`,
swipe-back, and the page-coloured `contentStyle` that kills the white flash
between pushes — settings inherit all of it.

`SettingsScreenLayout` is the one new layout: `ThemedStatusBar`, a top bar with
a back `IconButton` and the screen title, the same 350pt content column as
`AppScreenLayout`, the same `ScrollView` props (`keyboardDismissMode`,
`keyboardShouldPersistTaps`, `contentInsetAdjustmentBehavior`,
`overScrollMode`), and **no** `BottomNav`.

## 5. New primitives

Added to `src/design-system/patterns/`:

- **`SettingsRow`** — leading icon, label, optional secondary line, optional
  right-hand value, chevron. Wrapped in `PressableScale`. Renders as a static
  row when `onPress` is absent (version number, plan name).
- **`SettingsToggleRow`** — same anatomy with a `Switch` in place of the
  chevron. The label is the accessible name; the switch is not separately
  labelled.
- **`SettingsChoiceRow`** — label plus the existing `SegmentedControl`, for
  two- and three-way choices (Light / Dark / Auto).
- **`DangerRow`** — the destructive treatment for Log Out and Delete Account.
  Always paired with `ConfirmDialog`, never `Alert` — `Alert` has no
  implementation in react-native-web, which is the bug `ConfirmDialog` exists
  to fix.

Groups reuse the existing **`SectionPanel`**, which already renders a titled
surface holding inset rows. The couple header reuses `Avatar`, `Text` and
`CountUp`; `CountUp` animates the days-together figure.

## 6. Screens

### 6.1 Hub — `SettingsHomeScreen`

Replaces `OurSpaceScreen` at `(app)/profile`. Keeps that screen's heading and
lede (they are the only copy in it drawn from the design). Sign-out moves from
a standalone button into a `DangerRow`, keeping its `ConfirmDialog` and its
clear-then-navigate order — `reset()` before `router.replace`, so the welcome
screen can never read a previous couple's partner.

Couple header: both avatars, both names, days-together counter, space name.

| Group | Rows |
|---|---|
| Account | Personal Details · Partner & Pairing · Our Space |
| Privacy | Privacy & Security · Data & Storage |
| Preferences | Appearance `Dark` · Accessibility · Notifications · Chat · Memories & Story · Dates & Reminders · Home Layout · Language `English` |
| Plan | Billing & Subscription `Free` |
| Support | Help & FAQ · Contact & Feedback |
| About | About LoveOS `v1.0.0` · Terms · Privacy Policy · Licenses |
| — | **Log Out** · **Delete Account** |

### 6.2 Detail screens

1. **Personal Details** — photo (`PhotoPicker`), name, nickname (how your
   partner sees you), birthday (`DateField`), pronouns, email (read-only),
   **phone number with a verified/unverified badge and a Verify action**, Save.
   Fields mirror `pairing/types.ts` plus the new phone. `react-hook-form` +
   `zod`.
2. **Verify Phone** — country code, number, 6-digit `CodeInput`, resend
   countdown, wrong-code and expiry states. Reached from Personal Details and
   reused inside the delete flow.
3. **Partner & Pairing** — partner card and pairing date, your invite code via
   `CodeDisplay` with copy and share, Unlink partner (`DangerRow` + confirm).
4. **Our Space** — space name, short name, cover style (Dawn / Dusk / Night)
   with a live preview. Writes to `spaceStore`.
5. **Privacy & Security** — App Lock (PIN / biometric), hide notification
   content, show online status, screenshot alerts, link to Security & Sessions.
6. **Security & Sessions** — change password, two-factor, signed-in device list
   with "this device" marked, Sign out everywhere (`DangerRow` + confirm).
7. **Data & Storage** — storage used by photos / voice notes / videos / cache
   as a proportional bar, Clear cache, media auto-download (Wi-Fi only /
   always / never), upload quality, Download my data.
8. **Appearance** — Light / Dark / Auto via `SettingsChoiceRow` calling
   `useThemeMode().setMode`, plus a space cover preview link.
9. **Accessibility** — text size, reduce motion, haptics, high contrast.
   Reduce motion gates every entrance animation in the cluster.
10. **Notifications** — master switch, then messages, voice notes, new
    memories, On This Day, occasions & anniversaries, partner activity. Quiet
    hours with a from/to, sound and vibration.
11. **Chat** — read receipts, typing indicator, auto-save media to gallery,
    voice note auto-play, message text size, Clear chat history (confirm).
12. **Memories & Story** — On This Day resurfacing and delivery time, default
    album, auto-add photos shared in chat, memory reminders.
13. **Dates & Reminders** — your important dates and how far ahead each one
    reminds you (day before / week before / custom). Fills the gap behind the
    calendar's reminders section and occasion countdowns.
14. **Home Layout** — which dashboard cards appear (featured memory, coming up,
    little things) and in what order.
15. **Language & Region** — language, date format, 12/24 hour, first day of
    week. Applies live; never prompts for a restart.
16. **Billing & Subscription** — current plan card, what's included, the paid
    plan with price and Upgrade, payment method, invoices, Restore purchases.
    Reads `MOCK_PLAN` / `MOCK_INVOICES`. No button initiates a transaction.
17. **Help & FAQ** — searchable questions grouped by topic, expanding in place,
    with a "still stuck?" link to Contact.
18. **Contact & Feedback** — topic, message, optional screenshot, Send (success
    state, sends nowhere), Rate the app.
19. **About LoveOS** — wordmark, version and build, what the app is, credits,
    links out.
20. **Terms & Conditions** — sectioned long-form text with a last-updated date.
21. **Privacy Policy** — same treatment.
22. **Licenses** — every open-source dependency with its license type; tap for
    full text.
23. **Delete Account** — see §7.

**Legal text is marked placeholder.** `LEGAL_TERMS` and `LEGAL_PRIVACY` carry
honest placeholder prose with a visible note, not invented terms presented as
binding. A lawyer's copy replaces the constant before release.

## 7. Account deletion

One route, `settings/delete-account`, with steps held in component state and a
progress indicator. Back always means "back out of deleting", never "back one
sub-page".

1. **The warning** — what disappears: every memory and photo, the whole chat
   history, voice notes and video moments, the shared space and its story, the
   link to the partner. And what the partner is left with: that you left, and
   that the space is gone for them too.
2. **Download your data first** — link to Data & Storage.
3. **Why are you leaving?** — optional, skippable.
4. **Gate 1 — password.** Error in place; attempts limited.
5. **Gate 2 — code to phone.** `CodeInput`, resend countdown, expiry, wrong-code
   error. **If no verified phone is on file, this step becomes add-and-verify
   inline**, with an explanation of why it is required — the flow never
   dead-ends.
6. **Gate 3 — code to email.** Same component, same states. Both codes must be
   used in one session; backing out drops them.
7. **Final `ConfirmDialog`** — "This cannot be undone." Cancel is prominent.
8. **Done** — sign out, clear every store, `router.replace` to Welcome.

All three gates check mock values and reject everything else, so the failure,
resend, expiry and lockout states are exercised rather than drawn.

## 8. Motion and theme

Existing tokens only — `colors.ts`, `spacing.ts`, `radii.ts`, `typography.ts`,
`motion.ts`. No new palette. Sections stagger in via the existing `useEntrance`
pattern; rows respond through `PressableScale`; toggles animate. Every one of
those is gated on Accessibility → Reduce Motion.

Both themes are first-class: `lavender` and `midnight` are checked on every
screen, since the cluster is where a user switches between them.

## 9. Testing

- Each new primitive: renders, fires, carries the right accessible name.
- Hub: each row navigates to its route; Log Out clears state **before**
  navigating.
- Toggle screens: flipping a control writes the expected value to
  `preferencesStore`.
- Personal Details: validation, save, phone verified badge.
- Delete Account: wrong password blocked, wrong phone code blocked, wrong email
  code blocked, no progress without the final confirm, stores cleared on
  success.
- `npm run typecheck` and `npm run lint` clean.

## 10. Open items

1. **Persistence.** Settings reset each launch by decision. When persistence
   lands, `preferencesStore` is one file to wrap — and the restart-prompt
   pattern (§2) becomes worth building at that point, not before.
2. **Phone number has no backend contract.** It is added to the form and the
   store only. Whoever writes the real pairing/auth contract must add it to
   `Profile` in `services/pairing/types.ts`.
3. **Legal copy** is placeholder and marked as such.
4. **Billing has no product.** The screen assumes a single paid tier. If the
   pricing model differs, this screen changes before any payment SDK is chosen.
