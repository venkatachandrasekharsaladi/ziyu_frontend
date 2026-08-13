# M00 Auth Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the four remaining Module 00 auth screens (M00-S02…S05) and the shared design-system layer they force into existence, against the normalised design in `docs/superpowers/specs/2026-08-13-auth-cluster-design.md`.

**Architecture:** Three layers, strictly separated. `design-system/` holds tokens, primitives and patterns and imports no application dependency (D22). `components/forms/` bridges `react-hook-form` to `Input`. `modules/module-00-auth/` holds screens, screen-local components and zod schemas; `src/app/(auth)/` route files are thin re-exports. A mock `AuthService` behind a typed boundary stands in for a provider that does not exist yet (§11).

**Tech Stack:** Expo SDK 57 · React Native 0.86 · React 19.2 · expo-router · react-native-unistyles 3.3 · react-hook-form + zod · @expo/vector-icons · jest-expo + @testing-library/react-native

**Staging:** Stage 1 is Tasks 1–10 and ends with Sign In running. Stage 2 is Tasks 11–13 and is much faster because it reuses everything from Stage 1.

---

## Global Constraints

These apply to **every** task. They are copied verbatim from the spec and from the rules already in the codebase.

- **Never type "LoveOS" literally.** Read `BRAND.name` from `@/config/brand`. Rule is in that file.
- **`Text` has no `style` prop, and must not gain one.** A look it cannot express is a new variant in `Text`, not an inline override in a screen. Rule is in `src/design-system/primitives/Text.tsx`.
- **Nothing outside `themes/` imports `tokens/`.** Screens and components read semantic names off the theme, never a raw hex. Rule is in `src/design-system/tokens/colors.ts`.
- **One control height: 56pt** — primary, soft and outline buttons, social buttons, and inputs (D14).
- **Primary button label is `labelStrong`** (16/24 SemiBold), never 20/26 (D15).
- **Primary button shadow is black at 10%, two stacks** — never a purple tint (D16).
- **No fourth font weight.** Only `400Regular`, `600SemiBold`, `700Bold` are registered in `_layout.tsx`. `Medium` (500) must not be used; it falls back silently.
- **Field borders are `border.field` (`#CAC4D4`). Dividers and button outlines are `border.subtle` (`#E6E0EA`).** These are not interchangeable.
- **Error state never relies on colour alone.** When `error` is set, a message is always rendered.
- **`radii.md` is being removed.** Only `Button` referenced the radii group, via `pill`. Do not reintroduce `md`.
- **Contrast floor: WCAG AA (4.5:1) for all text.** Four values in the Figma designs fail this and are deliberately overridden (D20). Task 2's test enforces the whole table.
- **Commit after every task**, using the message given in that task's final step. No `Co-Authored-By` trailer.

### Testing convention — `render` is async

**`@testing-library/react-native` v14's `render` is an async function.** So are
`rerender` and `unmount`. Every call must be awaited and every test callback
declared `async`:

```tsx
it('renders', async () => {
  await render(<Thing />)          // NOT: render(<Thing />)

  expect(screen.getByText('x')).toBeTruthy()
})
```

Without the `await`, `render` returns an unresolved Promise, `screen` is still
its default stub, and every query throws a misleading **"`render` function has
not been called"** — pointing at the assertion rather than the missing await.
This was hit and fixed in Task 1; the snippets below are already correct.

`userEvent.press` / `userEvent.type` are also async, and take the element as
their first argument. For fake timers, use
`userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`.

### Known testing limitation — read before writing any test

`react-native-unistyles` is a native Nitro module and cannot execute under Jest. The package ships its own mock at `react-native-unistyles/mocks`, which Task 1 wires into `setupFiles`. **That mock strips `variants` and `compoundVariants` from every stylesheet and makes `useVariants` a no-op.**

Consequences, which every later task depends on:

1. **Variant-driven style values are not assertable in unit tests.** Button height, input focus/error borders, disabled fills — all live in `variants` blocks and are absent at test time. Never write `expect(x).toHaveStyle({ height: 56 })` for a variant value; it fails for a reason unrelated to your code.
2. **Base (non-variant) style properties do survive** the mock, so they can be asserted.
3. Therefore tests assert **behaviour, structure and accessibility** — text content, roles, `accessibilityState`, `accessibilityLabel`, callbacks, conditional children — plus **pure values** from tokens, schemas and services.
4. Variant→style resolution is verified **on device**, tracked in the spec's open items. This is a real gap, recorded honestly rather than papered over with tests that pass for the wrong reason.

---

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `jest.config.js` | Jest wiring: `jest-expo` preset, Unistyles mock, theme configuration |
| `src/design-system/tokens/elevation.ts` | The five shadow recipes as `boxShadow` strings |
| `src/design-system/primitives/Input.tsx` | Label + field + error, all four states, secure toggle |
| `src/design-system/primitives/Card.tsx` | Bordered surface |
| `src/design-system/primitives/Divider.tsx` | Rule, optionally with a centred label |
| `src/design-system/patterns/AppHeader.tsx` | Translucent top bar; back button optional |
| `src/design-system/patterns/SocialButton.tsx` | Google / Apple provider button |
| `src/design-system/patterns/FooterPrompt.tsx` | "Prompt text + inline link" line |
| `src/components/forms/FormField.tsx` | `react-hook-form` `Controller` → `Input` |
| `src/services/auth/types.ts` | `AuthService`, `AuthError`, `Result` |
| `src/services/auth/mock.ts` | Deterministic in-memory implementation |
| `src/services/auth/index.ts` | Swap point — exports the mock today |
| `src/modules/module-00-auth/state/authSchemas.ts` | zod schemas + the password rule list |
| `src/modules/module-00-auth/components/AuthMedallion.tsx` | 96pt rounded heart medallion (S02) |
| `src/modules/module-00-auth/components/EnvelopeIllustration.tsx` | 192pt envelope illustration (S04) |
| `src/modules/module-00-auth/components/PasswordRequirements.tsx` | Live rule checklist (S03) |
| `src/modules/module-00-auth/components/AuthScreenLayout.tsx` | Background + glow + scroll + keyboard behaviour |
| `src/modules/module-00-auth/screens/SignInScreen.tsx` | M00-S02 |
| `src/modules/module-00-auth/screens/CreateAccountScreen.tsx` | M00-S03 |
| `src/modules/module-00-auth/screens/VerifyEmailScreen.tsx` | M00-S04 |
| `src/modules/module-00-auth/screens/ForgotPasswordScreen.tsx` | M00-S05 |
| `src/copy/{signIn,createAccount,verifyEmail,forgotPassword}.ts` | Per-screen copy |
| `src/app/(auth)/{verify-email,forgot-password}.tsx` | New routes |
| `src/test/contrast.ts` | WCAG ratio maths, used by the token test |

**Modified**

| File | Change |
|---|---|
| `package.json` | Dependencies + `test` script |
| `src/design-system/tokens/colors.ts` | 6 new palette values |
| `src/design-system/tokens/typography.ts` | `h2`, `labelStrong`, `footnote`, `countdown` |
| `src/design-system/tokens/spacing.ts` | `xxxl`, `huge` |
| `src/design-system/tokens/radii.ts` | Remove `md`; add `field`, `medallion` |
| `src/design-system/themes/theme.ts` | Bind everything above; add `feedback`, `control` |
| `src/design-system/primitives/Text.tsx` | 4 variants, 4 tones |
| `src/design-system/primitives/Button.tsx` | Height, label weight, `soft`, `trailing`, `loading`, new disabled |
| `src/app/(auth)/{sign-in,sign-up}.tsx` | Replace stubs with re-exports |
| `src/modules/module-00-auth/screens/WelcomeScreen.tsx` | `BrandHeader` → `AppHeader` |

**Deleted**

| File | Reason |
|---|---|
| `src/modules/module-00-auth/components/BrandHeader.tsx` | Superseded by `patterns/AppHeader.tsx` (§7) |

---

# STAGE 1 — Shared design system + Sign In

## Task 1: Toolchain — dependencies, Jest, and a smoke test

This task exists to **prove the Unistyles + Jest path works** before thirteen tasks depend on it. If the smoke test cannot be made to pass, stop and report rather than proceeding.

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`
- Test: `src/design-system/primitives/__tests__/Text.smoke.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test`. Every later task's tests rely on `jest.config.js` wiring `react-native-unistyles/mocks` and then `@/design-system/themes/unistyles` into `setupFiles`, in that order.

- [ ] **Step 1: Install runtime dependencies**

```bash
npx expo install react-hook-form @hookform/resolvers zod @expo/vector-icons
```

`zod` is listed explicitly even though it already resolves transitively at 3.25.76 — relying on that is a silent break waiting to happen (D28). Use `npx expo install`, never `npm install`, so versions match the SDK.

- [ ] **Step 2: Install test dependencies**

```bash
npx expo install --dev jest-expo jest @testing-library/react-native @types/jest
```

- [ ] **Step 3: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Create `jest.config.js`**

```js
/**
 * Unistyles is a native Nitro module and cannot run under Jest, so the package's
 * own mock is loaded first — it calls `jest.mock` for both `react-native-unistyles`
 * and `react-native-nitro-modules`.
 *
 * ORDER MATTERS. The mock must register before `themes/unistyles` runs, because
 * that file calls `StyleSheet.configure(...)`, and the mock's `configure` is what
 * populates the theme registry that `useUnistyles()` reads back.
 *
 * NOTE: the mock strips `variants` and `compoundVariants`, and `useVariants` is a
 * no-op. Variant style values are therefore NOT assertable in tests. See the
 * plan's "Known testing limitation".
 */
module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    'react-native-unistyles/mocks',
    '<rootDir>/src/design-system/themes/unistyles.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
}
```

- [ ] **Step 5: Write the smoke test**

`src/design-system/primitives/__tests__/Text.smoke.test.tsx`

```tsx
import { render, screen } from '@testing-library/react-native'

import { Text } from '@/design-system/primitives/Text'

describe('test harness', () => {
  it('renders a Unistyles-styled primitive without touching native code', async () => {
    await render(<Text variant="body">Harness is alive</Text>)

    expect(screen.getByText('Harness is alive')).toBeTruthy()
  })
})
```

- [ ] **Step 6: Run it**

Run: `npm test -- Text.smoke`
Expected: PASS, 1 test.

If it fails with `Cannot find module 'react-native-unistyles/mocks'`, the install did not complete. If it fails inside `NitroModules.createHybridObject`, `setupFiles` order is wrong — the mock must be first. If it fails on the `@/` import, `moduleNameMapper` is wrong.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json jest.config.js src/design-system/primitives/__tests__/Text.smoke.test.tsx
git commit -m "Add test harness and auth cluster dependencies

Installs jest-expo + @testing-library/react-native, closing the Welcome
spec's open item 5, plus react-hook-form, zod and @expo/vector-icons.

zod is declared explicitly rather than relied on transitively (D28).

Unistyles is a native Nitro module, so its own Jest mock is loaded in
setupFiles before themes/unistyles configures the theme registry. That
mock strips variants, so variant style values are not assertable in unit
tests - recorded in the plan and verified on device instead."
```

---

## Task 2: Tokens, theme, and the contrast test

**Files:**
- Modify: `src/design-system/tokens/colors.ts`, `typography.ts`, `spacing.ts`, `radii.ts`
- Create: `src/design-system/tokens/elevation.ts`, `src/test/contrast.ts`
- Modify: `src/design-system/themes/theme.ts`
- Test: `src/design-system/themes/__tests__/theme.contrast.test.ts`

**Interfaces:**
- Consumes: Task 1's harness.
- Produces: `theme.colors.{brand,text,surface,border,feedback}`, `theme.control.height` (`56`), `theme.elevation.{control,field,card,medallion,illustration}`, `theme.typography.{h1,h2,wordmark,body,label,labelStrong,footnote,caption,countdown}`, `theme.spacing.{xs,sm,md,lg,xl,xxl,xxxl,huge,heroInset}`, `theme.radii.{field,medallion,pill}`.

- [ ] **Step 1: Write the failing contrast test**

`src/test/contrast.ts` — pure WCAG 2.1 maths, no dependencies:

```ts
/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * Four of this cluster's decisions are contrast fixes (spec D20). Without a test,
 * a later "tidy the palette" commit silently undoes them.
 */
function channel(value: number): number {
  const c = value / 255

  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const n = hex.replace('#', '')
  const r = channel(parseInt(n.slice(0, 2), 16))
  const g = channel(parseInt(n.slice(2, 4), 16))
  const b = channel(parseInt(n.slice(4, 6), 16))

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(foreground: string, background: string): number {
  const a = luminance(foreground)
  const b = luminance(background)
  const [light, dark] = a > b ? [a, b] : [b, a]

  return (light + 0.05) / (dark + 0.05)
}
```

`src/design-system/themes/__tests__/theme.contrast.test.ts`

```ts
import { lavenderTheme as t } from '@/design-system/themes/theme'
import { contrast } from '@/test/contrast'

const AA = 4.5

describe('theme contrast', () => {
  const { text, surface, brand, border, feedback } = t.colors

  it.each([
    ['heading on page',      text.heading,     surface.page],
    ['body on page',         text.body,        surface.page],
    ['brand on page',        brand.primary,    surface.page],
    ['link on page',         brand.link,       surface.page],
    ['onPrimary on brand',   text.onPrimary,   brand.primary],
    ['placeholder on field', text.placeholder, surface.field],
    ['placeholder on page',  text.placeholder, surface.page],
    ['placeholder on card',  text.placeholder, surface.card],
    ['error on page',        feedback.error,   surface.page],
    ['error on field',       feedback.error,   surface.field],
    ['success on card',      feedback.success, surface.card],
    ['disabled label',       text.body,        border.field],
  ])('%s meets AA', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA)
  })

  it('does not reintroduce the placeholder that fails AA', async () => {
    // #7A7583 was the Figma value. At 100% it reaches only 4.03:1 on the field
    // fill; at the 50% opacity Figma actually used, roughly 2.1:1. (D20.1)
    expect(contrast('#7A7583', surface.field)).toBeLessThan(AA)
    expect(t.colors.text.placeholder).not.toBe('#7A7583')
  })

  it('keeps text.muted away from text roles', async () => {
    // #CAC4D4 is decorative only. On the white card it scores ~1.7:1, which is
    // what made S03's requirement rows unreadable. (D20.3)
    expect(contrast(t.colors.text.muted, surface.card)).toBeLessThan(AA)
  })

  it('uses one control height everywhere', async () => {
    expect(t.control.height).toBe(56)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- theme.contrast`
Expected: FAIL — `surface.page`, `surface.field`, `surface.card`, `text.placeholder`, `feedback`, and `control` do not exist yet.

- [ ] **Step 3: Extend the colour palette**

In `src/design-system/tokens/colors.ts`, add to `palette` (raw names only — semantic names are bound in `themes/`, per the file's own rule):

```ts
  /** Input fill. Sits between lavender50 and lavender200. Figma 522:77. */
  lavender100: '#F8F1FB',

  /** Field border. Darker than greyLavender200. Figma 522:77, 522:145, 522:173. */
  greyLavender300: '#CAC4D4',

  /**
   * Placeholder ink. Figma draws #7A7583 at 50%, which scores ~2.1:1 on
   * lavender100 and fails WCAG AA; even at full opacity it reaches only 4.03:1.
   * Darkened to clear AA at 4.52:1. See spec D20.1.
   */
  ink400: '#726D7B',

  /**
   * Feedback. Both INVENTED — no Figma frame draws an error or success colour,
   * and the Welcome spec deliberately kept Google's #EA4335 out of the palette
   * so it could not become one. The crimson is carried toward magenta so it
   * reads as part of a lavender palette rather than a system alert.
   */
  crimson600: '#A81E3C',
  green700: '#1F7A55',

  /** Page background glow, top centre. Figma 522:54. */
  glowLavender: 'rgba(206, 189, 255, 0.4)',
```

- [ ] **Step 4: Extend typography**

In `src/design-system/tokens/typography.ts`, add:

```ts
  /** Screen headline on every form screen. Figma 522:167, 522:242. */
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
  },
  /** Button labels. SemiBold supplies the emphasis Figma reached for with 20pt. */
  labelStrong: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** Requirement rows, field error messages. Figma 522:191. */
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** Resend timer on M00-S04. Figma 522:263. */
  countdown: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
```

`caption` is unchanged. S02 and S05 draw its tracking at 0.55; they conform to the existing 1.1 rather than the token bending to them.

- [ ] **Step 5: Extend spacing and rewrite radii**

Add to `spacing`:

```ts
  xxxl: 32,
  huge: 48,
```

Replace the whole `radii` object in `src/design-system/tokens/radii.ts`:

```ts
export const radii = {
  /** Inputs and cards. Figma 522:77, 522:183. */
  field: 12,
  /** The M00-S02 medallion. Figma 522:68. */
  medallion: 32,
  /** Buttons. Figma draws 9999; named so the intent survives. */
  pill: 9999,
} as const
```

`md: 16` is removed. A grep of `src/` shows `Button.tsx` was the only consumer of this group and it uses `pill`.

- [ ] **Step 6: Create elevation tokens**

`src/design-system/tokens/elevation.ts`

```ts
/**
 * ELEVATION TOKENS — `boxShadow` strings.
 *
 * RN's single-shadow props cannot express two stacked shadows, so `boxShadow`
 * is used throughout. Collected here so the strings stop being retyped per
 * component, and so the black-vs-purple decision (spec D16) lives in one place.
 */
export const elevation = {
  /** Buttons. Black at 10%, two stacks. NOT a purple tint — see spec D16. */
  control:
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
  /** Inputs. Figma 522:77. */
  field: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  /** Cards. Figma 522:183. */
  card: '0px 4px 6px 0px rgba(103, 75, 181, 0.05)',
  /** M00-S02 medallion. Figma 522:68. */
  medallion: '0px 8px 24px 0px rgba(79, 49, 155, 0.15)',
  /** M00-S04 envelope. Figma 522:248. */
  illustration:
    '0px 12px 32px 0px rgba(103, 75, 181, 0.12), 0px 2px 8px 0px rgba(103, 75, 181, 0.04)',
} as const

export type Elevation = typeof elevation
```

- [ ] **Step 7: Bind it all in the theme**

Rewrite `src/design-system/themes/theme.ts`:

```ts
import { palette } from '@/design-system/tokens/colors'
import { elevation } from '@/design-system/tokens/elevation'
import { radii } from '@/design-system/tokens/radii'
import { spacing } from '@/design-system/tokens/spacing'
import { typography } from '@/design-system/tokens/typography'

/**
 * THE THEME — semantic names over raw values.
 *
 * Named `lavender` for its palette, not `light` for a light/dark axis. Only one
 * theme exists and no dark design has been drawn.
 */
export const lavenderTheme = {
  colors: {
    brand: {
      primary: palette.purple900,
      /** Secondary link label. Deliberately NOT primary — Figma 522:301. */
      link: palette.purple700,
    },
    text: {
      heading: palette.ink900,
      body: palette.ink600,
      placeholder: palette.ink400,
      /**
       * DECORATIVE ONLY. Never text a user must read: it scores ~1.7:1 on the
       * card fill, which is what made S03's requirement rows unreadable (D20.3).
       */
      muted: palette.greyLavender300,
      onPrimary: palette.white,
    },
    surface: {
      /** Form screens: a flat fill plus a glow. NOT a gradient — see spec D18. */
      page: palette.lavender50,
      /** M00-S01 only: the hero gradient's stops. */
      gradientFrom: palette.lavender50,
      gradientTo: palette.lavender200,
      /** Input fill, and the `soft` button variant. */
      field: palette.lavender100,
      card: palette.white,
      soft: palette.lavender200,
      glow: palette.glowLavender,
    },
    border: {
      /** Dividers and button outlines. */
      subtle: palette.greyLavender200,
      /** Inputs only. Not interchangeable with `subtle`. */
      field: palette.greyLavender300,
    },
    feedback: {
      error: palette.crimson600,
      success: palette.green700,
    },
    shadow: palette.shadowSoft,
  },
  /** One height for buttons, social buttons and inputs alike (spec D14). */
  control: {
    height: 56,
  },
  spacing,
  radii,
  typography,
  elevation,
} as const

export type AppTheme = typeof lavenderTheme
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- theme.contrast`
Expected: PASS, 15 tests.

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. `WelcomeScreen.tsx` still compiles — it reads `surface.gradientFrom` / `gradientTo`, both retained.

- [ ] **Step 10: Commit**

```bash
git add src/design-system src/test
git commit -m "Extend design tokens for the auth cluster

Adds the input fill, field border, placeholder ink, invented error and
success colours, and the page glow. Adds h2, labelStrong, footnote and
countdown type roles, spacing 32/48, and an elevation module so the
boxShadow strings stop being retyped per component.

radii.md is removed - it had no consumers - and replaced by field 12 and
medallion 32. One control height, 56pt, is now a token.

The contrast test asserts the whole WCAG table, including two negative
assertions that pin the values Figma got wrong. Four of this cluster's
decisions are contrast fixes; without this test a later palette tidy-up
would silently undo them."
```

---

## Task 3: Text — new variants and tones

**Files:**
- Modify: `src/design-system/primitives/Text.tsx`
- Test: `src/design-system/primitives/__tests__/Text.test.tsx`

**Interfaces:**
- Consumes: `theme.typography`, `theme.colors` from Task 2.
- Produces: `TextVariant = 'h1' | 'h2' | 'wordmark' | 'body' | 'label' | 'labelStrong' | 'footnote' | 'caption' | 'countdown'`; `TextTone = 'heading' | 'body' | 'placeholder' | 'muted' | 'brand' | 'link' | 'error' | 'success' | 'onPrimary'`.

- [ ] **Step 1: Write the failing test**

`src/design-system/primitives/__tests__/Text.test.tsx`

```tsx
import { render, screen } from '@testing-library/react-native'

import { Text, type TextTone, type TextVariant } from '@/design-system/primitives/Text'

const VARIANTS: TextVariant[] = [
  'h1', 'h2', 'wordmark', 'body', 'label', 'labelStrong', 'footnote', 'caption', 'countdown',
]
const TONES: TextTone[] = [
  'heading', 'body', 'placeholder', 'muted', 'brand', 'link', 'error', 'success', 'onPrimary',
]

describe('Text', () => {
  it.each(VARIANTS)('renders the %s variant', async (variant) => {
    await render(<Text variant={variant}>Content</Text>)

    expect(screen.getByText('Content')).toBeTruthy()
  })

  it.each(TONES)('renders the %s tone', async (tone) => {
    await render(<Text tone={tone}>Content</Text>)

    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('forwards accessibilityRole, so an inline link can be a link', async () => {
    render(
      <Text>
        Prompt <Text tone="brand" accessibilityRole="link">Act</Text>
      </Text>,
    )

    expect(screen.getByRole('link')).toBeTruthy()
  })

  it('nests for mixed-style lines without needing a style prop', async () => {
    render(
      <Text variant="label" tone="body">
        New here? <Text variant="label" tone="brand">Create an account</Text>
      </Text>,
    )

    expect(screen.getByText(/New here\?/)).toBeTruthy()
    expect(screen.getByText('Create an account')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- Text.test`
Expected: FAIL — TypeScript rejects `'h2'`, `'labelStrong'`, `'footnote'`, `'countdown'`, `'placeholder'`, `'muted'`, `'error'`, `'success'`.

- [ ] **Step 3: Extend the primitive**

In `src/design-system/primitives/Text.tsx`, replace the two type aliases and the two variant groups:

```tsx
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'wordmark'
  | 'body'
  | 'label'
  | 'labelStrong'
  | 'footnote'
  | 'caption'
  | 'countdown'

export type TextTone =
  | 'heading'
  | 'body'
  | 'placeholder'
  | 'muted'
  | 'brand'
  | 'link'
  | 'error'
  | 'success'
  | 'onPrimary'
```

and inside `StyleSheet.create`:

```tsx
      variant: {
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        wordmark: theme.typography.wordmark,
        body: theme.typography.body,
        label: theme.typography.label,
        labelStrong: theme.typography.labelStrong,
        footnote: theme.typography.footnote,
        caption: theme.typography.caption,
        countdown: theme.typography.countdown,
      },
      tone: {
        heading: { color: theme.colors.text.heading },
        body: { color: theme.colors.text.body },
        placeholder: { color: theme.colors.text.placeholder },
        muted: { color: theme.colors.text.muted },
        brand: { color: theme.colors.brand.primary },
        link: { color: theme.colors.brand.link },
        error: { color: theme.colors.feedback.error },
        success: { color: theme.colors.feedback.success },
        onPrimary: { color: theme.colors.text.onPrimary },
      },
```

The `style` prop stays absent. Nesting works without new API because `TextProps` is `Omit<RNTextProps, 'style'>`, so `onPress` and `accessibilityRole` already pass through `...rest`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Text.test`
Expected: PASS, 20 tests.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/Text.tsx src/design-system/primitives/__tests__/Text.test.tsx
git commit -m "Add h2, labelStrong, footnote and countdown to Text

Plus placeholder, muted, error and success tones. The style prop stays
absent - that omission is what keeps raw visual values out of screens.

Mixed-style lines (the 'New to LoveOS? Create an account' footer) need no
new API: TextProps already forwards onPress and accessibilityRole, so our
Text nests inside itself and RN handles inheritance."
```

---

## Task 4: Button — height, weight, soft variant, trailing slot, loading, disabled

**Files:**
- Modify: `src/design-system/primitives/Button.tsx`
- Test: `src/design-system/primitives/__tests__/Button.test.tsx`

**Interfaces:**
- Consumes: `Text` (Task 3), `theme.control.height`, `theme.elevation.control`.
- Produces: `ButtonVariant = 'primary' | 'soft' | 'outline' | 'link'`; props `{ label, onPress, variant?, disabled?, loading?, trailing?, accessibilityLabel? }`.

Remember: **height, fill and shadow live in `variants` and are stripped by the Jest mock.** Assert behaviour and accessibility only.

- [ ] **Step 1: Write the failing test**

`src/design-system/primitives/__tests__/Button.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { Button, type ButtonVariant } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'

const VARIANTS: ButtonVariant[] = ['primary', 'soft', 'outline', 'link']

describe('Button', () => {
  it.each(VARIANTS)('renders the %s variant as a button with its label', async (variant) => {
    await render(<Button label="Sign In" onPress={() => {}} variant={variant} />)

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeTruthy()
  })

  it('calls onPress once when tapped', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('ignores a second tap inside the double-fire guard window', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} />)
    const button = screen.getByRole('button')

    await userEvent.press(button)
    await userEvent.press(button)

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled, and reports it', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} disabled />)

    const button = screen.getByRole('button')
    await userEvent.press(button)

    expect(onPress).not.toHaveBeenCalled()
    expect(button.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('renders the trailing slot', async () => {
    render(
      <Button
        label="Resend Email"
        onPress={() => {}}
        trailing={<Text variant="countdown" tone="onPrimary">00:59</Text>}
      />,
    )

    expect(screen.getByText('00:59')).toBeTruthy()
  })

  it('when loading, keeps its label, reports busy, and ignores presses', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} loading />)

    const button = screen.getByRole('button')
    await userEvent.press(button)

    // The label is deliberately kept rather than swapped for a bare spinner:
    // replacing it loses what is happening.
    expect(screen.getByText('Sign In')).toBeTruthy()
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true })
    expect(onPress).not.toHaveBeenCalled()
  })

  it('replaces the trailing slot with the spinner while loading', async () => {
    render(
      <Button
        label="Resend Email"
        onPress={() => {}}
        trailing={<Text variant="countdown" tone="onPrimary">00:59</Text>}
        loading
      />,
    )

    expect(screen.queryByText('00:59')).toBeNull()
  })

  it('lets a caller override the screen-reader label', async () => {
    render(
      <Button label="Sign In" onPress={() => {}} accessibilityLabel="Sign in to LoveOS" />,
    )

    expect(screen.getByRole('button', { name: 'Sign in to LoveOS' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- Button.test`
Expected: FAIL — `'soft'` is not a variant, and `loading` / `trailing` are not props.

- [ ] **Step 3: Rewrite the primitive**

`src/design-system/primitives/Button.tsx`

```tsx
import { type ReactNode, useCallback, useRef } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text, type TextTone } from '@/design-system/primitives/Text'

export type ButtonVariant = 'primary' | 'soft' | 'outline' | 'link'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  /** Shows a spinner, blocks presses, and reports `busy`. */
  loading?: boolean
  /** Content after the label — M00-S02's arrow, M00-S04's countdown. */
  trailing?: ReactNode
  /** Overrides the label read out by a screen reader. */
  accessibilityLabel?: string
}

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  soft: 'brand',
  outline: 'brand',
  link: 'link',
}

/**
 * The only button in the app.
 *
 * All four variants share one height (spec D14) and one label role,
 * `labelStrong` (D15). Figma drew five different primary buttons across the
 * five M00 screens; this is the one they normalise to.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  trailing,
  accessibilityLabel,
}: ButtonProps) {
  const isBlocked = disabled || loading

  styles.useVariants({ variant, disabled: isBlocked })

  const { theme } = useUnistyles()

  // Navigation is not instant. Without this guard a fast double tap pushes the
  // destination twice and the user has to press back twice to escape.
  const isHandling = useRef(false)

  const handlePress = useCallback(() => {
    if (isHandling.current) return

    isHandling.current = true
    onPress()

    // Long enough to swallow a double tap, short enough that a user returning
    // to this screen finds the button live again.
    setTimeout(() => {
      isHandling.current = false
    }, 600)
  }, [onPress])

  const tone = isBlocked && variant === 'primary' ? 'body' : LABEL_TONE[variant]

  return (
    <Pressable
      onPress={handlePress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={styles.pressable}
    >
      <View style={styles.content}>
        <Text variant="labelStrong" tone={tone} align="center">
          {label}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? theme.colors.text.onPrimary : theme.colors.brand.primary}
          />
        ) : (
          trailing
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    width: '100%',
    variants: {
      variant: {
        primary: {
          height: theme.control.height,
          backgroundColor: theme.colors.brand.primary,
          boxShadow: theme.elevation.control,
        },
        soft: {
          height: theme.control.height,
          backgroundColor: theme.colors.surface.field,
        },
        outline: {
          height: theme.control.height,
          backgroundColor: theme.colors.surface.card,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        },
        link: {
          paddingVertical: theme.spacing.md,
        },
      },
      disabled: {
        // NOT opacity. Dimming the fill renders white on an effective #9A85C2,
        // about 3.22:1 — permitted for an inactive control, but illegible. A
        // solid grey fill with body-ink text reaches 5.48:1. See spec D20.4.
        true: {
          backgroundColor: theme.colors.border.field,
          borderColor: theme.colors.border.field,
          boxShadow: 'none',
        },
        false: {},
      },
    },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
}))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Button.test`
Expected: PASS, 12 tests.

- [ ] **Step 5: Run the whole suite — Welcome's button changed**

Run: `npm test`
Expected: PASS. `WelcomeScreen` has no tests yet, so nothing breaks; its button silently becomes 56pt with a SemiBold label, which is change 1 of the two in spec §9.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/primitives/Button.tsx src/design-system/primitives/__tests__/Button.test.tsx
git commit -m "Normalise Button: one height, one label weight, four variants

Figma drew five different primary buttons across the five M00 screens -
three heights, three label sizes, four shadow colours. This is the one
they normalise to: 56pt, labelStrong, black two-stack shadow.

Adds the soft variant (from M00-S04), an optional trailing slot for
M00-S02's arrow and M00-S04's countdown, and a loading state that keeps
the label and reports busy rather than swapping in a bare spinner.

Disabled stops using opacity 0.5, which rendered white text at about
3.22:1. A solid fill with body ink reaches 5.48:1.

This also applies change 1 of 2 to the already-built Welcome screen, so
Welcome now needs re-verification (spec section 9)."
```

---

## Task 5: Input

The load-bearing new primitive. Three of its four states are invented — no Figma frame draws focus, error or disabled.

**Files:**
- Create: `src/design-system/primitives/Input.tsx`
- Test: `src/design-system/primitives/__tests__/Input.test.tsx`

**Interfaces:**
- Consumes: `Text` (Task 3), `theme.colors.{surface.field,border.field,feedback.error}`, `theme.control.height`, `theme.radii.field`, `theme.elevation.field`.
- Produces: props `{ label, value, onChangeText, placeholder?, error?, secure?, labelTrailing?, keyboardType?, autoComplete?, autoCapitalize?, editable?, onBlur? }`.

- [ ] **Step 1: Write the failing test**

`src/design-system/primitives/__tests__/Input.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'

describe('Input', () => {
  it('renders its label and placeholder', async () => {
    render(
      <Input
        label="Email address"
        value=""
        onChangeText={() => {}}
        placeholder="you@example.com"
      />,
    )

    expect(screen.getByText('Email address')).toBeTruthy()
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
  })

  it('labels the field for a screen reader using its visible label', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.getByLabelText('Email address')).toBeTruthy()
  })

  it('reports typing', async () => {
    const onChangeText = jest.fn()
    await render(<Input label="Email address" value="" onChangeText={onChangeText} />)

    await userEvent.type(screen.getByLabelText('Email address'), 'a')

    expect(onChangeText).toHaveBeenCalled()
  })

  it('renders the error message, so the state never rests on colour alone', async () => {
    render(
      <Input
        label="Email address"
        value="nope"
        onChangeText={() => {}}
        error="Enter a valid email address"
      />,
    )

    expect(screen.getByText('Enter a valid email address')).toBeTruthy()
  })

  it('exposes the error to a screen reader without a visual scan', async () => {
    render(
      <Input
        label="Email address"
        value="nope"
        onChangeText={() => {}}
        error="Enter a valid email address"
      />,
    )

    const field = screen.getByLabelText('Email address')

    expect(field.props.accessibilityHint).toBe('Enter a valid email address')
    expect(field.props.accessibilityInvalid).toBe(true)
  })

  it('renders no error region when there is no error', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.queryByTestId('input-error')).toBeNull()
  })

  it('masks a secure field and offers a labelled reveal toggle', async () => {
    await render(<Input label="Password" value="hunter2" onChangeText={() => {}} secure />)

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true)
    expect(screen.getByRole('button', { name: 'Show password' })).toBeTruthy()
  })

  it('unmasks when the toggle is pressed, and relabels it', async () => {
    await render(<Input label="Password" value="hunter2" onChangeText={() => {}} secure />)

    await userEvent.press(screen.getByRole('button', { name: 'Show password' }))

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false)
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy()
  })

  it('renders no toggle on a non-secure field', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders a labelTrailing slot beside the label', async () => {
    render(
      <Input
        label="Password"
        value=""
        onChangeText={() => {}}
        secure
        labelTrailing={<Text variant="caption" tone="brand">Forgot password?</Text>}
      />,
    )

    expect(screen.getByText('Forgot password?')).toBeTruthy()
  })

  it('blocks editing when not editable', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} editable={false} />)

    expect(screen.getByLabelText('Email address').props.editable).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- Input.test`
Expected: FAIL — `Cannot find module '@/design-system/primitives/Input'`.

- [ ] **Step 3: Write the primitive**

`src/design-system/primitives/Input.tsx`

```tsx
import { Feather } from '@expo/vector-icons'
import { type ReactNode, useCallback, useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type InputProps = {
  label: string
  value: string
  onChangeText: (next: string) => void
  placeholder?: string
  /** When set, the message is ALWAYS rendered — the state never rests on colour. */
  error?: string
  /** Masks the value and renders a reveal toggle. */
  secure?: boolean
  /** Sits on the label row, right-aligned. M00-S02's "Forgot password?". */
  labelTrailing?: ReactNode
  keyboardType?: TextInputProps['keyboardType']
  autoComplete?: TextInputProps['autoComplete']
  autoCapitalize?: TextInputProps['autoCapitalize']
  editable?: boolean
  onBlur?: () => void
}

/**
 * The only text field in the app.
 *
 * Figma drew three different treatments across three screens. This is the one
 * they normalise to: filled, radius 12, one control height, label above (spec
 * D17). The inset-label version on M00-S03 was rejected — it is a
 * floating-label pattern needing a focus animation the design never specifies,
 * and as drawn it vanishes the moment the user types.
 *
 * Focus, error and disabled are INVENTED. No frame draws them.
 */
export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  labelTrailing,
  keyboardType,
  autoComplete,
  autoCapitalize = 'none',
  editable = true,
  onBlur,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const state = !editable ? 'disabled' : error ? 'error' : isFocused ? 'focused' : 'rest'

  styles.useVariants({ state })

  const { theme } = useUnistyles()

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const toggleReveal = useCallback(() => setIsRevealed((previous) => !previous), [])

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="caption" tone="body">
          {label}
        </Text>
        {labelTrailing}
      </View>

      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          secureTextEntry={secure && !isRevealed}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={error}
          accessibilityInvalid={Boolean(error)}
          style={styles.textInput}
        />

        {secure ? (
          <Pressable
            onPress={toggleReveal}
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}
            style={styles.toggle}
          >
            <Feather
              name={isRevealed ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.text.placeholder}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View testID="input-error">
          <Text variant="footnote" tone="error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.control.height,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    variants: {
      state: {
        rest: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.border.field,
          boxShadow: theme.elevation.field,
        },
        // Focus intensifies the border the field already has, rather than
        // introducing a new mechanism, and adds a ring as a second cue.
        focused: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.brand.primary,
          boxShadow: '0px 0px 0px 3px rgba(56, 19, 132, 0.12)',
        },
        error: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.feedback.error,
          boxShadow: theme.elevation.field,
        },
        // Reads as inert by losing its fill, not by dimming its legibility.
        disabled: {
          backgroundColor: theme.colors.surface.page,
          borderColor: theme.colors.border.subtle,
          boxShadow: 'none',
        },
      },
    },
  },
  textInput: {
    flex: 1,
    ...theme.typography.label,
    color: theme.colors.text.heading,
    // Android adds its own vertical padding, which breaks the 56pt box.
    paddingVertical: 0,
  },
  toggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -theme.spacing.sm,
  },
}))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Input.test`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/Input.tsx src/design-system/primitives/__tests__/Input.test.tsx
git commit -m "Add the Input primitive

Figma drew three different text fields across three screens. This is the
one they normalise to: filled, radius 12, 56pt, label above. M00-S03's
inset label was rejected - it is a floating-label pattern needing a focus
animation the design never specifies, and it vanishes on first keystroke.

Focus, error and disabled are invented; no frame draws them. Focus
intensifies the existing border and adds a ring, so it is not carried by
colour alone. An error always renders its message, and reaches a screen
reader through accessibilityHint and accessibilityInvalid.

Secure fields own their reveal toggle, whose accessibilityLabel flips
between Show and Hide password."
```

---

## Task 6: Card and Divider

**Files:**
- Create: `src/design-system/primitives/Card.tsx`, `src/design-system/primitives/Divider.tsx`
- Test: `src/design-system/primitives/__tests__/Card.test.tsx`, `src/design-system/primitives/__tests__/Divider.test.tsx`

**Interfaces:**
- Consumes: `Text` (Task 3), theme tokens (Task 2).
- Produces: `Card` props `{ children }`; `Divider` props `{ label? }`.

- [ ] **Step 1: Write the failing tests**

`src/design-system/primitives/__tests__/Card.test.tsx`

```tsx
import { render, screen } from '@testing-library/react-native'

import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'

describe('Card', () => {
  it('renders its children', async () => {
    render(
      <Card>
        <Text>Password security</Text>
      </Card>,
    )

    expect(screen.getByText('Password security')).toBeTruthy()
  })
})
```

`src/design-system/primitives/__tests__/Divider.test.tsx`

```tsx
import { render, screen } from '@testing-library/react-native'

import { Divider } from '@/design-system/primitives/Divider'

describe('Divider', () => {
  it('renders a label between two rules', async () => {
    await render(<Divider label="Or continue with" />)

    expect(screen.getByText('Or continue with')).toBeTruthy()
    expect(screen.getAllByTestId('divider-rule')).toHaveLength(2)
  })

  it('renders a single rule with no label', async () => {
    await render(<Divider />)

    expect(screen.getAllByTestId('divider-rule')).toHaveLength(1)
  })

  it('gives its rules flex, never a fixed width', async () => {
    // M00-S02 drew each rule at a fixed 93.37pt, which only holds at exactly
    // 390pt wide. Anything else leaves a gap or overlaps the label.
    await render(<Divider label="Or continue with" />)

    for (const rule of screen.getAllByTestId('divider-rule')) {
      const style = Array.isArray(rule.props.style)
        ? Object.assign({}, ...rule.props.style.filter(Boolean))
        : rule.props.style

      expect(style.flex).toBe(1)
      expect(style.width).toBeUndefined()
    }
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -- Card.test Divider.test`
Expected: FAIL — both modules missing.

- [ ] **Step 3: Write Card**

`src/design-system/primitives/Card.tsx`

```tsx
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type CardProps = {
  children: ReactNode
}

/**
 * A bordered surface. First consumed by M00-S03's password requirements.
 *
 * Figma draws the padding at 25, which is off the 4pt grid by 1. The grid wins;
 * the 1pt deviation is recorded in the spec rather than given a token.
 */
export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
  },
}))
```

- [ ] **Step 4: Write Divider**

`src/design-system/primitives/Divider.tsx`

```tsx
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type DividerProps = {
  /** When present, the rule splits either side of it. */
  label?: string
}

/**
 * A horizontal rule, optionally with a centred label.
 *
 * The rules are always flexible. M00-S02 drew them at a fixed 93.37pt each,
 * a width that only holds at exactly 390pt.
 */
export function Divider({ label }: DividerProps) {
  if (!label) {
    return <View style={styles.rule} testID="divider-rule" />
  }

  return (
    <View style={styles.container}>
      <View style={styles.rule} testID="divider-rule" />
      <Text variant="caption" tone="body">
        {label}
      </Text>
      <View style={styles.rule} testID="divider-rule" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: theme.spacing.xxl,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.subtle,
  },
}))
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- Card.test Divider.test`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/primitives/Card.tsx src/design-system/primitives/Divider.tsx src/design-system/primitives/__tests__/Card.test.tsx src/design-system/primitives/__tests__/Divider.test.tsx
git commit -m "Add Card and Divider primitives

Divider's rules are flexible by construction, with a test that asserts
it: M00-S02 drew each at a fixed 93.37pt, which only holds at exactly
390pt wide and breaks at every other width.

Card's padding follows the 4pt grid at 24 rather than Figma's off-grid 25."
```

---

## Task 7: AppHeader, SocialButton, FooterPrompt

**Files:**
- Create: `src/design-system/patterns/AppHeader.tsx`, `SocialButton.tsx`, `FooterPrompt.tsx`
- Delete: `src/modules/module-00-auth/components/BrandHeader.tsx`
- Modify: `src/modules/module-00-auth/screens/WelcomeScreen.tsx`
- Test: `src/design-system/patterns/__tests__/{AppHeader,SocialButton,FooterPrompt}.test.tsx`

**Interfaces:**
- Consumes: `Text`, `Button` (Tasks 3–4), theme tokens.
- Produces: `AppHeader` props `{ onBack? }`; `SocialButton` props `{ provider: 'google' | 'apple', onPress, disabled? }`; `FooterPrompt` props `{ text, linkLabel, onPress }`.

- [ ] **Step 1: Write the failing tests**

`src/design-system/patterns/__tests__/AppHeader.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { BRAND } from '@/config/brand'
import { AppHeader } from '@/design-system/patterns/AppHeader'

describe('AppHeader', () => {
  it('shows the wordmark from BRAND, never a literal', async () => {
    await render(<AppHeader />)

    expect(screen.getByText(BRAND.name)).toBeTruthy()
  })

  it('renders no back button when onBack is absent', async () => {
    await render(<AppHeader />)

    expect(screen.queryByRole('button', { name: 'Go back' })).toBeNull()
  })

  it('renders a back button when onBack is given, and calls it', async () => {
    const onBack = jest.fn()
    await render(<AppHeader onBack={onBack} />)

    await userEvent.press(screen.getByRole('button', { name: 'Go back' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('always renders both edge slots, so the wordmark is centred by symmetry', async () => {
    // M00-S05 centred its wordmark with padding-right: 158.7px, which only
    // looks centred at exactly 390pt. A matching spacer centres it at any width.
    await render(<AppHeader />)
    expect(screen.getAllByTestId('header-edge')).toHaveLength(2)

    await render(<AppHeader onBack={() => {}} />)
    expect(screen.getAllByTestId('header-edge')).toHaveLength(2)
  })
})
```

`src/design-system/patterns/__tests__/SocialButton.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { SocialButton } from '@/design-system/patterns/SocialButton'

describe('SocialButton', () => {
  it.each([
    ['google', 'Google'],
    ['apple', 'Apple'],
  ] as const)('renders the %s provider', async (provider, label) => {
    await render(<SocialButton provider={provider} onPress={() => {}} />)

    expect(screen.getByRole('button', { name: `Continue with ${label}` })).toBeTruthy()
    expect(screen.getByText(label)).toBeTruthy()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()
    await render(<SocialButton provider="google" onPress={onPress} />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled', async () => {
    const onPress = jest.fn()
    await render(<SocialButton provider="apple" onPress={onPress} disabled />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
  })
})
```

`src/design-system/patterns/__tests__/FooterPrompt.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'

describe('FooterPrompt', () => {
  it('renders the prompt and the link', async () => {
    render(
      <FooterPrompt text="New to LoveOS?" linkLabel="Create an account" onPress={() => {}} />,
    )

    expect(screen.getByText(/New to LoveOS\?/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Create an account' })).toBeTruthy()
  })

  it('calls onPress when the link is pressed', async () => {
    const onPress = jest.fn()
    render(
      <FooterPrompt text="New to LoveOS?" linkLabel="Create an account" onPress={onPress} />,
    )

    await userEvent.press(screen.getByRole('link'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -- AppHeader SocialButton FooterPrompt`
Expected: FAIL — three modules missing.

- [ ] **Step 3: Write AppHeader**

`src/design-system/patterns/AppHeader.tsx`

```tsx
import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { BRAND } from '@/config/brand'
import { Text } from '@/design-system/primitives/Text'

type AppHeaderProps = {
  /** When given, a back button is rendered. Omit on an entry-point screen. */
  onBack?: () => void
}

/**
 * The app's top bar. Replaces the auth module's BrandHeader, because Modules
 * 01+ use it too.
 *
 * Both edge slots are ALWAYS rendered — a 40pt back button or a 40pt spacer —
 * so the wordmark is centred by symmetry. M00-S05 centred it with an
 * asymmetric `padding-right: 158.7`, which only looks right at exactly 390pt.
 *
 * The heart beside the wordmark is the brand lockup. Only M00-S02 drew it,
 * because it is the only frame that got a header pass.
 */
export function AppHeader({ onBack }: AppHeaderProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.edge}
          testID="header-edge"
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text.heading} />
        </Pressable>
      ) : (
        <View style={styles.edge} testID="header-edge" />
      )}

      <View style={styles.lockup}>
        <Feather name="heart" size={14} color={theme.colors.brand.primary} />
        <Text variant="wordmark" tone="brand">
          {BRAND.name}
        </Text>
      </View>

      <View style={styles.edge} testID="header-edge" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    // Figma specifies an 80% fill behind a 6pt blur. The fill is what carries
    // the effect; expo-glass-effect is deferred until the flat version is
    // verified on device (spec open item 7).
    backgroundColor: theme.colors.surface.page,
    opacity: 0.98,
  },
  edge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
```

- [ ] **Step 4: Write SocialButton**

`src/design-system/patterns/SocialButton.tsx`

```tsx
import { AntDesign } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export type SocialProvider = 'google' | 'apple'

type SocialButtonProps = {
  provider: SocialProvider
  onPress: () => void
  disabled?: boolean
}

const PROVIDER = {
  google: { label: 'Google', icon: 'google' },
  apple: { label: 'Apple', icon: 'apple1' },
} as const

/**
 * Google / Apple sign-in button.
 *
 * A pattern rather than a Button variant because it carries provider
 * semantics, not just a look. Pill-shaped at the shared control height: every
 * other button in the app is a pill, and radius 12 is reserved for fields and
 * cards. M00-S02's label was Medium (500), a weight not registered in
 * `_layout.tsx` — it is SemiBold here.
 *
 * OPEN ITEM: Google's Sign-In branding guidelines require the official
 * multi-colour mark. This monochrome glyph is a stand-in and must be replaced
 * before OAuth ships. See spec open item 3.
 */
export function SocialButton({ provider, onPress, disabled = false }: SocialButtonProps) {
  const { label, icon } = PROVIDER[provider]
  const { theme } = useUnistyles()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      accessibilityState={{ disabled }}
      style={styles.button}
    >
      <View style={styles.content}>
        <AntDesign name={icon} size={20} color={theme.colors.text.heading} />
        <Text variant="labelStrong" tone="heading">
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    flex: 1,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
}))
```

Add `heading` to `Text`'s tones if it is missing — Task 3 defines it.

- [ ] **Step 5: Write FooterPrompt**

`src/design-system/patterns/FooterPrompt.tsx`

```tsx
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type FooterPromptProps = {
  text: string
  linkLabel: string
  onPress: () => void
}

/**
 * "Prompt text + inline link" — M00-S02's "New to LoveOS? Create an account"
 * and M00-S03's mirror of it.
 *
 * M00-S02 underlined the link at 30% opacity, which reads as a rendering
 * fault. Colour already distinguishes it, which is how M00-S03 drew it.
 */
export function FooterPrompt({ text, linkLabel, onPress }: FooterPromptProps) {
  return (
    <View style={styles.container}>
      <Text variant="label" tone="body" align="center">
        {`${text} `}
        <Text variant="label" tone="brand" onPress={onPress} accessibilityRole="link">
          {linkLabel}
        </Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    paddingVertical: theme.spacing.xxl,
  },
}))
```

- [ ] **Step 6: Swap Welcome onto AppHeader and delete BrandHeader**

In `src/modules/module-00-auth/screens/WelcomeScreen.tsx`, replace the import

```tsx
import { BrandHeader } from '@/modules/module-00-auth/components/BrandHeader'
```

with

```tsx
import { AppHeader } from '@/design-system/patterns/AppHeader'
```

and the usage `<BrandHeader />` with `<AppHeader />` — no `onBack`, because Welcome is the entry point and there is nowhere back to. This is change 2 of the two in spec §9.

```bash
git rm src/modules/module-00-auth/components/BrandHeader.tsx
```

- [ ] **Step 7: Run the tests and the whole suite**

Run: `npm test`
Expected: PASS, all tests. Then `npx tsc --noEmit` — no errors.

- [ ] **Step 8: Commit**

```bash
git add -A src/design-system/patterns src/modules/module-00-auth
git commit -m "Add AppHeader, SocialButton and FooterPrompt patterns

AppHeader replaces the auth module's BrandHeader and moves to the design
system, because Modules 01+ use it too. Both edge slots always render -
a back button or a spacer - so the wordmark is centred by symmetry. M00-S05
centred it with an asymmetric 158.7pt right padding, which only looks
right at exactly 390pt wide.

This applies change 2 of 2 to the Welcome screen: it gains the heart
lockup and loses BrandHeader.

SocialButton is a pattern, not a Button variant, because it carries
provider semantics. Its label is SemiBold rather than Figma's Medium,
which is not a registered weight and would fall back silently. Google's
mark is a monochrome stand-in and is brand-non-compliant until the
official multi-colour glyph replaces it - spec open item 3.

FooterPrompt drops M00-S02's 30%-opacity underline, which reads as a
rendering fault."
```

---

## Task 8: The auth service boundary

**Files:**
- Create: `src/services/auth/types.ts`, `mock.ts`, `index.ts`
- Test: `src/services/auth/__tests__/mock.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Result<T> = { ok: true; value: T } | { ok: false; error: AuthError }`
  - `type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'NETWORK' | 'UNKNOWN'`
  - `type AuthError = { code: AuthErrorCode }`
  - `type Session = { userId: string; email: string; emailVerified: boolean }`
  - `AuthService = { signIn(i), signUp(i), requestPasswordReset(i), resendVerification(i) }`

- [ ] **Step 1: Write the failing test**

`src/services/auth/__tests__/mock.test.ts`

```ts
import { createMockAuthService } from '@/services/auth/mock'

describe('mock auth service', () => {
  const auth = createMockAuthService({ latencyMs: 0 })

  it('signs in with any unreserved address', async () => {
    const result = await auth.signIn({ email: 'a@example.com', password: 'hunter2!' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.email).toBe('a@example.com')
      expect(typeof result.value.emailVerified).toBe('boolean')
    }
  })

  it('rejects the reserved wrong-credentials address', async () => {
    const result = await auth.signIn({ email: 'wrong@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'INVALID_CREDENTIALS' } })
  })

  it('signs up with an unreserved address', async () => {
    const result = await auth.signUp({ email: 'new@example.com', password: 'hunter2!' })

    expect(result.ok).toBe(true)
  })

  it('rejects the reserved taken address on sign up', async () => {
    const result = await auth.signUp({ email: 'taken@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'EMAIL_TAKEN' } })
  })

  it('reports success for a password reset even on an unknown address', async () => {
    // Confirming which addresses exist is account enumeration. Recorded so it
    // is not later "fixed" into a leak.
    const known = await auth.requestPasswordReset({ email: 'a@example.com' })
    const unknown = await auth.requestPasswordReset({ email: 'nobody@example.com' })

    expect(known.ok).toBe(true)
    expect(unknown.ok).toBe(true)
  })

  it('resends a verification email', async () => {
    const result = await auth.resendVerification({ email: 'a@example.com' })

    expect(result.ok).toBe(true)
  })

  it('surfaces a network failure on the reserved address', async () => {
    const result = await auth.signIn({ email: 'offline@example.com', password: 'hunter2!' })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('is asynchronous, so loading states are real', async () => {
    const slow = createMockAuthService({ latencyMs: 20 })
    const started = Date.now()

    await slow.signIn({ email: 'a@example.com', password: 'hunter2!' })

    expect(Date.now() - started).toBeGreaterThanOrEqual(15)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- mock.test`
Expected: FAIL — `Cannot find module '@/services/auth/mock'`.

- [ ] **Step 3: Write the types**

`src/services/auth/types.ts`

```ts
/**
 * THE AUTH BOUNDARY.
 *
 * No provider is chosen in any planning doc and no server exists, so the
 * screens talk to this interface and a mock implements it. Swapping in a real
 * provider is a change to `index.ts` and nothing else.
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'NETWORK'
  | 'UNKNOWN'

/**
 * A code, never a raw string. A screen maps a code to its own copy rather than
 * displaying whatever a server happened to say.
 */
export type AuthError = {
  code: AuthErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AuthError }

export type Session = {
  userId: string
  email: string
  emailVerified: boolean
}

export type Credentials = {
  email: string
  password: string
}

export type EmailOnly = {
  email: string
}

export type AuthService = {
  signIn: (input: Credentials) => Promise<Result<Session>>
  signUp: (input: Credentials) => Promise<Result<Session>>
  /** Always resolves ok — see the enumeration note in `mock.ts`. */
  requestPasswordReset: (input: EmailOnly) => Promise<Result<null>>
  resendVerification: (input: EmailOnly) => Promise<Result<null>>
}
```

- [ ] **Step 4: Write the mock**

`src/services/auth/mock.ts`

```ts
import type {
  AuthError,
  AuthService,
  Credentials,
  EmailOnly,
  Result,
  Session,
} from '@/services/auth/types'

/**
 * Reserved addresses, so every error path is reachable by hand on a device and
 * deterministically in tests.
 */
const RESERVED: Record<string, AuthError['code']> = {
  'wrong@example.com': 'INVALID_CREDENTIALS',
  'taken@example.com': 'EMAIL_TAKEN',
  'offline@example.com': 'NETWORK',
  'broken@example.com': 'UNKNOWN',
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function fail(code: AuthError['code']): Result<never> {
  return { ok: false, error: { code } }
}

function session(email: string, emailVerified: boolean): Session {
  return { userId: `mock-${email}`, email, emailVerified }
}

type MockOptions = {
  /** Default is deliberately slow enough that loading states are visible. */
  latencyMs?: number
}

export function createMockAuthService({ latencyMs = 600 }: MockOptions = {}): AuthService {
  return {
    async signIn({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]
      if (reserved === 'INVALID_CREDENTIALS' || reserved === 'NETWORK' || reserved === 'UNKNOWN') {
        return fail(reserved)
      }

      // `emailVerified` is returned but unused by the screens today: M00-S02
      // cannot branch on it because `(app)` has no routes yet. See spec §10.
      return { ok: true, value: session(email, false) }
    },

    async signUp({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]
      if (reserved) {
        return fail(reserved === 'INVALID_CREDENTIALS' ? 'UNKNOWN' : reserved)
      }

      return { ok: true, value: session(email, false) }
    },

    async requestPasswordReset({ email }: EmailOnly) {
      await wait(latencyMs)

      if (RESERVED[email.toLowerCase()] === 'NETWORK') {
        return fail('NETWORK')
      }

      // Deliberately ok for unknown addresses. Confirming which addresses exist
      // is account enumeration.
      return { ok: true, value: null }
    },

    async resendVerification({ email }: EmailOnly) {
      await wait(latencyMs)

      if (RESERVED[email.toLowerCase()] === 'NETWORK') {
        return fail('NETWORK')
      }

      return { ok: true, value: null }
    },
  }
}
```

`src/services/auth/index.ts`

```ts
import { createMockAuthService } from '@/services/auth/mock'

export type * from '@/services/auth/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * line — every screen imports `authService` from here.
 */
export const authService = createMockAuthService()
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- mock.test`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/services/auth
git commit -m "Add the auth service boundary with a deterministic mock

No provider is chosen in any planning doc and no server exists, so the
screens talk to one typed interface. Errors are a union of codes, never a
raw string, so a screen maps a code to its own copy.

Reserved addresses make every error path reachable by hand on a device
and deterministically in tests. Password reset resolves ok even for
unknown addresses - confirming which exist is account enumeration, and
that is recorded so it is not later 'fixed' into a leak.

expo-secure-store is deliberately not installed: there is no real token
to persist until a provider exists."
```

---

## Task 9: Validation schemas and the form bridge

**Files:**
- Create: `src/modules/module-00-auth/state/authSchemas.ts`, `src/components/forms/FormField.tsx`
- Test: `src/modules/module-00-auth/state/__tests__/authSchemas.test.ts`

**Interfaces:**
- Consumes: `zod`, `Input` (Task 5), `react-hook-form`.
- Produces: `signInSchema`, `signUpSchema`, `emailOnlySchema`, `PASSWORD_RULES` (an array of `{ id, label, test }`), types `SignInValues`, `SignUpValues`, `EmailOnlyValues`; and `FormField` props `{ control, name, label, ... }`.

- [ ] **Step 1: Write the failing test**

`src/modules/module-00-auth/state/__tests__/authSchemas.test.ts`

```ts
import {
  emailOnlySchema,
  PASSWORD_RULES,
  signInSchema,
  signUpSchema,
} from '@/modules/module-00-auth/state/authSchemas'

describe('signInSchema', () => {
  it('accepts a valid pair', async () => {
    expect(signInSchema.safeParse({ email: 'a@example.com', password: 'x' }).success).toBe(true)
  })

  it('rejects a malformed email', async () => {
    const result = signInSchema.safeParse({ email: 'nope', password: 'x' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a valid email address')
    }
  })

  it('rejects an empty password', async () => {
    expect(signInSchema.safeParse({ email: 'a@example.com', password: '' }).success).toBe(false)
  })

  it('does not impose strength rules on sign in', async () => {
    // Rejecting a weak password a user already has is a dead end.
    expect(signInSchema.safeParse({ email: 'a@example.com', password: 'a' }).success).toBe(true)
  })
})

describe('signUpSchema', () => {
  it('accepts a password meeting every rule', async () => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password: 'hunter22!' }).success).toBe(true)
  })

  it.each([
    ['too short', 'ab1!'],
    ['no number', 'abcdefgh!'],
    ['no special character', 'abcdefg1'],
  ])('rejects a password that is %s', (_why, password) => {
    expect(signUpSchema.safeParse({ email: 'a@example.com', password }).success).toBe(false)
  })
})

describe('PASSWORD_RULES', () => {
  it('is the same set the schema enforces, so the checklist cannot disagree', async () => {
    const passing = 'hunter22!'
    expect(PASSWORD_RULES.every((rule) => rule.test(passing))).toBe(true)
    expect(signUpSchema.safeParse({ email: 'a@example.com', password: passing }).success).toBe(true)
  })

  it('fails every rule on an empty password', async () => {
    expect(PASSWORD_RULES.some((rule) => rule.test(''))).toBe(false)
  })

  it.each(PASSWORD_RULES.map((rule) => [rule.id, rule] as const))(
    'rule %s has a human label',
    (_id, rule) => {
      expect(rule.label.length).toBeGreaterThan(0)
    },
  )
})

describe('emailOnlySchema', () => {
  it('accepts a valid address and rejects a malformed one', async () => {
    expect(emailOnlySchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(emailOnlySchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- authSchemas`
Expected: FAIL — module missing.

- [ ] **Step 3: Write the schemas**

`src/modules/module-00-auth/state/authSchemas.ts`

```ts
import { z } from 'zod'

const email = z.string().trim().min(1, 'Enter your email address').email('Enter a valid email address')

/**
 * The password rules, as data.
 *
 * M00-S03 renders these as a live checklist. Deriving both the checklist and
 * the schema from one list is what stops the two disagreeing — a user being
 * told every rule passes while the form refuses to submit.
 */
export const PASSWORD_RULES = [
  { id: 'length', label: '8+ characters long', test: (v: string) => v.length >= 8 },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  {
    id: 'special',
    label: 'One special character',
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const

const strongPassword = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, { message: rule.label }),
  z.string() as z.ZodType<string>,
)

export const signInSchema = z.object({
  email,
  // No strength rules here: rejecting a weak password a user already has is a
  // dead end.
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  email,
  password: strongPassword,
})

export const emailOnlySchema = z.object({ email })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>
```

- [ ] **Step 4: Write the form bridge**

`src/components/forms/FormField.tsx`

```tsx
import type { ReactNode } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import type { TextInputProps } from 'react-native'

import { Input } from '@/design-system/primitives/Input'

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  secure?: boolean
  labelTrailing?: ReactNode
  keyboardType?: TextInputProps['keyboardType']
  autoComplete?: TextInputProps['autoComplete']
}

/**
 * The ONLY file that imports both `react-hook-form` and a design-system
 * primitive.
 *
 * `Input` takes plain props so it stays usable anywhere and the form library
 * can be replaced without touching a primitive (spec D22).
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secure,
  labelTrailing,
  keyboardType,
  autoComplete,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          error={fieldState.error?.message}
          secure={secure}
          labelTrailing={labelTrailing}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
        />
      )}
    />
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- authSchemas`
Expected: PASS, 12 tests. Then `npx tsc --noEmit`.

- [ ] **Step 6: Commit**

```bash
git add src/modules/module-00-auth/state src/components/forms
git commit -m "Add auth validation schemas and the FormField bridge

The password rules are data, not three hardcoded regexes: M00-S03's live
checklist and the submit-gating schema are both derived from one list, so
they cannot disagree and tell a user every rule passes while the form
refuses to submit.

Sign in deliberately imposes no strength rules - rejecting a weak password
someone already has is a dead end.

FormField is the only file importing both react-hook-form and a design
system primitive, so Input stays library-agnostic (D22)."
```

---

## Task 10: M00-S02 Sign In — end of Stage 1

**Files:**
- Create: `src/copy/signIn.ts`, `src/modules/module-00-auth/components/AuthScreenLayout.tsx`, `AuthMedallion.tsx`, `src/modules/module-00-auth/screens/SignInScreen.tsx`
- Modify: `src/app/(auth)/sign-in.tsx`
- Test: `src/modules/module-00-auth/screens/__tests__/SignInScreen.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2–9.
- Produces: `SignInScreen`; `AuthScreenLayout` props `{ onBack?, children }`; `AuthMedallion` (no props).

- [ ] **Step 1: Write the failing test**

`src/modules/module-00-auth/screens/__tests__/SignInScreen.test.tsx`

```tsx
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'

import { SIGN_IN_COPY } from '@/copy/signIn'
import { SignInScreen } from '@/modules/module-00-auth/screens/SignInScreen'
import { authService } from '@/services/auth'

const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(SIGN_IN_COPY.emailLabel), email)
  await userEvent.type(screen.getByLabelText(SIGN_IN_COPY.passwordLabel), password)
  await userEvent.press(screen.getByRole('button', { name: SIGN_IN_COPY.submit }))
}

describe('SignInScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders every block from copy', async () => {
    await render(<SignInScreen />)

    expect(screen.getByText(SIGN_IN_COPY.heading)).toBeTruthy()
    expect(screen.getByText(SIGN_IN_COPY.lede)).toBeTruthy()
    expect(screen.getByLabelText(SIGN_IN_COPY.emailLabel)).toBeTruthy()
    expect(screen.getByLabelText(SIGN_IN_COPY.passwordLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: SIGN_IN_COPY.submit })).toBeTruthy()
    expect(screen.getByText(SIGN_IN_COPY.dividerLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeTruthy()
    expect(screen.getByRole('link', { name: SIGN_IN_COPY.footerLink })).toBeTruthy()
  })

  it('shows a field error for a malformed email and does not call the service', async () => {
    const signIn = jest.spyOn(authService, 'signIn')
    await render(<SignInScreen />)

    await fillAndSubmit('nope', 'hunter2!')

    expect(await screen.findByText('Enter a valid email address')).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()
    signIn.mockRestore()
  })

  it('navigates to verify-email on success', async () => {
    await render(<SignInScreen />)

    await fillAndSubmit('a@example.com', 'hunter2!')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/(auth)/verify-email')
    })
  })

  it('shows a form-level error on bad credentials and clears only the password', async () => {
    await render(<SignInScreen />)

    await fillAndSubmit('wrong@example.com', 'hunter2!')

    expect(await screen.findByText(SIGN_IN_COPY.errors.INVALID_CREDENTIALS)).toBeTruthy()
    // Retyping a correct email is pure friction.
    expect(screen.getByLabelText(SIGN_IN_COPY.emailLabel).props.value).toBe('wrong@example.com')
    expect(screen.getByLabelText(SIGN_IN_COPY.passwordLabel).props.value).toBe('')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows a form-level error on network failure', async () => {
    await render(<SignInScreen />)

    await fillAndSubmit('offline@example.com', 'hunter2!')

    expect(await screen.findByText(SIGN_IN_COPY.errors.NETWORK)).toBeTruthy()
  })

  it('navigates to forgot-password', async () => {
    await render(<SignInScreen />)

    await userEvent.press(screen.getByRole('link', { name: SIGN_IN_COPY.forgotLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password')
  })

  it('navigates to sign-up from the footer', async () => {
    await render(<SignInScreen />)

    await userEvent.press(screen.getByRole('link', { name: SIGN_IN_COPY.footerLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- SignInScreen`
Expected: FAIL — copy and screen modules missing.

- [ ] **Step 3: Write the copy**

`src/copy/signIn.ts`

```ts
import { BRAND } from '@/config/brand'

/**
 * Copy for M00-S02 Sign In.
 *
 * `BRAND.name` is interpolated, never typed — the rule in `config/brand.ts`.
 */
export const SIGN_IN_COPY = {
  heading: 'Welcome back',
  lede: 'Your memories are waiting.',
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  forgotLink: 'Forgot password?',
  submit: 'Sign In',
  dividerLabel: 'Or continue with',
  footerText: `New to ${BRAND.name}?`,
  footerLink: 'Create an account',
  errors: {
    INVALID_CREDENTIALS: 'That email and password do not match. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
```

- [ ] **Step 4: Write the shared screen layout**

`src/modules/module-00-auth/components/AuthScreenLayout.tsx`

```tsx
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { StatusBar } from 'expo-status-bar'

import { AppHeader } from '@/design-system/patterns/AppHeader'

type AuthScreenLayoutProps = {
  onBack?: () => void
  /** Centres the content vertically when it is shorter than the screen. */
  centred?: boolean
  children: ReactNode
}

/**
 * Shared chrome for the four M00 form screens: flat page fill, the top glow,
 * pinned header, and scroll + keyboard behaviour.
 *
 * The background is a flat fill plus a glow, NOT the hero gradient — a gradient
 * running to #E8DDFF would sit under the primary button and cut its contrast
 * (spec D18). M00-S01 keeps the gradient; it is the only screen that has it.
 */
export function AuthScreenLayout({ onBack, centred = false, children }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.glow} pointerEvents="none" />

      <View style={{ paddingTop: insets.top }}>
        <AppHeader onBack={onBack} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            // flexGrow, not justifyContent on the ScrollView itself, which
            // would fight the scroll.
            centred && styles.centred,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.column}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  flex: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: '-22%',
    left: '-40%',
    right: '-40%',
    height: '55%',
    borderRadius: 9999,
    backgroundColor: theme.colors.surface.glow,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  centred: {
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
}))
```

- [ ] **Step 5: Write the medallion**

`src/modules/module-00-auth/components/AuthMedallion.tsx`

```tsx
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

/**
 * The 96pt lavender medallion on M00-S02. Figma 522:68.
 *
 * Composed from primitives rather than imported as artwork: in Figma it is a
 * rounded rect, a 45° gradient overlay and a heart glyph, so building it this
 * way is faithful reconstruction, not substitution (spec D24).
 */
export function AuthMedallion() {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrapper} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.medallion}>
        <LinearGradient
          colors={['rgba(56, 19, 132, 0.1)', 'rgba(56, 19, 132, 0)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.overlay}
        />
        <Feather name="heart" size={40} color={theme.colors.brand.primary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.medallion,
    backgroundColor: theme.colors.surface.soft,
    boxShadow: theme.elevation.medallion,
    transform: [{ rotate: '-3deg' }],
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
}))
```

- [ ] **Step 6: Write the screen**

`src/modules/module-00-auth/screens/SignInScreen.tsx`

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Feather } from '@expo/vector-icons'

import { SIGN_IN_COPY } from '@/copy/signIn'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/design-system/primitives/Button'
import { Divider } from '@/design-system/primitives/Divider'
import { Text } from '@/design-system/primitives/Text'
import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'
import { SocialButton } from '@/design-system/patterns/SocialButton'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { signInSchema, type SignInValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S02 — Sign In. Figma 522:53.
 *
 * Normalised against the other four M00 screens: heading colour, lede size,
 * label tracking, input height, button height and weight, divider rules and
 * social-button shape all differ from what Figma draws. Each deviation is
 * recorded in the cluster spec.
 */
export function SignInScreen() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, setValue, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const submit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await authService.signIn(values)

    if (result.ok) {
      // Always verify-email for now: branching on `emailVerified` would push to
      // `(app)`, which has no routes yet. See spec §10.
      router.push('/(auth)/verify-email')
      return
    }

    setFormError(SIGN_IN_COPY.errors[result.error.code])
    // The email is kept — retyping a correct address is pure friction.
    setValue('password', '')
  })

  const goToForgot = useCallback(() => router.push('/(auth)/forgot-password'), [router])
  const goToSignUp = useCallback(() => router.push('/(auth)/sign-up'), [router])

  return (
    <AuthScreenLayout onBack={router.back}>
      <AuthMedallion />

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {SIGN_IN_COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {SIGN_IN_COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="email"
          label={SIGN_IN_COPY.emailLabel}
          placeholder={SIGN_IN_COPY.emailPlaceholder}
          keyboardType="email-address"
          autoComplete="email"
        />

        <FormField
          control={control}
          name="password"
          label={SIGN_IN_COPY.passwordLabel}
          placeholder={SIGN_IN_COPY.passwordPlaceholder}
          secure
          autoComplete="current-password"
          labelTrailing={
            <Text variant="caption" tone="brand" onPress={goToForgot} accessibilityRole="link">
              {SIGN_IN_COPY.forgotLink}
            </Text>
          }
        />

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button
          label={SIGN_IN_COPY.submit}
          onPress={submit}
          loading={formState.isSubmitting}
          trailing={<Feather name="arrow-right" size={16} color="#FFFFFF" />}
        />
      </View>

      <View style={styles.divider}>
        <Divider label={SIGN_IN_COPY.dividerLabel} />
      </View>

      <View style={styles.social}>
        <SocialButton provider="google" onPress={() => {}} />
        <SocialButton provider="apple" onPress={() => {}} />
      </View>

      <FooterPrompt
        text={SIGN_IN_COPY.footerText}
        linkLabel={SIGN_IN_COPY.footerLink}
        onPress={goToSignUp}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.huge,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.md,
  },
  divider: {
    paddingVertical: theme.spacing.xxxl,
  },
  social: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}))
```

The two `SocialButton` handlers are intentionally empty: OAuth is out of scope
(spec §17). They render and are pressable so the layout is real.

- [ ] **Step 7: Wire the route**

Replace `src/app/(auth)/sign-in.tsx` entirely:

```tsx
export { SignInScreen as default } from '@/modules/module-00-auth/screens/SignInScreen'
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- SignInScreen`
Expected: PASS, 7 tests.

If navigation assertions fail, check that `jest.mock('expo-router', ...)` is declared at module scope in the test file — `jest.mock` is hoisted, and `mockPush` must be defined before the factory runs.

- [ ] **Step 9: Run the whole suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all PASS, no type errors. `verify-email` and `forgot-password` routes do not exist yet, so those two navigations resolve to nothing at runtime — Task 11 and Task 13 create them.

- [ ] **Step 10: Verify on a device**

Run: `npm run android` (or `npm run ios`)

Check the things unit tests cannot, because the Unistyles Jest mock strips variants:

1. Primary button is 56pt with a SemiBold label and a **black** shadow, not purple.
2. Input is 56pt, filled `#F8F1FB`, radius 12, with the label above it.
3. Tapping a field shows the purple border **and** the focus ring.
4. Submitting `wrong@example.com` shows the form error and clears only the password.
5. The medallion sits at −3° with its gradient overlay.
6. The divider's rules reach the label at any width — rotate the device.
7. Welcome's button is now 56pt and its header shows the heart.

- [ ] **Step 11: Commit**

```bash
git add -A src/copy src/modules src/app
git commit -m "Implement M00-S02 Sign In

Completes stage 1: the shared design system now has a real consumer.

Sign In routes to verify-email unconditionally rather than branching on
emailVerified - (app) has no routes yet, so the branch would navigate
nowhere and throw. The mock still returns the flag, so the branch is one
line once Module 01 exists (spec section 10).

On a failed sign in the email is kept and only the password clears.
Errors are mapped from AuthError codes to screen copy, so no server string
ever reaches a user.

AuthScreenLayout carries the flat page fill plus glow, scroll and keyboard
behaviour for all four form screens. The background is deliberately not
the hero gradient: a gradient running to #E8DDFF would sit under the
primary button and cut its contrast (D18)."
```

---

# STAGE 2 — The remaining three screens

Faster, because every component now exists.

## Task 11: M00-S04 Verify Email

Built before S03 because S03's footer links to it, and because the resend countdown is the only new logic in stage 2.

**Files:**
- Create: `src/copy/verifyEmail.ts`, `src/modules/module-00-auth/components/EnvelopeIllustration.tsx`, `src/modules/module-00-auth/screens/VerifyEmailScreen.tsx`, `src/app/(auth)/verify-email.tsx`
- Test: `src/modules/module-00-auth/screens/__tests__/VerifyEmailScreen.test.tsx`

**Interfaces:**
- Consumes: `AuthScreenLayout`, `Button`, `Text`, `authService`.
- Produces: `VerifyEmailScreen`; `EnvelopeIllustration` (no props).

- [ ] **Step 1: Write the failing test**

`src/modules/module-00-auth/screens/__tests__/VerifyEmailScreen.test.tsx`

```tsx
import { act, render, screen, userEvent } from '@testing-library/react-native'

import { VERIFY_EMAIL_COPY } from '@/copy/verifyEmail'
import { VerifyEmailScreen } from '@/modules/module-00-auth/screens/VerifyEmailScreen'

const mockBack = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack, replace: jest.fn() }),
}))

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockBack.mockClear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders its blocks from copy', async () => {
    await render(<VerifyEmailScreen />)

    expect(screen.getByText(VERIFY_EMAIL_COPY.heading)).toBeTruthy()
    expect(screen.getByText(VERIFY_EMAIL_COPY.lede)).toBeTruthy()
    expect(screen.getByRole('button', { name: VERIFY_EMAIL_COPY.resend })).toBeTruthy()
    expect(screen.getByRole('button', { name: VERIFY_EMAIL_COPY.changeEmail })).toBeTruthy()
  })

  it('starts the countdown on mount, showing mm:ss', async () => {
    await render(<VerifyEmailScreen />)

    expect(screen.getByText('00:60')).toBeTruthy()
  })

  it('counts down each second', async () => {
    await render(<VerifyEmailScreen />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('00:57')).toBeTruthy()
  })

  it('disables resend while the countdown runs', async () => {
    await render(<VerifyEmailScreen />)

    expect(
      screen.getByRole('button', { name: VERIFY_EMAIL_COPY.resend }).props.accessibilityState,
    ).toMatchObject({ disabled: true })
  })

  it('enables resend and drops the timer at zero', async () => {
    await render(<VerifyEmailScreen />)

    act(() => {
      jest.advanceTimersByTime(60_000)
    })

    expect(
      screen.getByRole('button', { name: VERIFY_EMAIL_COPY.resend }).props.accessibilityState,
    ).toMatchObject({ disabled: false })
    expect(screen.queryByText(/^00:/)).toBeNull()
  })

  it('goes back when Change Email is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await render(<VerifyEmailScreen />)

    await user.press(screen.getByRole('button', { name: VERIFY_EMAIL_COPY.changeEmail }))

    // There is no change-email design, so this returns to Create Account
    // rather than inventing a sixth screen.
    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- VerifyEmailScreen`
Expected: FAIL — modules missing.

- [ ] **Step 3: Write the copy**

`src/copy/verifyEmail.ts`

```ts
/**
 * Copy for M00-S04 Verify Email.
 *
 * The emoji is in the design and stays: it carries tone a lavender palette
 * alone does not.
 */
export const VERIFY_EMAIL_COPY = {
  heading: 'Check your inbox 💌',
  lede: 'We sent a verification link to your email.',
  resend: 'Resend Email',
  changeEmail: 'Change Email',
  resendCooldownSeconds: 60,
  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
```

- [ ] **Step 4: Write the illustration**

`src/modules/module-00-auth/components/EnvelopeIllustration.tsx`

```tsx
import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

/**
 * The envelope on M00-S04. Figma 522:248.
 *
 * Composed from primitives (spec D24): in Figma this is a rounded rect, two
 * straight flap lines and a circular seal. The flap is drawn with two rotated
 * hairline views rather than SVG, since `react-native-svg` is not a dependency.
 */
export function EnvelopeIllustration() {
  const { theme } = useUnistyles()

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.glow} />

      <View style={styles.card}>
        <View style={[styles.flap, styles.flapLeft]} />
        <View style={[styles.flap, styles.flapRight]} />

        <View style={styles.seal}>
          <Feather name="heart" size={12} color={theme.colors.feedback.error} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 9999,
    backgroundColor: 'rgba(56, 19, 132, 0.1)',
  },
  card: {
    width: 128,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.surface.soft,
    // Follows the page to lavender. Drawn as #FFFCF9 to match a cream page
    // that no longer exists; left cream it would read as a beige rectangle
    // floating on lilac.
    backgroundColor: theme.colors.surface.page,
    boxShadow: theme.elevation.illustration,
    transform: [{ rotate: '-2deg' }],
    overflow: 'hidden',
  },
  flap: {
    position: 'absolute',
    top: 0,
    width: 96,
    height: 1,
    backgroundColor: theme.colors.surface.soft,
  },
  flapLeft: {
    left: -12,
    transform: [{ rotate: '36deg' }],
    transformOrigin: 'left top',
  },
  flapRight: {
    right: -12,
    transform: [{ rotate: '-36deg' }],
    transformOrigin: 'right top',
  },
  seal: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(232, 221, 255, 0.5)',
    backgroundColor: theme.colors.surface.card,
    boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.05)',
  },
}))
```

- [ ] **Step 5: Write the screen**

`src/modules/module-00-auth/screens/VerifyEmailScreen.tsx`

```tsx
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { VERIFY_EMAIL_COPY as COPY } from '@/copy/verifyEmail'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { EnvelopeIllustration } from '@/modules/module-00-auth/components/EnvelopeIllustration'
import { authService } from '@/services/auth'

function format(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * M00-S04 — Verify Email. Figma 522:226.
 *
 * "Change Email" returns to Create Account rather than pushing a new screen:
 * there is no change-email design, and inventing one would add a sixth screen
 * ID, which SCREENS.md rules 2 and 3 forbid without approval.
 */
export function VerifyEmailScreen() {
  const router = useRouter()
  const [remaining, setRemaining] = useState(COPY.resendCooldownSeconds)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (remaining <= 0) return

    const timer = setInterval(() => {
      setRemaining((previous) => (previous <= 1 ? 0 : previous - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining])

  const resend = useCallback(async () => {
    setIsSending(true)
    setError(null)

    const result = await authService.resendVerification({ email: '' })

    setIsSending(false)

    if (!result.ok) {
      setError(COPY.errors[result.error.code])
      return
    }

    setRemaining(COPY.resendCooldownSeconds)
  }, [])

  const isCoolingDown = remaining > 0

  return (
    <AuthScreenLayout onBack={router.back} centred>
      <EnvelopeIllustration />

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.actions}>
        {error ? (
          <Text variant="footnote" tone="error" align="center">
            {error}
          </Text>
        ) : null}

        <Button
          label={COPY.resend}
          onPress={resend}
          disabled={isCoolingDown}
          loading={isSending}
          trailing={
            isCoolingDown ? (
              <Text variant="countdown" tone="onPrimary">
                {format(remaining)}
              </Text>
            ) : undefined
          }
        />

        <Button label={COPY.changeEmail} onPress={router.back} variant="soft" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.xxl,
  },
}))
```

- [ ] **Step 6: Wire the route**

`src/app/(auth)/verify-email.tsx`

```tsx
export { VerifyEmailScreen as default } from '@/modules/module-00-auth/screens/VerifyEmailScreen'
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- VerifyEmailScreen`
Expected: PASS, 6 tests.

Note: the countdown label is `00:60` at rest because the cooldown is a flat 60 seconds; if you prefer `01:00`, change `resendCooldownSeconds` and the test together, not one of them.

- [ ] **Step 8: Commit**

```bash
git add -A src/copy src/modules src/app
git commit -m "Implement M00-S04 Verify Email

The resend countdown gates the button for 60 seconds, rendered through
Button's trailing slot rather than a new variant. The countdown is
dropped entirely at zero.

Change Email returns to Create Account rather than pushing a new screen:
no change-email design exists, and inventing one would add a sixth screen
ID, which SCREENS.md rules 2 and 3 forbid without approval.

The envelope is composed from primitives (D24) - in Figma it is a rounded
rect, two flap lines and a seal circle. Its fill follows the page to
lavender; left at Figma's cream it would read as a beige rectangle
floating on lilac."
```

---

## Task 12: M00-S03 Create Account

**Files:**
- Create: `src/copy/createAccount.ts`, `src/modules/module-00-auth/components/PasswordRequirements.tsx`, `src/modules/module-00-auth/screens/CreateAccountScreen.tsx`
- Modify: `src/app/(auth)/sign-up.tsx`
- Test: `src/modules/module-00-auth/components/__tests__/PasswordRequirements.test.tsx`, `src/modules/module-00-auth/screens/__tests__/CreateAccountScreen.test.tsx`

**Interfaces:**
- Consumes: everything from Stage 1, plus `PASSWORD_RULES` (Task 9).
- Produces: `CreateAccountScreen`; `PasswordRequirements` props `{ value: string }`.

- [ ] **Step 1: Write the failing tests**

`src/modules/module-00-auth/components/__tests__/PasswordRequirements.test.tsx`

```tsx
import { render, screen } from '@testing-library/react-native'

import { PasswordRequirements } from '@/modules/module-00-auth/components/PasswordRequirements'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

describe('PasswordRequirements', () => {
  it('lists every rule', async () => {
    await render(<PasswordRequirements value="" />)

    for (const rule of PASSWORD_RULES) {
      expect(screen.getByText(rule.label)).toBeTruthy()
    }
  })

  it('marks nothing met on an empty password', async () => {
    await render(<PasswordRequirements value="" />)

    expect(screen.queryAllByTestId('rule-met')).toHaveLength(0)
  })

  it('marks a rule met as soon as it passes', async () => {
    await render(<PasswordRequirements value="abcdefgh" />)

    // Only the length rule passes.
    expect(screen.getAllByTestId('rule-met')).toHaveLength(1)
  })

  it('marks every rule met on a fully valid password', async () => {
    await render(<PasswordRequirements value="hunter22!" />)

    expect(screen.getAllByTestId('rule-met')).toHaveLength(PASSWORD_RULES.length)
  })

  it('announces met and unmet states as text, not by colour alone', async () => {
    await render(<PasswordRequirements value="hunter22!" />)

    for (const rule of PASSWORD_RULES) {
      expect(screen.getByLabelText(`${rule.label}: met`)).toBeTruthy()
    }
  })
})
```

`src/modules/module-00-auth/screens/__tests__/CreateAccountScreen.test.tsx`

```tsx
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'

import { CREATE_ACCOUNT_COPY as COPY } from '@/copy/createAccount'
import { CreateAccountScreen } from '@/modules/module-00-auth/screens/CreateAccountScreen'

const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(COPY.emailLabel), email)
  await userEvent.type(screen.getByLabelText(COPY.passwordLabel), password)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('CreateAccountScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders its blocks from copy', async () => {
    await render(<CreateAccountScreen />)

    expect(screen.getByText(COPY.headingLines[0])).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByText(COPY.requirementsTitle)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
    expect(screen.getByRole('link', { name: COPY.footerLink })).toBeTruthy()
  })

  it('navigates to verify-email on success', async () => {
    await render(<CreateAccountScreen />)

    await fillAndSubmit('new@example.com', 'hunter22!')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/(auth)/verify-email')
    })
  })

  it('attaches a taken email to the email field', async () => {
    await render(<CreateAccountScreen />)

    await fillAndSubmit('taken@example.com', 'hunter22!')

    expect(await screen.findByText(COPY.errors.EMAIL_TAKEN)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('rejects a weak password before calling the service', async () => {
    await render(<CreateAccountScreen />)

    await fillAndSubmit('new@example.com', 'abc')

    expect(await screen.findByText('8+ characters long')).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('navigates to sign-in from the footer', async () => {
    await render(<CreateAccountScreen />)

    await userEvent.press(screen.getByRole('link', { name: COPY.footerLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in')
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -- PasswordRequirements CreateAccountScreen`
Expected: FAIL — modules missing.

- [ ] **Step 3: Write the copy**

`src/copy/createAccount.ts`

```ts
import { BRAND } from '@/config/brand'

/** Copy for M00-S03 Create Account. */
export const CREATE_ACCOUNT_COPY = {
  /** Figma typesets the heading across two lines. */
  headingLines: ["Let's make this", 'official.'],
  lede: `Create your private ${BRAND.name} account.`,
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Create a password',
  requirementsTitle: 'Password security',
  submit: 'Create Account',
  dividerLabel: 'Or continue with',
  footerText: 'Already have an account?',
  footerLink: 'Sign In',
  errors: {
    EMAIL_TAKEN: 'That email already has an account. Sign in instead.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
```

- [ ] **Step 4: Write the requirements list**

`src/modules/module-00-auth/components/PasswordRequirements.tsx`

```tsx
import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CREATE_ACCOUNT_COPY } from '@/copy/createAccount'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

type PasswordRequirementsProps = {
  value: string
}

/**
 * M00-S03's live rule checklist. Figma 522:183.
 *
 * Rules come from PASSWORD_RULES, the same list the submit schema is built
 * from, so the checklist cannot tell a user every rule passes while the form
 * refuses to submit.
 *
 * Figma renders every row in #CAC4D4, which scores 1.70:1 on the card — the
 * fourth WCAG failure in the design set, and on the rows a user most needs to
 * read. Unmet rows use `placeholder` ink (5.01:1) and met rows `success`
 * (5.29:1). The icon also changes SHAPE, so state is never carried by colour
 * alone. See spec D20.3.
 */
export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const { theme } = useUnistyles()

  return (
    <Card>
      <Text variant="caption" tone="body">
        {CREATE_ACCOUNT_COPY.requirementsTitle}
      </Text>

      <View style={styles.list}>
        {PASSWORD_RULES.map((rule) => {
          const isMet = rule.test(value)

          return (
            <View
              key={rule.id}
              style={styles.row}
              accessibilityLabel={`${rule.label}: ${isMet ? 'met' : 'not met'}`}
              testID={isMet ? 'rule-met' : 'rule-unmet'}
            >
              <Feather
                name={isMet ? 'check-circle' : 'circle'}
                size={14}
                color={isMet ? theme.colors.feedback.success : theme.colors.text.placeholder}
              />
              <Text variant="footnote" tone={isMet ? 'success' : 'placeholder'}>
                {rule.label}
              </Text>
            </View>
          )
        })}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}))
```

- [ ] **Step 5: Write the screen**

`src/modules/module-00-auth/screens/CreateAccountScreen.tsx`

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CREATE_ACCOUNT_COPY as COPY } from '@/copy/createAccount'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/design-system/primitives/Button'
import { Divider } from '@/design-system/primitives/Divider'
import { Text } from '@/design-system/primitives/Text'
import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'
import { SocialButton } from '@/design-system/patterns/SocialButton'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { PasswordRequirements } from '@/modules/module-00-auth/components/PasswordRequirements'
import { signUpSchema, type SignUpValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S03 — Create Account. Figma 522:154.
 *
 * The biggest normalisation in the cluster: Figma draws a cream page and
 * floating inset labels. Both are replaced — see spec D17 and D18.
 */
export function CreateAccountScreen() {
  const router = useRouter()

  const { control, handleSubmit, setError, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  const submit = handleSubmit(async (values) => {
    const result = await authService.signUp(values)

    if (result.ok) {
      router.push('/(auth)/verify-email')
      return
    }

    // A taken address belongs on the field that caused it, not in a form-level
    // banner the user has to connect back to an input themselves.
    setError(result.error.code === 'EMAIL_TAKEN' ? 'email' : 'root', {
      message: COPY.errors[result.error.code],
    })
  })

  const goToSignIn = useCallback(() => router.push('/(auth)/sign-in'), [router])

  return (
    <AuthScreenLayout onBack={router.back}>
      <View style={styles.copy}>
        {COPY.headingLines.map((line) => (
          <Text key={line} variant="h2" tone="heading">
            {line}
          </Text>
        ))}
        <Text variant="body" tone="body">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="email"
          label={COPY.emailLabel}
          placeholder={COPY.emailPlaceholder}
          keyboardType="email-address"
          autoComplete="email"
        />

        <FormField
          control={control}
          name="password"
          label={COPY.passwordLabel}
          placeholder={COPY.passwordPlaceholder}
          secure
          autoComplete="new-password"
        />

        <PasswordRequirements value={password} />

        {formState.errors.root?.message ? (
          <Text variant="footnote" tone="error" align="center">
            {formState.errors.root.message}
          </Text>
        ) : null}

        <Button label={COPY.submit} onPress={submit} loading={formState.isSubmitting} />
      </View>

      <View style={styles.divider}>
        <Divider label={COPY.dividerLabel} />
      </View>

      <View style={styles.social}>
        <SocialButton provider="google" onPress={() => {}} />
        <SocialButton provider="apple" onPress={() => {}} />
      </View>

      <FooterPrompt
        text={COPY.footerText}
        linkLabel={COPY.footerLink}
        onPress={goToSignIn}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.xxl,
  },
  divider: {
    paddingVertical: theme.spacing.xxxl,
  },
  social: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}))
```

- [ ] **Step 6: Wire the route**

Replace `src/app/(auth)/sign-up.tsx` entirely:

```tsx
export { CreateAccountScreen as default } from '@/modules/module-00-auth/screens/CreateAccountScreen'
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- PasswordRequirements CreateAccountScreen`
Expected: PASS, 10 tests.

- [ ] **Step 8: Commit**

```bash
git add -A src/copy src/modules src/app
git commit -m "Implement M00-S03 Create Account

The largest normalisation in the cluster: Figma draws a cream page and
floating inset labels, both replaced per D17 and D18.

The requirement checklist is driven by PASSWORD_RULES, the same list the
submit schema is built from, so the two cannot disagree.

Figma renders every requirement row in #CAC4D4, which scores 1.70:1 on
the white card - the fourth WCAG failure found in the design set, and on
the rows a user most needs to read. Unmet rows now use placeholder ink at
5.01:1 and met rows success at 5.29:1, and the icon changes shape too, so
state is never carried by colour alone.

A taken email attaches to the email field rather than a form-level banner
the user has to connect back to an input themselves."
```

---

## Task 13: M00-S05 Forgot Password — end of Stage 2

**Files:**
- Create: `src/copy/forgotPassword.ts`, `src/modules/module-00-auth/screens/ForgotPasswordScreen.tsx`, `src/app/(auth)/forgot-password.tsx`
- Test: `src/modules/module-00-auth/screens/__tests__/ForgotPasswordScreen.test.tsx`

**Interfaces:**
- Consumes: everything from Stage 1.
- Produces: `ForgotPasswordScreen`.

- [ ] **Step 1: Write the failing test**

`src/modules/module-00-auth/screens/__tests__/ForgotPasswordScreen.test.tsx`

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { FORGOT_PASSWORD_COPY as COPY } from '@/copy/forgotPassword'
import { ForgotPasswordScreen } from '@/modules/module-00-auth/screens/ForgotPasswordScreen'

const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function submit(email: string) {
  await userEvent.type(screen.getByLabelText(COPY.emailLabel), email)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders the form state from copy', async () => {
    await render(<ForgotPasswordScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.backToSignIn })).toBeTruthy()
  })

  it('rejects a malformed email without calling the service', async () => {
    await render(<ForgotPasswordScreen />)

    await submit('nope')

    expect(await screen.findByText('Enter a valid email address')).toBeTruthy()
    expect(screen.queryByText(COPY.sentHeading)).toBeNull()
  })

  it('swaps to the sent state in place, naming the address', async () => {
    await render(<ForgotPasswordScreen />)

    await submit('a@example.com')

    expect(await screen.findByText(COPY.sentHeading)).toBeTruthy()
    expect(screen.getByText(/a@example\.com/)).toBeTruthy()
    // An in-place swap, not a sixth screen: Figma names its only frame
    // "(Default)", implying a second state that was never drawn.
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('reports success for an unknown address too', async () => {
    await render(<ForgotPasswordScreen />)

    // Confirming which addresses exist is account enumeration.
    await submit('nobody@example.com')

    expect(await screen.findByText(COPY.sentHeading)).toBeTruthy()
  })

  it('offers a resend in the sent state', async () => {
    await render(<ForgotPasswordScreen />)

    await submit('a@example.com')

    expect(await screen.findByRole('button', { name: COPY.resend })).toBeTruthy()
  })

  it('navigates back to sign in', async () => {
    await render(<ForgotPasswordScreen />)

    await userEvent.press(screen.getByRole('button', { name: COPY.backToSignIn }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- ForgotPasswordScreen`
Expected: FAIL — modules missing.

- [ ] **Step 3: Write the copy**

`src/copy/forgotPassword.ts`

```ts
/** Copy for M00-S05 Forgot Password. */
export const FORGOT_PASSWORD_COPY = {
  heading: "Let's get you back in.",
  lede: "Enter your email and we'll send you a secure reset link.",
  emailLabel: 'Email address',
  emailPlaceholder: 'hello@loveos.app',
  submit: 'Send Reset Link',
  backToSignIn: 'Back to Sign In',

  sentHeading: 'Check your email',
  /** Deliberately does not confirm whether the address has an account. */
  sentLede: (email: string) => `If ${email} has an account, a reset link is on its way.`,
  resend: 'Resend',

  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
```

- [ ] **Step 4: Write the screen**

`src/modules/module-00-auth/screens/ForgotPasswordScreen.tsx`

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FORGOT_PASSWORD_COPY as COPY } from '@/copy/forgotPassword'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { emailOnlySchema, type EmailOnlyValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S05 — Forgot Password. Figma 522:127.
 *
 * The roughest frame in the set. Its 11px Bold primary label in a 39pt button
 * is the clearest error in the design — both below the 44pt touch minimum.
 *
 * On success the screen swaps state IN PLACE. Figma draws only the form and
 * names the frame "(Default)", implying a second state never drawn; an
 * in-place swap is the smallest honest reading, and it avoids inventing a
 * sixth screen ID (SCREENS.md rules 2 and 3).
 */
export function ForgotPasswordScreen() {
  const router = useRouter()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, formState, getValues } = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  })

  const send = handleSubmit(async ({ email }) => {
    setFormError(null)

    const result = await authService.requestPasswordReset({ email })

    if (!result.ok) {
      setFormError(COPY.errors[result.error.code])
      return
    }

    // Reports success regardless of whether the address exists.
    setSentTo(email)
  })

  const resend = useCallback(async () => {
    const email = sentTo ?? getValues('email')

    await authService.requestPasswordReset({ email })
  }, [sentTo, getValues])

  const goToSignIn = useCallback(() => router.push('/(auth)/sign-in'), [router])

  return (
    <AuthScreenLayout onBack={router.back} centred>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {sentTo ? COPY.sentHeading : COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {sentTo ? COPY.sentLede(sentTo) : COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        {sentTo ? null : (
          <FormField
            control={control}
            name="email"
            label={COPY.emailLabel}
            placeholder={COPY.emailPlaceholder}
            keyboardType="email-address"
            autoComplete="email"
          />
        )}

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {sentTo ? (
            <Button label={COPY.resend} onPress={resend} />
          ) : (
            <Button label={COPY.submit} onPress={send} loading={formState.isSubmitting} />
          )}

          <Button label={COPY.backToSignIn} onPress={goToSignIn} variant="outline" />
        </View>
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  form: {
    gap: theme.spacing.xxl,
  },
  actions: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
}))
```

- [ ] **Step 5: Wire the route**

`src/app/(auth)/forgot-password.tsx`

```tsx
export { ForgotPasswordScreen as default } from '@/modules/module-00-auth/screens/ForgotPasswordScreen'
```

- [ ] **Step 6: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all PASS, no type errors.

- [ ] **Step 7: Verify the whole module on a device**

Run: `npm run android` (or `npm run ios`)

Walk all nine navigation edges from spec §10, and confirm the things the Jest mock cannot see:

1. Every screen has the same lavender page and glow — no cream, no white.
2. Every primary button is 56pt with a SemiBold label and a black shadow.
3. Every input is 56pt, filled, radius 12.
4. Focus rings appear on all fields.
5. Error states show a crimson border **and** a message.
6. The disabled Create Account button is legible, not a dimmed blur.
7. Requirement rows are readable, and met rows show a filled check.
8. Headers are centred on all five screens, including in landscape.

- [ ] **Step 8: Update the tracker**

In `SCREENS.md`, move M00-S01…S05 from `[ ]` to `[~]`, and add a change-log row:

```markdown
| 13 Aug 2026 | M00 auth cluster implemented (S01–S05). Designs normalised to one system; all five deviate from Figma by decision — see `docs/superpowers/specs/2026-08-13-auth-cluster-design.md`. Four WCAG AA failures in the designs corrected. |
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Implement M00-S05 Forgot Password and close the auth cluster

On success the screen swaps state in place rather than pushing a sixth
screen: Figma draws only the form state and names the frame (Default),
implying a second state that was never drawn. An in-place swap is the
smallest honest reading and avoids inventing a screen ID, which
SCREENS.md rules 2 and 3 forbid without approval.

Success is reported whether or not the address has an account. Confirming
which addresses exist is account enumeration.

This frame was the roughest in the set: an 11px Bold label on the primary
action in a 39pt button, both below the 44pt touch minimum. Normalised to
56pt with a 16/24 SemiBold label.

All five M00 screens now render. SCREENS.md updated to [~]."
```

---

## Self-review

**Spec coverage.** Walked every numbered section of the spec against these tasks:

| Spec section | Covered by |
|---|---|
| §3 D12–D20 (normalisation, contrast) | Tasks 2, 4, 5, 12 |
| §3 D21–D28 (dependencies, layering) | Tasks 1, 8, 9 |
| §4 canonical set | Tasks 2–7 |
| §5 colour + contrast | Task 2 (test enforces the whole table) |
| §6 token layer | Task 2 |
| §7 primitives and patterns | Tasks 3–7, 9 |
| §8 screen composition | Tasks 10, 11, 12, 13 |
| §9 Welcome's two changes | Task 4 (button), Task 7 (header) |
| §10 routing | Tasks 10–13 |
| §11 auth boundary | Task 8 |
| §12 responsive / safe areas | Task 10 (`AuthScreenLayout`) |
| §13 error handling | Tasks 5, 10, 11, 12, 13 |
| §14 copy | Tasks 10–13 |
| §15 testing | Every task |
| §16 open items | Tasks 7, 10, 13 (device verification steps) |

**Gaps found and closed while reviewing:**

1. The spec's §15 lists tests asserting variant style values (button height, input state treatments). Those are **impossible** under the Unistyles Jest mock. Replaced with behaviour and accessibility assertions, and moved the visual checks into explicit device-verification steps (Tasks 10.10 and 13.7). Recorded at the top of this plan.
2. The spec's §13 mentions a form-level error for S03's network failure but §8 does not say where it renders. Resolved: `formState.errors.root`, rendered above the submit button — Task 12.
3. The spec does not specify M00-S05's sent-state copy. Written in Task 13, deliberately phrased so it does not confirm whether the address has an account.

**Placeholder scan:** none. Every code step contains the actual file content.

**Type consistency:** `Result<T>`, `AuthError`, `AuthErrorCode`, `Session`, `AuthService`, `ButtonVariant`, `TextVariant`, `TextTone`, `SocialProvider`, `PASSWORD_RULES`, `SignInValues`, `SignUpValues`, `EmailOnlyValues` are each defined once and referenced with the same names throughout. Every screen's `errors` map is keyed by all four `AuthErrorCode` values, so `COPY.errors[result.error.code]` is exhaustive and typechecks.

**One knowingly deferred item:** `expo-glass-effect` blur on `AppHeader`. Task 7 ships the flat 80% fill that Figma specifies as the fill behind the blur, because the blur is unverified on either platform (spec open item 7). The header is correct without it; the blur is an enhancement.
