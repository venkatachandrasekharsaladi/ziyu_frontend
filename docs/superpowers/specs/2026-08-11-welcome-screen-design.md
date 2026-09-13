# M00-S01 Welcome — Design

**Date:** 11 August 2026
**Screen:** M00-S01 "Welcome to LoveOS"
**Figma:** `t0FGzFLXoVXSUYa7mkjSbR` node `522:266`
**Status:** Implemented. Values corrected against `get_design_context`.
Outstanding: device verification and tests — see §11.

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
| D5 | Heading colour unified on `#33264A` | Welcome used `#33264A`, Sign In used `#1D1A21` — two near-blacks in one module is visual drift (`SCREENS.md` rule 6). `#33264A` carries the brand's purple cast. Verified AAA against both gradient stops — 13.14:1 and 10.69:1. |
| D6 | Tokens live in a **Unistyles theme** | `react-native-unistyles@3.3` is already a dependency. Loose token objects would duplicate a system the project already committed to. |
| D7 | Add `jest-expo` + `@testing-library/react-native` | No test framework exists. Setting the harness up at one screen is far cheaper than at thirty. |
| D8 | Not a `ScrollView` | A welcome screen that must scroll to reach its only button reads as broken. Layout flexes instead. |
| D9 | Theme is named `lavenderTheme`, not `lightTheme` | Only one theme exists and no dark design is planned. Naming it for its palette avoids implying a light/dark pair that does not exist. |
| D10 | Hero asset is Figma's 3× export with the multiply **divided back out** | The plain export bakes the page gradient in; the raw source is only 343×512. Inverting the bake gives 840×1218 detail *and* correct blending. See §6. |
| D11 | Bundle id pinned to `com.loveos.app` in `app.json` | `expo prebuild` had defaulted to `com.anonymous.loveosapp`. `brand.ts` warns this can never change post-publication, so it was corrected before any build was produced. |

### Decisions deliberately NOT taken here

`SCREENS.md` §1.1 asks whether the five auth screens become **Module 00** or
become `M01-S00a…e`. This spec builds the *screen*; it does not settle the
module numbering. That decision stays open and does not block implementation —
only the route path would change, and routes are cheap to move.

---

## 3. Colour palette

Values are read from `get_design_context` on node `522:266` — the authoritative
source. The Figma file defines **no variables**, so this table is the source of
truth for the app.

> **Superseded.** An earlier revision of this spec listed values sampled from a
> rendered screenshot. Three were wrong: the background is a gradient rather
> than the flat `#FCF6FF` (that was only its top stop), the link is its own
> lighter purple rather than `brand.primary`, and the button shadow is black
> rather than a purple tint. The table below replaces them.

| Token | Value | Role |
|---|---|---|
| `brand.primary` | `#381384` | Button fill, wordmark |
| `brand.link` | `#4F319B` | Secondary link label — **not** `brand.primary` |
| `text.heading` | `#33264A` | H1 |
| `text.body` | `#494552` | Body, caption |
| `text.onPrimary` | `#FFFFFF` | Label on filled button |
| `surface.gradientFrom` | `#FDF7FF` | Page background, top stop |
| `surface.gradientTo` | `#E8DDFF` | Page background, bottom stop |
| `border.subtle` | `#E6E0EA` | Outline button border |
| `shadow` | `rgba(0,0,0,0.1)` | Primary button, two stacked shadows |

The page background is a **180° linear gradient**, not a flat fill. The primary
button carries two shadows — `0 4px 6px -1px` and `0 2px 4px -2px`, both black
at 10% — which is why `boxShadow` is used rather than RN's single-shadow props.

`border.subtle` is the one token Welcome never paints; it exists because D3
settles `Button`'s `outline` variant now. `#7A7583` (placeholder) and `#CAC4D4`
(muted) are recorded here as observed but are **not** in the theme until the
screen consuming them is built, per D2.

**Excluded on purpose:** Google's `#34A853` `#4285F4` `#EA4335` `#FBBC05`.
They belong to the Google logo SVG, not the palette — admitting them invites
someone to use Google red as an error colour.

### Contrast verification

Every foreground is checked against **both** gradient stops, since the
background changes down the screen. `#E8DDFF` is the worst case.

| Pair | on `#FDF7FF` | on `#E8DDFF` | Level |
|---|---|---|---|
| `#33264A` heading | 13.14:1 | 10.69:1 | AAA |
| `#494552` body | 8.83:1 | 7.19:1 | AAA |
| `#381384` brand | 12.50:1 | 10.17:1 | AAA |
| `#4F319B` link | 8.87:1 | 7.22:1 | AAA |
| `#FFFFFF` on `#381384` button | 13.17:1 | — | AAA |

All pairs pass AAA at all sizes, worst case included.

---

## 4. Token layer

The scaffold already provides `tokens/` and `themes/` as separate directories,
so the two roles stay separate: `tokens/` holds raw values, `themes/` composes
them into the object Unistyles consumes.

```
src/design-system/tokens/
  colors.ts      — the values from §3
  spacing.ts     — xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24
                   heroInset 35        (4pt grid, + the hero's own inset)
  radii.ts       — md 16 · pill 9999
  typography.ts  — h1        40 / 44 / tracking -1   / Bold
                   wordmark  20 / 26 / tracking -0.5 / SemiBold
                   body      18 / 27                 / Regular
                   label     16 / 24                 / Regular
                   caption   11 / 15 / tracking 1.1  / SemiBold / uppercase

src/design-system/themes/
  theme.ts       — one lavenderTheme, `as const`, assembled from tokens/
  unistyles.ts   — StyleSheet.configure(...) + TS augmentation
```

**Typeface: Plus Jakarta Sans**, confirmed from Figma and installed via
`@expo-google-fonts/plus-jakarta-sans` in three weights (400/600/700). This
closes what was open item #1. Family strings in `typography.ts` must match the
keys registered with `useFonts` in `_layout.tsx` — a mismatch falls back to the
system font silently, with no error.

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
- Props: `variant: 'h1' | 'wordmark' | 'body' | 'label' | 'caption'`,
  `tone?: 'heading' | 'body' | 'brand' | 'link' | 'onPrimary'`,
  `align?: 'left' | 'center'`
- Wraps RN `Text`. **No `style` prop.** That omission is what keeps raw visual
  values out of screens, per the rule in `src/app/index.tsx`. A look this
  component cannot express is a new variant here, not an inline override there.

`src/design-system/primitives/Button.tsx`
- Props: `variant: 'primary' | 'link' | 'outline'`, `label`, `onPress`, `disabled?`
- Implemented with a Unistyles `variants` group + `styles.useVariants({ variant, disabled })`.
- `primary` — filled pill, `paddingVertical: 24` over a 24pt line box = 72pt
  tall, `brand.primary`, two stacked black-10% shadows via `boxShadow`,
  label `text.onPrimary`
- `link` — text-only, `brand.link` (`#4F319B`), `paddingVertical: 12` = 48pt
- `outline` — white fill, `border.subtle` 1pt, for M00-S02's Google/Apple
  buttons. Specced now, first rendered later.
- `accessibilityRole="button"`, `accessibilityState` reflects `disabled`.
- Guards against double-fire: a ref blocks re-entry for 600ms, long enough to
  swallow a double tap while navigation resolves, short enough that returning
  to the screen finds the button live.

**Not built:** `Input`, `Card`, `Divider`, `Badge`. Welcome does not use them.

---

## 6. Screen composition

The screen lives at `src/modules/module-00-auth/screens/WelcomeScreen.tsx`; the
route file only re-exports it. Five blocks match the Figma frame:

| Block | Component | Notes |
|---|---|---|
| Header | `BrandHeader` | `BRAND.name` wordmark, no back arrow |
| Hero | `HeroCollage` | `expo-image`, `contentFit="contain"`, `mixBlendMode: 'multiply'` |
| Copy | inline | h1 + body, strings from `src/copy/welcome.ts` |
| Actions | inline | primary "Get Started" + link "Already have an account? Sign In" |
| Footer | `PrivacyFooter` | lock SVG + caption, group opacity 0.8 |

Behind them, `AmbientLayer` absolutely positions the four heart/sparkle vectors.
It is marked `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`
and carries `pointerEvents: 'none'` in style, so decoration can never intercept
a tap meant for the button beneath it. Positions are expressed as **percentages**
rather than Figma's absolute offsets, so they hold their visual relationship on a
screen that is not 869.89pt tall.

The page gradient is drawn by `expo-linear-gradient` at the screen root.

### Assets

| Asset | Figma node | Notes |
|---|---|---|
| `assets/images/welcome/hero.png` | `522:288` | 840×1218 — see recipe below |
| 4 ambient vectors | `522:273`, `522:275`, `522:277`, `522:279` | SVG |
| lock icon | `522:282` | SVG |

#### Hero asset recipe — do not regenerate by plain export

The design applies `multiply` to the collage. Exporting that node **flattens the
blend**, baking the page gradient into the pixels — the export's corner reads
`#FBF5FF`, not white. Multiplying it again in the app double-darkens it and the
hero renders as a visible rectangle.

The raw source image is white-backed and correct for `multiply`, but it is only
343×512 — a 2.45× upscale at the 280×405.89pt display size on a 3× screen.

The committed asset is the 3× export with the bake divided back out:

```
artwork(x, y) = export(x, y) × 255 ÷ gradient(y)
```

where `gradient(y)` is the page gradient across the node's 405.89pt band
starting at y=66 within the 919.89pt frame. Verified two ways: the recovered
corner is exactly `(255,255,255)`, and re-multiplying reproduces Figma's own
export to within 1/255. This yields full 840×1218 detail *and* correct blending.

`contentFit="contain"` then reproduces Figma's inner offset for free — fitting
the artwork to a 280×405.89 box gives a 272pt width, centred, which is the
97.11% / 1.44% inset the design specifies.

---

## 7. Routing

```
src/app/index.tsx          → <Redirect href="/(auth)/welcome" />
src/app/(auth)/_layout.tsx → Stack, headerShown: false
src/app/(auth)/welcome.tsx → re-exports WelcomeScreen
src/app/(auth)/sign-in.tsx → stub, renders title only
src/app/(auth)/sign-up.tsx → stub, renders title only

src/modules/module-00-auth/screens/WelcomeScreen.tsx
src/modules/module-00-auth/components/{BrandHeader,AmbientLayer,HeroCollage,PrivacyFooter}.tsx
```

Route files stay thin — they map a URL to a screen and nothing else, so screen
implementations live in the module the scaffold already provides.

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

- **Hero fails to decode** — `aspectRatio` fixes the box height with or without
  pixels, so the layout cannot collapse. A background fill was considered and
  **rejected**: `multiply` composites against whatever sits behind it, so a
  solid colour there would blend the artwork against a flat block instead of the
  page gradient.
- **Double-tap during navigation** — `Button` ignores presses for 600ms after
  one fires.
- **Fonts fail to load** — `_layout.tsx` hides the splash screen on error as
  well as success, degrading to the system face rather than hanging on splash.
- **Copy drift** — `copy/welcome.ts` throws in `__DEV__` if the two headline
  lines stop matching `BRAND.tagline`, so the single-source rule fails loudly
  instead of rendering stale text.

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

1. ~~**Typeface.**~~ **Closed.** Plus Jakarta Sans, confirmed from Figma and
   installed via `@expo-google-fonts/plus-jakarta-sans`.
2. **Module numbering.** `SCREENS.md` §1.1 — Module 00 vs `M01-S00a…e`. The
   scaffold already ships `src/modules/module-00-auth/`, so the structure
   assumes Module 00; the inventory decision is still formally unrecorded.
3. **Sign In heading colour in Figma** still reads `#1D1A21`; per D5 it should
   be updated to `#33264A` so design and code agree.
4. **Device verification outstanding.** Built and checked via the web bundle
   only — no Android or iOS run yet. Three native-specific behaviours need
   confirming on hardware: `mixBlendMode: 'multiply'` on the hero (needs the
   New Architecture), `expo-image` rendering the five SVGs, and two stacked
   `boxShadow` layers on the primary button.
5. **Tests not yet written** (D7). Deferred until the palette was confirmed, so
   they would not need rewriting.

## 11a. Build prerequisites discovered during implementation

- **`babel.config.js` is mandatory** and did not exist. Unistyles 3 requires
  `['react-native-unistyles/plugin', { root: 'src' }]`; without it
  `StyleSheet.create` is never transformed and styles silently stop reacting to
  the theme. Reanimated 4 also moved its plugin to
  `react-native-worklets/plugin`, which must stay last.
- **`expo-dev-client` is a dependency**, so Expo Go cannot run this project — a
  custom dev build is required (`expo run:android` / `run:ios`).
- **`expo prebuild` defaulted the package to `com.anonymous.loveosapp`**,
  contradicting `brand.ts`. Corrected to `com.loveos.app` for both platforms
  before any build artifact existed (D11). The splash background was also moved
  off the Expo template's `#208AEF` blue to `#FDF7FF`.

---

## 12. Out of scope

Real authentication, Google/Apple OAuth, session persistence, the
session/pairing redirect, dark theme, and every screen after M00-S01.
