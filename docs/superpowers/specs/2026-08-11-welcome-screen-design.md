# M00-S01 Welcome — Design

**Date:** 11 August 2026
**Screen:** M00-S01 "Welcome to LoveOS"
**Figma:** `t0FGzFLXoVXSUYa7mkjSbR` node `522:266`
**Status:** Approved, ready for implementation planning

---

## 1. Goal

Build the first screen a new user sees, and with it establish the design-token
and primitive foundation that every later screen consumes.

**Done means:** the screen renders pixel-accurately on a device, and both
buttons navigate to placeholder Sign In / Sign Up screens. It is tappable
end-to-end. It does not include real authentication.

---

## 2. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Build Welcome (`522:266`) first, not Sign In (`522:53`) | Welcome is the true entry point; Sign In is reached *from* it. Welcome is pure presentation, so it establishes tokens without dragging in an auth provider. |
| D2 | Thin token slice, not a full design system | 111 of 136 screens have no design. Tokenising colours nobody has drawn is guesswork. |
| D3 | `Button` designed against **both** M00-S01 and M00-S02 | `SCREENS.md` rule 7 — components are settled across screens, not invented per screen. |
| D4 | `BRAND.tagline` → `"Your relationship. Beautifully kept."` | Design supersedes the older `brand.ts` string. Rule that the tagline lives only in `brand.ts` is preserved. |
| D5 | Heading colour unified on `#33264A` | Welcome used `#33264A`, Sign In used `#1D1A21` — two near-blacks in one module is visual drift (`SCREENS.md` rule 6). `#33264A` carries the brand's purple cast. Verified 13.03:1 contrast, AAA. |
| D6 | Tokens live in a **Unistyles theme** | `react-native-unistyles@3.3` is already a dependency. Loose token objects would duplicate a system the project already committed to. |
| D7 | Add `jest-expo` + `@testing-library/react-native` | No test framework exists. Setting the harness up at one screen is far cheaper than at thirty. |
| D9 | Theme is named `lavenderTheme`, not `lightTheme` | Only one theme exists and no dark design is planned. Naming it for its palette avoids implying a light/dark pair that does not exist. |
| D8 | Not a `ScrollView` | A welcome screen that must scroll to reach its only button reads as broken. Layout flexes instead. |

### Decisions deliberately NOT taken here

`SCREENS.md` §1.1 asks whether the five auth screens become **Module 00** or
become `M01-S00a…e`. This spec builds the *screen*; it does not settle the
module numbering. That decision stays open and does not block implementation —
only the route path would change, and routes are cheap to move.

---

## 3. Colour palette

Derived by sampling the rendered Figma nodes and cross-checking against Figma's
Selection colors panel. The file defines **no Figma variables**, so these values
were extracted by hand and are codified here as the source of truth.

| Token | Hex | Role |
|---|---|---|
| `brand.primary` | `#381384` | Button fill, wordmark, heart |
| `brand.primaryShadow` | `#381384` @ 30% | Primary button shadow |
| `text.heading` | `#33264A` | H1 |
| `text.body` | `#494552` | Body / subcopy |
| `text.onPrimary` | `#FFFFFF` | Label on filled button |
| `surface.base` | `#FCF6FF` | Screen background |
| `surface.soft` | `#E8DDFF` | Raised soft-purple surface, hero fallback |
| `border.subtle` | `#E6E0EA` | Outline button border |

`border.subtle` is the one token Welcome itself never paints — it exists because
D3 settles `Button`'s `outline` variant now. Nothing else is declared ahead of
use. `#7A7583` (placeholder) and `#CAC4D4` (muted) are recorded in §3 of this
document as observed values but are **not** added to the theme until the screen
that consumes them is built, per D2.

**Excluded on purpose:** Google's `#34A853` `#4285F4` `#EA4335` `#FBBC05`.
They belong to the Google logo SVG, not the palette — admitting them invites
someone to use Google red as an error colour.

### Contrast verification

| Pair | Ratio | Level |
|---|---|---|
| `#33264A` on `#FCF6FF` | 13.03:1 | AAA |
| `#494552` on `#FCF6FF` | 8.76:1 | AAA |
| `#381384` on `#FCF6FF` | 12.40:1 | AAA |
| `#FFFFFF` on `#381384` | 13.17:1 | AAA |

All pairs pass AAA at all sizes.

---

## 4. Token layer

The scaffold already provides `tokens/` and `themes/` as separate directories,
so the two roles stay separate: `tokens/` holds raw values, `themes/` composes
them into the object Unistyles consumes.

```
src/design-system/tokens/
  colors.ts      — the hex values from §3
  spacing.ts     — xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 32   (4pt grid)
  radii.ts       — md 16 · pill 999
  typography.ts  — h1      44 / line 1.0 / weight 700
                   body    17 / line 1.5 / weight 400
                   caption 11 / weight 600 / uppercase / letterSpacing 0.5

src/design-system/themes/
  theme.ts       — one lavenderTheme, `as const`, assembled from tokens/
  unistyles.ts   — StyleSheet.configure(...) + TS augmentation
```

Type roles bind to colour tokens at the theme layer, not in `tokens/` — `h1`
carries `text.heading`, `body` and `caption` carry `text.body`.

The theme is named `lavenderTheme` for its palette, not `lightTheme` for a
light/dark axis. There is only one theme: no dark design exists, and inventing
one guarantees rework. Registered as `themes: { lavender: lavenderTheme }` with
`settings.initialTheme: 'lavender'`. A second theme, if one is ever designed,
gets its own palette name rather than forcing this one to become "the light
variant" retroactively.

`themes/unistyles.ts` calls `StyleSheet.configure({ themes, breakpoints,
settings })` and is imported once at the top of `src/app/_layout.tsx`, before
any component that uses `StyleSheet.create` — Unistyles requires configuration
to run before the first styled component is imported. Breakpoints: `xs: 0,
md: 768`. TypeScript augmentation for `UnistylesThemes` lives beside it so
`theme` is typed at every call site.

---

## 5. Primitives

`src/design-system/primitives/Text.tsx`
- Props: `variant: 'h1' | 'body' | 'caption'`, `tone?: 'heading' | 'body' | 'brand'`
- Wraps RN `Text`. **No `style` prop.** That omission is what keeps raw visual
  values out of screens, per the rule in `src/app/index.tsx`.

`src/design-system/primitives/Button.tsx`
- Props: `variant: 'primary' | 'link' | 'outline'`, `label`, `onPress`, `disabled?`
- Implemented with a Unistyles `variants` group + `styles.useVariants({ variant })`.
- `primary` — filled pill, height 72, `brand.primary`, shadow from
  `brand.primaryShadow`, label `text.onPrimary`
- `link` — text-only, `brand.primary`, height 48
- `outline` — white fill, `border.subtle` 1pt, used by M00-S02's Google/Apple
  buttons. Specced now, first rendered later.
- Minimum touch target 44pt. `accessibilityRole="button"`.
- Guards against double-fire while a navigation is in flight.

**Not built:** `Input`, `Card`, `Divider`, `Badge`. Welcome does not use them.

---

## 6. Screen composition

`src/app/(auth)/welcome.tsx`, five blocks matching the Figma frame:

| Block | Content | Notes |
|---|---|---|
| `Header` | `BRAND.name` wordmark | 50pt tall, no back arrow |
| `HeroCollage` | `assets/images/welcome-hero.png` | `expo-image`, `contentFit="contain"` |
| `Copy` | h1 + body | Strings from `src/copy/welcome.ts` |
| `Actions` | primary "Get Started" + link "Already have an account? Sign In" | |
| `PrivacyFooter` | lock SVG + caption | |

Behind them, one absolutely-positioned decorative layer holds the four ambient
heart/sparkle vectors, marked `accessibilityElementsHidden` and
`importantForAccessibility="no-hide-descendants"` — they carry no meaning.

### Assets to export

| Asset | Figma node | Format |
|---|---|---|
| `welcome-hero.png` | `522:288` | PNG @2x/@3x — it is a single flat image node |
| 4 ambient vectors | `522:273`, `522:275`, `522:277`, `522:279` | SVG |
| lock icon | `522:282` | SVG |

---

## 7. Routing

```
src/app/index.tsx          → <Redirect href="/(auth)/welcome" />
src/app/(auth)/_layout.tsx → Stack, headerShown: false
src/app/(auth)/welcome.tsx → M00-S01
src/app/(auth)/sign-in.tsx → stub, renders title only
src/app/(auth)/sign-up.tsx → stub, renders title only
```

`index.tsx` loses its placeholder body entirely. The session/pairing logic its
comment describes replaces the redirect later without touching Welcome.

"Get Started" → `/(auth)/sign-up`. "Sign In" → `/(auth)/sign-in`.

---

## 8. Responsive and safe areas

The Figma frame is 390×920. An iPhone SE is 375×667 — 253pt shorter. Fixed
heights would push the primary button off-screen.

- Header and footer are pinned; the middle absorbs the difference.
- `HeroCollage` takes `flexShrink: 1` with a `maxHeight`, so it yields space first.
- Vertical rhythm comes from the spacing scale, never absolute offsets.
- Tablet: content centres at `maxWidth: 480` (`SCREENS.md` per-screen rule).
- `react-native-safe-area-context` supplies insets — header clears the notch,
  privacy footer clears the home indicator.

---

## 9. Error handling

Thin by nature: no network, no form, no async state.

- **Hero fails to decode** — a `surface.soft` block sits behind it, so the
  layout never collapses to zero height.
- **Double-tap during navigation** — `Button` ignores presses while a
  navigation is in flight.

---

## 10. Testing

Add `jest-expo` and `@testing-library/react-native`, plus a `test` script.

| Test | Asserts |
|---|---|
| `Button` renders all three variants | Correct label, `accessibilityRole="button"` |
| `Button` disabled | `onPress` not called |
| `Text` renders each variant | Correct string reaches output |
| Welcome renders | All five blocks present; headline and subcopy from `copy/` |
| Welcome navigation | "Get Started" → `/(auth)/sign-up`; "Sign In" → `/(auth)/sign-in` |
| Decorative layer | Hidden from the accessibility tree |

---

## 11. Open items

1. **Typeface.** The headline uses a specific geometric sans. `assets/` has no
   font files though `expo-font` is installed. Implementation assumes the
   system font. Matching Figma exactly needs the font file or its name.
2. **Module numbering.** `SCREENS.md` §1.1 — Module 00 vs `M01-S00a…e`. Affects
   the route path only.
3. **Sign In heading colour in Figma** still reads `#1D1A21`; per D5 it should
   be updated to `#33264A` so design and code agree.

---

## 12. Out of scope

Real authentication, Google/Apple OAuth, session persistence, the
session/pairing redirect, dark theme, and every screen after M00-S01.
