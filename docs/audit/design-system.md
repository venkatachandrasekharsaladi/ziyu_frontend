# LoveOS design system audit

Read-only audit of `src/design-system/`, `src/components/`, and `src/app/` routing/layout.
LoveOS is a two-person couples app: no admin, no roles, no backend yet (nothing persists).

## 1. Inventory

### `design-system/primitives/` (11)

| Component | Purpose |
|---|---|
| `Text.tsx:54` | The only way to render type — no `style` prop, by design. Variant + tone drive everything. |
| `Button.tsx:37` | The only button in the app. 4 variants (primary/soft/outline/link), built-in double-tap guard, loading spinner, disabled state that swaps fill+ink for contrast rather than dimming opacity. |
| `Input.tsx:74` | The only text field. Filled, radius 12, one control height. Invented focus/error/disabled states (Figma never drew them). |
| `Avatar.tsx:36` | Circular person avatar; falls back to initials, then to a labelled empty circle — never a silhouette. |
| `Card.tsx:15` | Bordered surface, generic container. |
| `CodeDisplay.tsx:31` | Read-only formatted pairing code (`L8V7QK` → `L8V · 7QK`), spelled out for screen readers. |
| `CodeInput.tsx:27` | Segmented code entry, one hidden `TextInput` behind N visual boxes. |
| `CountUp.tsx:29` | Animates a number counting up to a value; final value is always the accessible label; respects reduce-motion. |
| `DateField.tsx:63` | Typed `mm/dd/yyyy` birthday field, not a calendar picker (deliberate). Includes `isValidBirthday`. |
| `Divider.tsx:18` | Horizontal rule, optional centered label, always flexible width. |
| `SegmentedControl.tsx:30` | One-of-N segmented choice control (used for date precision). |

### `design-system/patterns/` (14)

| Component | Purpose |
|---|---|
| `AppHeader.tsx:25` | Top bar for `(app)` and `(onboarding)`: symmetric back-button/spacer + centered wordmark. |
| `AppScreenLayout.tsx:33` | Shared chrome for every `(app)` screen: header + 448pt-capped content column + `BottomNav`. Children optional so a loading screen can render chrome-only. |
| `BottomNav.tsx:36` | The 5-tab bottom bar. Renders not-yet-built tabs disabled rather than hiding them. |
| `EventRow.tsx:28` | One row inside a `SectionPanel`: icon tile + title + detail line. |
| `FooterPrompt.tsx:22` | "Prompt text + inline link" footer (e.g. "New to LoveOS? Create an account"). |
| `PhotoCarousel.tsx:34` | Swipeable paged photo strip with dots; degrades to a plain image for a single photo. |
| `PhotoLightbox.tsx:49` | Full-bleed photo viewer, opened by tapping any photo. |
| `PhotoPicker.tsx:24` | Circular photo well with add affordance; takes `onPick`, doesn't own the picker library (stubbed until Phase 6). |
| `PressableScale.tsx:28` | Generic "answers the touch" pressable wrapper (scale to 0.98), respects reduce-motion. |
| `SectionPanel.tsx:24` | Titled group: one soft surface holding a stack of row cards. |
| `SocialButton.tsx:36` | Google/Apple sign-in button. Monochrome glyph flagged as a placeholder pending OAuth branding compliance. |
| `StatusScreen.tsx:22` | Centered artwork + headline + lede + optional actions. Shared by onboarding's Connecting/Connected screens, and reused ad hoc as an empty-state layout elsewhere (see §2). |
| `ThemeToggle.tsx:25` | Self-contained lavender/midnight toggle button. |
| `ThemedStatusBar.tsx:17` | Status bar glyph color keyed to the active theme (not OS appearance). |

### `src/components/` (4 real components + 3 empty placeholder dirs)

| Component | Purpose |
|---|---|
| `feedback/FeedbackBanner.tsx:43` | Self-dismissing success/error toast. Announces via `AccessibilityInfo`, `accessibilityRole="alert"`. The one transient-message primitive in the app. |
| `feedback/ConfirmDialog.tsx:53` | Confirm/cancel modal, built on RN `Modal` specifically because `Alert.alert` has no web implementation (this was a real "Sign Out doesn't work on web" bug). |
| `forms/FormField.tsx:25` | The only file wiring `react-hook-form` to `Input`. Keeps the primitive form-library-agnostic. |
| `media/`, `moments/`, `navigation/`, `relationship/` | Empty — only `.gitkeep`. Scaffolded, unused. |

## 2. States — the verdict

**Improvised, not systematised.** There is no `EmptyState`, `LoadingState`, `ErrorState`, or offline component anywhere in `design-system/` or `components/`. Every screen writes its own:

- **Loading**: no spinner/skeleton convention. The pattern that recurs is "return chrome with no children" — e.g. `MemoriesHomeScreen.tsx:79` (`if (memories === null) return <AppScreenLayout activeTab="memories" />`), commented as a deliberate anti-flash choice, but that decision and its markup are re-derived per screen, not centralized. Only one `ActivityIndicator` outside `Button.tsx` exists in the whole app: `ConnectingScreen.tsx:77`, hand-built into that one screen.
- **Empty**: every list screen hand-rolls its own `X.length === 0 ? <bespoke markup> : <list>` branch: `MemoriesHomeScreen.tsx:81` (reuses `StatusScreen` + `Button`), `HomeDashboardScreen.tsx:288` (a raw `Card`+`Text`+`Button` block), `OccasionScreen.tsx:124` (just a `Text` line), `AlbumDetailScreen.tsx:75`, `OnThisDayScreen.tsx:126`, `CalendarScreen.tsx:172,222`, `PinnedAndSearchScreen.tsx:120`, `AlbumsScreen.tsx:38`. No two are visually identical (some get an illustration+heading+CTA via `StatusScreen`, some get one muted line of body text). `StatusScreen` is being asked to do double duty — it was built for onboarding status screens, not as a general empty-state component — and only some screens reach for it.
- **Error**: no error-state layout/illustration at all. `FeedbackBanner` covers a *transient* pass/fail toast (e.g. save failed), not a persistent "this screen failed to load" treatment. There's no retry affordance pattern.
- **Offline**: nothing. No `NetInfo`/connectivity check anywhere in `src/` (grepped for `NetInfo`, `isConnected`, `useNetInfo` — zero hits). Given there is no backend yet, this may be intentionally deferred, but there's no seam for it either (no wrapper, no hook stub).

This is the single biggest gap in an otherwise disciplined system: nothing about these four states has been extracted into a place a new screen would naturally reach for, so the next screen someone builds will invent a fifth variant of "empty" rather than importing one.

## 3. Missing components

Checked against `components/feedback/` (already has `FeedbackBanner`, `ConfirmDialog`) before flagging anything as absent.

1. **Empty/loading/error state components** (see §2) — the highest-value gap.
2. **Skeleton loader** — no shimmer/placeholder-block primitive; the "chrome-only, no spinner" convention has no shared visual for the content area itself.
3. **List row primitive** — `EventRow` is the closest thing, but it's specific to icon-tile+title+detail; `MemoryCard`/`PhotoMemoryCard` (module-level) and chat's row treatments are separate, unrelated implementations. There's no generic `ListRow`/`SectionHeader` pair a new list would reach for (`SectionPanel` covers grouping but not a header-only pattern used outside a panel).
4. **Badge/chip** — no small-status or tag component exists anywhere (checked `primitives/` and `patterns/`); a couples app will likely want this for tags on memories/occasions.
5. **Switch/toggle (generic)** — `ThemeToggle` is a bespoke on/off button for exactly one setting; there's no generic boolean `Switch` control for a settings screen that will need more than one toggle.
6. **Avatar stack / pair avatar** — `Avatar` renders one person; a two-person app will very likely want a "both partners" composed avatar (overlapping pair), which doesn't exist.
7. **Pull-to-refresh** — no `RefreshControl` wiring anywhere in `app/` or `modules/` screens sampled; all lists are static-render-then-improvise-empty.
8. **Tooltip** — none found; low priority for a two-person app with no complex UI to explain.
9. **Bottom sheet** — none found; `ConfirmDialog`'s centered-modal pattern is the only overlay idiom, no slide-up sheet for e.g. action menus.
10. **Date picker (calendar-style)** — explicitly and deliberately not built (`DateField.tsx:50-52`); this is a documented decision, not an oversight, and shouldn't be read as a gap.

Of these, items 1–3 matter most for a product (not prototype) at this stage; 4–7 are near-term needs as more screens land; 8–10 are lower priority or already deliberately excluded.

## 4. Navigation

- Three route groups exist as documented: `(auth)`, `(onboarding)`, `(app)` (`src/app/_layout.tsx:23-27`), each with its own `_layout.tsx` that simply sets `headerShown: false` and does nothing else (`src/app/(auth)/_layout.tsx:11`, `src/app/(onboarding)/_layout.tsx:11`, `src/app/(app)/_layout.tsx:11`).
- **No guard is actually implemented.** The root layout's comment states the intended access rules — `(auth)` skips when signed in, `(onboarding)` requires a session, `(app)` requires session + partner (`src/app/_layout.tsx:24-27`) — but no code enforces any of it. `src/app/index.tsx:12` unconditionally redirects to `/(auth)/welcome`, and nothing checks auth/pairing state before rendering `(app)` or `(onboarding)` screens. Any screen in any group is reachable directly today; this is explicitly flagged in the file's own comment as future work, not a design decision, so it should be tracked as an open gap rather than assumed to still be pending by accident.
- **Chrome consistency**: `(auth)` and `(onboarding)` both disable the stack header and let each screen draw its own top bar (documented as intentional per-screen variance — Welcome has no back arrow, Sign In does). `(app)` uses one consistent chrome (`AppScreenLayout` → `AppHeader` + `BottomNav`) across all its screens. So chrome is *consistent within* each group but the three groups don't share a chrome contract with each other — acceptable, since only `(app)` has persistent bottom nav needs.
- **Back behavior**: `AppHeader`'s back button is opt-in via an `onBack` prop (`AppHeader.tsx:9-11`); screens that don't pass it get a same-size empty spacer instead of a back arrow, so back-navigation is a per-screen choice, not automatic from the router stack. This is consistent but means a screen author must remember to wire it — nothing forces `onBack` when a screen is not a tab root.
- **BottomNav / `appNav.ts`**: 5 tabs (`home`, `memories`, `chat`, `timeline`, `profile`); `timeline` correctly ships `live: false` and renders disabled rather than hidden (`src/copy/appNav.ts:13`, `BottomNav.tsx:26-29`) — a considered choice, documented, and tested (accessibilityState.disabled is set, `BottomNav.tsx:74`).
- **Unreachable screens**: `timeline` has no route and an empty `href` (`appNav.ts:13`) — by design, not a bug. Everything else under `(app)` is reachable via router path or as a sub-route (chat moment screens, memories album/detail/new/search, occasions `[key]`), consistent with the file tree.

## 5. Theming and responsiveness

- Two themes, `lavender` (light) and `midnight` (dark), assembled from one explicit `ThemeColors` type (`theme.ts:17-129`) so adding a color to one theme and forgetting the other is a **compile error**, backed further by a runtime parity test (`theme.parity.test.ts`, referenced at `theme.ts:14-15`). This is unusually rigorous for a project this age.
- Non-color tokens (`control.height`, `spacing`, `radii`, `typography`, `elevation`, `layout`) are one shared object referenced by both themes (`theme.ts:138-155`) — dark mode is explicitly "a repaint, not a relayout." Good discipline.
- Dark mode does not follow the OS: themes are named for their palette (not `light`/`dark`), so Unistyles' `adaptiveThemes` is deliberately not used; the app always launches in `lavender` (`unistyles.ts:36`) and the user must opt into `midnight` via `ThemeToggle`. This is documented as intentional, and is genuinely complete as far as the token/theme layer goes — but note it currently is **not persisted** (`unistyles.ts:31-34`, explicit TODO-by-comment: "nothing in this app persists yet, on purpose"). So dark mode is complete as a *runtime* feature but resets to lavender on every app restart.
- **Breakpoints are essentially decorative.** `breakpoints.ts` defines `xs: 0` / `md: 768`, but a repo-wide grep for actual breakpoint-keyed variants (`variants: { md: ... }`, `breakpoints.md`, etc.) found exactly one file using anything at that scope (`CodeInput.tsx`), and it isn't even a breakpoint-variant usage. The only real responsiveness lever is `theme.layout.column` (448pt cap via `maxWidth`) applied in `AppScreenLayout.tsx:98-105` and its `AuthScreenLayout` counterpart — this only engages on tablet-or-wider viewports; **at 320pt it does nothing at all**, because the layout is `width: '100%'` up to that cap. In other words: the system is fluid-down/capped-up by design, and 320pt support is really just "does content wrap and not overflow," which was not verified here screen-by-screen.
- No `useBreakpoint`-style hook or responsive-variant helper exists, so if a real tablet-specific layout change (not just a width cap) is ever needed, there's no established pattern to reach for yet.

## 6. Accessibility

Genuinely disciplined in the primitives that exist:
- `Button` sets `accessibilityRole="button"`, `accessibilityState={{ disabled, busy }}`, and a real double-tap guard (`Button.tsx:74-79`); disabled state is a solid-fill/ink swap rather than opacity, specifically because opacity alone failed contrast (`Button.tsx:130-137`, documented against spec D20.4).
- `Avatar` always has an accessible label, even for an empty name (`Avatar.tsx:39,46-47`).
- `FeedbackBanner` and `ConfirmDialog` both call `AccessibilityInfo.announceForAccessibility` explicitly because `accessibilityLiveRegion` only works on Android and iOS VoiceOver ignores it — a real, correctly-diagnosed cross-platform gap (`FeedbackBanner.tsx:35-41`, `ConfirmDialog.tsx:65-70`).
- `SegmentedControl` carries selection via `accessibilityState.selected`, not color alone (`SegmentedControl.tsx:27-28`).
- `CodeDisplay` spells out characters individually for screen readers rather than reading the formatted string as a word (`CodeDisplay.tsx:27-29`).

Gaps found:
- **No heading semantics.** Grepped for `accessibilityRole="header"` across `src/` — zero hits. `Text`'s `h1`/`h2`/`h3` variants are purely visual; a screen reader has no way to jump between headings the way it does on web/native apps that set this role.
- **AppHeader's back button is 40×40** (`AppHeader.tsx:69-73`), under the 44pt touch-target guideline. `BottomNav`'s tab pills clear 44pt comfortably (icon 24 + label + padding).
- **No font-scaling ceiling anywhere**, which is good for scaling but combined with several *fixed*-height controls (`control.height: 56` for `Button`/`Input`/`SocialButton`, `AppHeader`'s 40pt edges) means large accessibility text sizes were not verified against clipping — nothing in the codebase caps or tests this.
- `chatContrast.test.ts` (full read) checks exactly four pairings — bubble ink on both bubble fills, ink on `accentSoft`, `accent` against the page, and label-on-`accent` — each ≥4.5:1, plus a regression guard that `chat.accent` is never the old Fuschia hex. It's narrow but well-targeted: chat is the one place many colors mix into text-bearing surfaces. It does **not** check `feedback.error`/`feedback.success` against the surfaces they render on, nor button/disabled states, nor placeholder text contrast — those live in the separate `theme.contrast.test.ts` (not read in depth here) if covered at all.
- `noUntokenisedColours.test.ts` (full read) statically greps every `.tsx`/`.ts` file outside `tokens/`/`themes/`/`test/` for raw hex or `rgba(...)` literals and fails the build if any exist outside an explicit, justified `DELIBERATE` allow-list (currently one entry: `PhotoLightbox`'s black scrim, justified inline). This is a strong, low-maintenance guard against the classic "one hardcoded color breaks dark mode" bug class. What it explicitly does **not** catch: colors expressed as a computed string/template (it's a regex over literal text) or a color introduced through a third-party component's own prop default — it is a static-source check, not a rendered-output check.

## 7. Component quality

- No duplication found among the design-system primitives/patterns themselves — the doc comments repeatedly call out *avoiding* a second implementation (e.g. `ThemeToggle` built on `Button` rather than a bespoke pressable, `SocialButton` explicitly kept as a pattern rather than a `Button` variant because it carries provider semantics).
- The one component doing more than one job is **`StatusScreen`**, being pressed into service as both "onboarding status" and, in at least `MemoriesHomeScreen`, "empty-state layout" — not because it's poorly built, but because there is no dedicated empty-state component and it is the closest fit (see §2/§3). This is worth splitting out explicitly rather than letting `StatusScreen` accrete more responsibilities as more screens reuse it for "empty."
- `Button`'s double-tap guard (`isHandling` ref + 600ms timeout) duplicates logic that would recur anywhere a similar pressable needs the same guard — currently fine since `Button` is genuinely "the only button in the app," but if `PressableScale` (a separate generic pressable primitive) ever needs the same guard, this logic should move to a shared hook rather than being copied.
- Module-level components sampled (`MemoryCard`, `PhotoMemoryCard`, per §2) are not part of the shared layer and were only checked for consumption patterns, not audited for quality — they appear to be the seed of a "list row" component that hasn't been promoted to `design-system/patterns/` yet.

## Summary

The token/theme layer, `Text`/`Button`/`Input` primitives, and the two accessibility-focused tests are unusually rigorous for a project this young — compile-time theme parity, a static hardcoded-color guard, and genuinely-diagnosed cross-platform accessibility fixes (live regions, `Alert.alert` on web) are not typical at this stage. The gaps are concentrated exactly where the brief expected: states (empty/loading/error/offline) are entirely improvised per screen with no shared component, several product-shape components (skeleton, badge, switch, pair-avatar, pull-to-refresh, bottom sheet) don't exist yet, and the three route groups have no actual auth/pairing guard behind their documented intent.
