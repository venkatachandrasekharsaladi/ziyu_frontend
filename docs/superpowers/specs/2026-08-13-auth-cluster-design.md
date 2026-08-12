# M00 Auth Cluster (S02–S05) — Design

**Date:** 13 August 2026
**Screens:** M00-S02 Sign In · M00-S03 Create Account · M00-S04 Verify Email · M00-S05 Forgot Password
**Also touches:** M00-S01 Welcome (two changes — §9)
**Figma:** `t0FGzFLXoVXSUYa7mkjSbR` — `522:53`, `522:154`, `522:226`, `522:127`
**Companion:** [M00-S01 Welcome design](2026-08-11-welcome-screen-design.md) · `SCREENS.md` · `ARCHITECTURE.md` · `INSTALL-PLAN.md`
**Status:** Approved for implementation. Design normalisation approved 13 Aug 2026.
**Comparison page:** <https://claude.ai/code/artifact/3e1cc4f8-7e06-4019-a286-3b27be17a608>
— the five screens rendered original-vs-normalised, with every changed value annotated.

This is **Cluster 1** of four. `SCREENS.md` rule 7 groups screens by shared components, not
ID order; this cluster is the group that forces `Input`, `Card`, `Divider`, `AppHeader`,
`SocialButton` and the form-validation pattern into existence. Clusters 2–4 (pairing,
story-building, home landing) all consume them.

---

## 1. Goal

Build the four remaining Module 00 screens, and with them the form and chrome layer that
every later screen depends on.

**Done means:** all four screens render pixel-accurately on a device, every form validates
and reports errors, navigation between all five auth screens works in both directions, and
`Input` / `Button` / `AppHeader` are settled across all four screens rather than invented on
one and rebuilt on the next.

**Not included:** a real authentication provider. The screens run against a mock service
behind a typed boundary (§11). No server exists yet — `INSTALL-PLAN.md` Phase 4 puts the
API contract and mock server ahead of a real backend, and Phase 8 puts the service
architecture later still.

This cluster is `INSTALL-PLAN.md` **Phase 5** (auth), and it also completes the parts of
**Phase 3** (core UI components) that S01 alone did not force.

---

## 2. The problem this spec exists to solve

The four designs were drawn at different times and share almost nothing. Measured against
each other and against the built S01:

| | S01 *(built)* | S02 | S03 | S04 | S05 |
|---|---|---|---|---|---|
| Page background | lavender gradient | `#FDF7FF` + glow | `#FFFCF9` + noise | `#FFFCF9` + noise | `#FFFFFF` |
| Heading | 40/44 `#33264A` | 34/40 `#1D1A21` | 34/40 `#33264A` | 34/40 `#33264A` | 28/34 `#33264A` |
| Lede | 18/27 | 16/24 | 16/24 | 18/27 | 16/24 |
| Primary button | 72pt, 16/24 Reg, black shadow | 50pt, 20/26 SB, `#4F319B` shadow | 58pt, 20/26 Bold, `#674BB5` shadow | 56pt, 16/24 Reg, black shadow | 39pt, 11/15 Bold, `#381384` shadow |
| Input | — | `#F8F1FB`, r12, label above | transparent, h58, label inside | — | white, **r8**, label above |
| Social buttons | — | r12, `#E6E0EA`, Medium 500 | pill, `#CAC4D4`, Regular | — | — |
| Divider | — | 11/15 +0.55, fixed 93pt rules | 10/14 +1.0, flexible rules | — | — |

Three page backgrounds, three heading sizes, five primary buttons, three input treatments.
Building this faithfully would bake the drift into the primitives that 130 further screens
consume — the exact failure `SCREENS.md` rule 6 and `ARCHITECTURE.md` Phase 11 exist to
prevent.

**Only S02 is actually typeset in Plus Jakarta Sans in Figma.** S03 reports `Nimbus Sans`
and S04/S05 report `Liberation Sans` — font-substitution artifacts. The intent is obviously
Plus Jakarta Sans throughout, and it is part of why the type scales on S03–S05 wander.

---

## 3. Decisions taken

Numbering continues from the Welcome spec (which ended at D11) so decision IDs stay unique
across the project.

| # | Decision | Rationale |
|---|---|---|
| D12 | **Normalise the four designs to one system; log every deviation from Figma** | Follows the D5 precedent, which overrode Figma to unify two near-black headings and logged the correction owed. Alternatives were rejected: reproducing the drift makes `Input` need three arbitrary variants and `Button` five; fixing Figma first was approved but proved impossible (D13). |
| D13 | **Figma is not the source of truth for this cluster; this spec is** | The Figma Starter plan allows **20 MCP tool calls per month**, and that allowance ran out mid-normalisation. 14 colour tokens landed as the `LoveOS Tokens` collection; the text styles, effect styles and the five normalised frames did not. Recorded as open item #1. |
| D14 | **One control height: 56pt**, for primary, secondary, social buttons and inputs alike | Heights cluster at 56/58 on the two frames that got a refinement pass. 56 is on the 4pt grid, comfortably above the 44pt minimum touch target, and matching inputs to buttons gives the form a single vertical rhythm. |
| D15 | **Primary button label is 16/24 SemiBold, not 20/26** | 16pt reuses the existing `label` token; SemiBold supplies the emphasis the 20pt and Bold variants were reaching for without adding a fourth type size. |
| D16 | **Primary button shadow is black at 10%, two stacks** | Already tokenised from S01. The three purple shadow variants (`#4F319B`, `#674BB5`, `#381384`) read muddy on a lavender ground, and no two frames agreed on which. |
| D17 | **Inputs are filled (`#F8F1FB`) with the label above, not transparent with an inset label** | S03's inset label is a floating-label pattern: it needs an animated focus transition the frame never specifies, and as drawn it is destroyed the moment the user types. An external label also lets "Forgot password?" share the label row, which S02's layout depends on. |
| D18 | **One page background for form screens: `#FDF7FF` + a top radial glow.** S01 keeps its full gradient | Form screens need a calm field behind inputs; a gradient running to `#E8DDFF` would sit under the primary button and cut its contrast. Two backgrounds, distinguished by role (hero vs chrome) rather than by accident. |
| D19 | **The noise texture is dropped** | In all three frames that carry it, it is a single 390×390 image inside a full-bleed clipped frame — it covers only the top 390pt of a 954pt screen. That is a Figma artifact, not a design intent. Re-adding it properly (a tiling overlay) is a separate, later decision. |
| D20 | **Four accessibility corrections override Figma** — see §5 | Three placeholder/text colours in the designs fail WCAG AA, one of them at roughly 1.6:1. These are defects, not style choices, so they are fixed rather than transcribed. |
| D21 | **`react-hook-form` + `zod` + `@hookform/resolvers`** | Already **decided** in `ARCHITECTURE.md` (§ state table, line 703: "never lift a form into a global store") and scheduled for this exact phase in `INSTALL-PLAN.md`. Not a fresh choice — inventing a hand-rolled alternative would contradict a recorded decision. |
| D22 | **The design system stays form-library agnostic.** `Input` takes plain props; the `react-hook-form` binding lives in `src/components/forms/FormField.tsx` | Keeps `design-system/` free of an application dependency, so `Input` remains usable anywhere and RHF can be replaced without touching a primitive. Matches the existing layer split. |
| D23 | **`@expo/vector-icons` supplies the utility icons; no Figma asset exports are needed for this cluster** | Figma export is quota-blocked (D13), no icon library is installed, and `react-native-svg` is absent. The alternative — hand-authoring SVG path data — is explicitly wrong, because the real vector data isn't available. Trade-off recorded as open item #2: vector-icons glyphs are not pixel-identical to Figma's, so Figma remains the target for a later swap. |
| D24 | **The S02 medallion and S04 envelope are composed from primitives, not imported as artwork** | Both are geometric in Figma — a rounded rect, a gradient overlay, straight lines, a circle, a heart glyph. Composing them from `View` + `expo-linear-gradient` + an icon reproduces them exactly, so this is faithful reconstruction rather than substitution. |
| D25 | **`msw` is not installed yet** | `INSTALL-PLAN.md` schedules it for Phase 4 to mock *a server contract*. The auth stub here has no network layer to intercept, so msw would add a dependency with nothing to do. It arrives with the first real endpoint. |
| D26 | **`date-fns` is not installed yet** | Also Phase 5 in the plan, but nothing in these four screens handles a date. The resend countdown is an integer of seconds. It arrives with Cluster 3, which is full of dates. |
| D27 | **`jest-expo` + `@testing-library/react-native` land here** | The Welcome spec's D7 committed to this and its open item #5 still records it as undone. This cluster is where it stops being optional: `Button` and `Input` are consumed by every screen after this one, and `INSTALL-PLAN.md` warns "a `Button` bug hits 40 screens". |
| D28 | **`zod` is declared explicitly in `package.json`** | It currently resolves only as a transitive dependency at 3.25.76. Relying on that is a silent break waiting for whichever package pulls it in to drop it. |

### Decisions deliberately NOT taken here

- **The authentication provider.** No provider is chosen in any planning doc. §11 defines the
  boundary the screens talk to; choosing what sits behind it is Phase 8 work.
- **Module numbering** (`SCREENS.md` §1.1, M00 vs `M01-S00a…e`). Still formally unrecorded, still
  not blocking — only route paths would move.
- **Dark theme.** No dark design exists for any screen.
- **The noise texture's proper form** (D19).

---

## 4. The canonical set

What the five screens now share. Each row is either a difference removed, or a defect fixed.

### Foundations

| Element | Canonical | Changes |
|---|---|---|
| Page background | `#FDF7FF` + 180° top radial glow `rgba(206,189,255,0.4)` → transparent | S03, S04, S05 |
| Hero background | `#FDF7FF` → `#E8DDFF` gradient — **S01 only** | — |
| Noise texture | dropped | S02, S03, S04 |
| Screen heading | `h2` 34/40 Bold `#33264A` | S02 (colour), S05 (size) |
| Lede | `body` 18/27 Regular `#494552` | S02, S03, S05 |
| Field label | `caption` 11/15 SemiBold +1.1 uppercase | S02, S05 |

### Controls

| Element | Canonical | Changes |
|---|---|---|
| Primary button | 56pt · pill · `#381384` · label 16/24 SemiBold · black 2-stack shadow | **all five**, incl. S01 |
| Secondary | 56pt pill · `soft` \| `outline` \| `link` | S05 (border colour) |
| Trailing content | optional slot on `Button` | — |
| Input | `#F8F1FB` · r12 · 1pt `#CAC4D4` · 56pt · label above · `0 1 2` @5% | S03, S05 |
| Placeholder | `#726D7B` | S02, S05 |
| Social buttons | pill · `#E6E0EA` · 56pt · label 16/24 SemiBold · Google → Apple | S02, S03 |
| Divider | `caption` label · **flexible** rules · `#E6E0EA` | S02, S03 |
| App header | `#FDF7FF` @80% + 6pt blur · back 40 · centred heart+wordmark · 40 spacer | S01, S03, S04, S05 |

Two notes on the border colours: `#CAC4D4` is now reserved for **field borders**, and
`#E6E0EA` for **dividers and button outlines**. That split is what makes the two tokens
distinguishable rather than interchangeable. And S02's divider rules were a fixed 93.37pt
each — a width that only holds at exactly 390pt, leaving a gap or an overlap anywhere else.

---

## 5. Colour and contrast

### New tokens

| Token | Value | Role |
|---|---|---|
| `surface.field` | `#F8F1FB` | Input fill |
| `surface.card` | `#FFFFFF` | Card fill (S03 password requirements) |
| `border.field` | `#CAC4D4` | Input border — **not** `border.subtle` |
| `text.placeholder` | `#726D7B` | Placeholder, and unmet requirement rows |
| `text.muted` | `#CAC4D4` | **Decorative only.** Never text that must be read — see below |
| `feedback.error` | `#A81E3C` | Field error messages, error borders |
| `feedback.success` | `#1F7A55` | Met requirement rows |
| `effect.glow` | `rgba(206,189,255,0.4)` | Page background glow |

`feedback.error` and `feedback.success` are **invented** — no frame draws either, and the
Welcome spec deliberately excluded Google's `#EA4335` from the palette to stop it becoming
an error colour. `#A81E3C` is a crimson carried toward magenta so it reads as part of a
lavender palette rather than a system alert; `#1F7A55` is its counterpart.

### Contrast verification

Every pair checked against the surface it actually sits on. Figures are WCAG 2.1 ratios.

| Pair | Ratio | Level |
|---|---|---|
| `#33264A` heading on `#FDF7FF` | 13.14:1 | AAA |
| `#494552` body on `#FDF7FF` | 8.83:1 | AAA |
| `#381384` brand on `#FDF7FF` | 12.50:1 | AAA |
| `#FFFFFF` on `#381384` button | 13.17:1 | AAA |
| `#726D7B` placeholder on `#F8F1FB` | 4.52:1 | AA |
| `#726D7B` placeholder on `#FDF7FF` | 4.75:1 | AA |
| `#726D7B` on `#FFFFFF` card | 5.01:1 | AA |
| `#A81E3C` error on `#FDF7FF` | 6.83:1 | AA |
| `#A81E3C` error on `#F8F1FB` | 6.51:1 | AA |
| `#1F7A55` success on `#FFFFFF` | 5.29:1 | AA |
| `#494552` on `#CAC4D4` disabled button | 5.48:1 | AA |

### The four corrections (D20)

1. **S02 placeholder** — `#7A7583` at 50% opacity over `#F8F1FB` scores roughly **2.1:1**.
   Even at full opacity `#7A7583` reaches only 4.03:1, still short of AA. → `#726D7B`, 4.52:1.
2. **S05 placeholder** — `#CAC4D4` at 50% over white scores roughly **1.6:1**: effectively
   invisible. → `#726D7B`, 5.01:1.
3. **S03 requirement rows** — 14/20 text in `#CAC4D4` on a `#FFFFFF` card scores **1.70:1**.
   Unmet requirements are the ones a user most needs to read. → unmet `#726D7B` (5.01:1),
   met `#1F7A55` (5.29:1) with a filled check.
4. **Disabled primary button** — the current `opacity: 0.5` renders white on an effective
   `#9A85C2`, about **3.22:1**. WCAG exempts inactive controls, so this is permitted rather
   than broken; it is still illegible. → fill `#CAC4D4`, label `#494552`, 5.48:1.

Correction 3 was found while writing this spec and is **not** reflected in the comparison
page as first published.

### Excluded on purpose

Google's `#34A853` `#4285F4` `#EA4335` `#FBBC05` — they belong to the Google logo, not the
palette. `#7A7583` — superseded by `#726D7B` for every text use (correction 1). `#1D1A21` —
superseded by `#33264A` per D5.

---

## 6. Token layer changes

```
tokens/colors.ts      Raw palette names only, per the file's own rule — semantic names are
                      bound in themes/. New values slot into the existing ramps:
                      + lavender100     #F8F1FB   (between lavender50 and lavender200)
                      + greyLavender300 #CAC4D4   (darker than greyLavender200 #E6E0EA)
                      + ink400          #726D7B   (lighter than ink600 #494552)
                      + crimson600      #A81E3C
                      + green700        #1F7A55
                      + glowLavender    rgba(206,189,255,.4)
                      purple700 keeps its S01 link role. #7A7583 is NOT added (D20.1).

tokens/typography.ts  + h2          34 / 40 / tracking 0    / Bold
                      + labelStrong 16 / 24                 / SemiBold
                      + footnote    14 / 20                 / Regular
                      + countdown   10 / 14 / tracking 0.5  / Regular
                      caption tracking stays 1.1 — S02 and S05 conform to it, not the reverse

tokens/spacing.ts     + xxxl 32 · huge 48        (S03 uses both as real gaps)

tokens/radii.ts       md 16 → REMOVED (unused; only Button referenced radii, via pill)
                      + field 12 · medallion 32

tokens/elevation.ts   NEW — the five shadow recipes, so `boxShadow` strings stop being
                      retyped per component:
                        control      0 4 6 -1 rgba(0,0,0,.1), 0 2 4 -2 rgba(0,0,0,.1)
                        field        0 1 2 0 rgba(0,0,0,.05)
                        card         0 4 6 0 rgba(103,75,181,.05)
                        medallion    0 8 24 0 rgba(79,49,155,.15)
                        illustration 0 12 32 rgba(103,75,181,.12), 0 2 8 rgba(103,75,181,.04)

themes/theme.ts       binds all of the above; adds colors.feedback.{error,success}
```

`radii.md` is safe to remove: a grep of `src/` shows `Button.tsx` is the only consumer of
the radii token group and it uses `pill`.

**No fourth font weight.** `Medium` (500) appears on S02's social button labels but is not
registered in `_layout.tsx`, so it silently falls back to Regular today. The canonical label
is SemiBold, which is already loaded.

---

## 7. Primitives and patterns

### Changed

**`primitives/Text.tsx`**
- New variants: `h2`, `labelStrong`, `footnote`, `countdown`.
- New tones: `placeholder`, `muted`, `error`, `success`.
- Still **no `style` prop** — the rule that keeps raw visual values out of screens.
- Nesting already works for mixed-style lines (`<Text>plain <Text tone="brand">link</Text></Text>`),
  because RN `Text` inherits and `TextProps` already forwards `onPress` and
  `accessibilityRole` through `...rest`. No new API needed for the footer prompts.

**`primitives/Button.tsx`**
- `primary` changes: `paddingVertical: 24` → `height: 56`; the label's `Text` variant moves
  from `label` to `labelStrong` (16/24 Regular → SemiBold). Tone and shadow are unchanged.
- `outline` changes: `borderColor` → `border.subtle`, `height: 56`. It was specced for this
  cluster in D3 and is finally rendered.
- New variant `soft`: `surface.field` fill, transparent border, `brand.primary` label. From S04.
- New optional `trailing?: ReactNode` slot — S02's arrow, S04's countdown. These are content,
  not variants.
- New `loading?: boolean`: keeps the label and fill, swaps `trailing` for an `ActivityIndicator`
  in `text.onPrimary`, sets `accessibilityState.busy`, and ignores presses. The label is
  deliberately **not** replaced by a bare spinner — that loses what is happening.
- `disabled` changes from `opacity: 0.5` to fill `border.field` + label `text.body` (D20.4).
- The existing 600ms double-fire guard is retained.

### New

**`primitives/Input.tsx`** — the load-bearing new component.
- Props: `label`, `value`, `onChangeText`, `placeholder`, `error?`, `secure?`,
  `keyboardType?`, `autoComplete?`, `trailingAction?`, `onBlur?`, `editable?`.
- Renders: `caption` label row → 56pt field → `footnote` error line. The label row accepts a
  `labelTrailing?` slot, which is how S02 puts "Forgot password?" beside the PASSWORD label.
- `secure` renders the eye toggle itself, as a 40×40 target inside the field's right padding,
  with `accessibilityLabel` switching between "Show password" and "Hide password".
- States — three of these are invented, since no frame draws them:
  | State | Treatment | Reasoning |
  |---|---|---|
  | rest | `surface.field` fill, 1pt `border.field`, `field` shadow | as drawn |
  | **focus** | border → 1pt `brand.primary`, plus a 3pt ring `rgba(56,19,132,0.12)` | The field already has a border, so focus intensifies an existing mechanism rather than introducing a new one. The ring is a second, non-colour cue. |
  | **error** | border → `feedback.error`, message below in `footnote`/`error` | Colour alone never carries it — the message is always present when `error` is set. |
  | **disabled** | fill `surface.page`, border `border.subtle`, text `text.placeholder` | Reads as inert by losing its fill, not by dimming legibility. |
- `accessibilityLabel` falls back to `label`; `error` is wired to `accessibilityHint` so a
  screen reader reaches it without a visual scan.

**`primitives/Card.tsx`** — `surface.card` fill, 1pt `border.subtle`, `radii.field`,
`spacing.xxl` padding, `card` elevation. One consumer today (S03) and an obvious one in every
later cluster. Figma draws the padding at 25, which is off the 4pt grid by 1; the grid wins,
and the 1pt deviation is recorded here rather than adding a token for it.

**`primitives/Divider.tsx`** — `label?` prop. With a label: flexible rule / label / flexible
rule. Without: a single 1pt `border.subtle` rule. Never fixed-width (D12, S02's 93.37pt).

**`patterns/AppHeader.tsx`** — replaces `module-00-auth/components/BrandHeader.tsx`.
- Props: `onBack?`. Given `onBack`, renders a 40×40 back button; otherwise a 40×40 spacer, so
  the wordmark is centred by symmetry rather than by a hard-coded padding. S05's original
  centres its wordmark with `padding-right: 158.7px`, which only looks centred at 390pt.
- Translucent `surface.page` @80% + 6pt blur via `expo-glass-effect` where supported, with a
  flat 80% fill as the fallback.
- Lives in `design-system/patterns/` rather than the auth module: it is app chrome, and
  Modules 01+ use it too.

**`patterns/SocialButton.tsx`** — `provider: 'google' | 'apple'`, `onPress`, `disabled?`.
Composes the `outline` button with a 20pt mark and a `labelStrong` label. A pattern rather
than a `Button` variant because it carries provider semantics, not just a look.

**`patterns/FooterPrompt.tsx`** — `text`, `linkLabel`, `onPress`. The "New to LoveOS?
Create an account" line on S02 and its mirror on S03. Attaches `accessibilityRole="link"`
to the pressable span. The 30% underline on S02's version is dropped — at that opacity it
reads as a rendering fault, and colour already distinguishes the link, which is how S03
drew it.

**`components/forms/FormField.tsx`** — bridges `react-hook-form`'s `Controller` to `Input`,
mapping `fieldState.error?.message` onto `Input`'s `error`. The only file in the cluster that
imports both (D22).

**Not built:** `Badge`, `Avatar`, `Checkbox`, `Select`, progress indicators. Nothing in these
four screens uses them; Cluster 2 forces `Avatar` and a progress indicator.

---

## 8. Screen composition

Every screen: `LinearGradient`-free — the form background is a flat `surface.page` fill plus
an absolutely-positioned glow `View`. Route files stay thin re-exports.

### M00-S02 Sign In (`522:53`)

| Block | Component | Notes |
|---|---|---|
| Header | `AppHeader` | with `onBack` |
| Medallion | `AuthMedallion` | 96×96, `radii.medallion`, `surface.gradientTo` fill, −3° rotation, 45° `rgba(56,19,132,0.1)` overlay, `medallion` elevation, 40pt heart (D24) |
| Copy | inline | `h2` "Welcome back" + `body` lede, centred |
| Form | `FormField` ×2 | email (`autoComplete="email"`, `keyboardType="email-address"`), password (`secure`, `labelTrailing` = "Forgot password?" link) |
| Submit | `Button` | `primary`, `trailing` = arrow, `loading` while submitting |
| Divider | `Divider` | label "OR CONTINUE WITH" |
| Social | `SocialButton` ×2 | Google then Apple |
| Footer | `FooterPrompt` | "New to LoveOS? Create an account" → S03 |

Schema: `email` valid email, `password` non-empty. Deliberately **no** password-strength rule
on sign-in — rejecting a weak password a user already has is a dead end.

### M00-S03 Create Account (`522:154`)

Same header, then `h2` "Let's make this official." over two lines, `body` lede, then email and
password fields, then the requirements `Card`, then submit / divider / social / footer.

The requirements list is the one piece of real logic here: three rules (8+ characters, one
number, one special character) derived from the same zod schema that validates the field, so
the list and the validation cannot disagree. Each row is `footnote` text with a 13.33pt icon —
`text.placeholder` + hollow circle when unmet, `feedback.success` + filled check when met
(D20.3). Rows update on change, not on blur, since the point is live feedback.

Submit is disabled until the schema passes. `Button`'s `disabled` treatment (D20.4) is what
makes that state legible.

### M00-S04 Verify Email (`522:226`)

| Block | Component | Notes |
|---|---|---|
| Header | `AppHeader` | with `onBack` |
| Illustration | `EnvelopeIllustration` | 192×192 container; blurred `rgba(56,19,132,0.1)` glow; 128×96 card at −2°, `radii.field`, 1pt `surface.gradientTo` border, `illustration` elevation; 32pt white seal circle with a heart (D24) |
| Copy | inline | `h2` "Check your inbox 💌" + `body`, centred |
| Actions | `Button` ×2 | `primary` "Resend Email" with a `countdown` trailing slot; `soft` "Change Email" |

The countdown is a 60-second timer held in screen state, started on mount and on each resend.
While it runs the resend button is `disabled`; at zero the trailing slot is dropped. The emoji
in the heading stays — it is in the design, and it carries tone that a lavender palette alone
does not.

"Change Email" returns to S03 rather than pushing a new screen; there is no separate
change-email design and inventing one is out of scope.

### M00-S05 Forgot Password (`522:127`)

Header, then vertically centred: `h2` "Let's get you back in." + `body` lede (both centred),
one email `FormField`, then `primary` "Send Reset Link" and `outline` "Back to Sign In".

On success the screen swaps to a confirmation state in place — heading, body naming the
address the link went to, and the same two buttons with the primary relabelled "Resend".
Figma draws only the form state and names the frame `(Default)`, implying a second state that
was never drawn; an in-place swap is the smallest honest reading of that, and it avoids
inventing a sixth screen ID, which `SCREENS.md` rules 2 and 3 forbid without approval.

---

## 9. M00-S01 Welcome — the two changes

S01 is built and design-verified. It gets the narrowest change that lets it share the
module's button and header, and nothing else — its hero collage, ambient layer, gradient
background and copy are untouched.

1. **Primary button 72pt → 56pt**, label `label` → `labelStrong`. Falls out of D14/D15
   automatically once `Button` changes; no edit to `WelcomeScreen.tsx` itself.
2. **Header gains the heart lockup**, by swapping `BrandHeader` for `AppHeader` with no
   `onBack` — Welcome is the entry point, so there is nowhere back to.

**Cost:** S01 loses its design-verified mark and needs a re-verification pass. That was the
accepted trade in D12; the alternative was shipping two button heights and two header
lockups inside one module.

---

## 10. Routing

```
src/app/(auth)/_layout.tsx      Stack, headerShown: false   (unchanged)
src/app/(auth)/welcome.tsx      → WelcomeScreen             (unchanged)
src/app/(auth)/sign-in.tsx      → SignInScreen              (replaces stub)
src/app/(auth)/sign-up.tsx      → CreateAccountScreen       (replaces stub)
src/app/(auth)/verify-email.tsx → VerifyEmailScreen         (new)
src/app/(auth)/forgot-password.tsx → ForgotPasswordScreen   (new)

src/modules/module-00-auth/screens/{SignIn,CreateAccount,VerifyEmail,ForgotPassword}Screen.tsx
src/modules/module-00-auth/components/{AuthMedallion,EnvelopeIllustration,PasswordRequirements}.tsx
src/modules/module-00-auth/state/authSchemas.ts
```

Navigation graph:

| From | Action | To |
|---|---|---|
| S01 | Get Started | S03 |
| S01 | Sign In | S02 |
| S02 | submit success | S04 — always, for now (see below) |
| S02 | Forgot password? | S05 |
| S02 | Create an account | S03 |
| S03 | submit success | S04 |
| S03 | Sign In | S02 |
| S04 | Change Email | S03 (back) |
| S05 | Back to Sign In | S02 |

**A verified sign-in has nowhere to go yet.** `src/app/(app)/` holds only a `.gitkeep`, and
Module 01's first screen (M01-S01 Relationship Setup) is Cluster 2. So S02 routes to S04
unconditionally rather than branching on verification status — a branch to `(app)` would
navigate to a route that does not exist and throw. The mock service still returns an
`emailVerified` flag so the branch is one line to add, and the test asserting it is written
as `skip` with the reason recorded, so it surfaces rather than being forgotten.

`sign-up` keeps its route name rather than becoming `create-account`: S01 already links to it
and route renames are churn with no user-visible benefit.

`src/app/index.tsx` keeps its `Redirect` to Welcome. The session check that eventually
replaces it is Phase 8 work and does not touch these screens.

---

## 11. The auth boundary

No provider is chosen anywhere in the planning docs, and no server exists. The screens
therefore talk to one typed interface, and a mock implements it:

```
src/services/auth/types.ts     AuthService — signIn · signUp · requestPasswordReset
                               · resendVerification, each returning a discriminated
                               Result<T, AuthError>
src/services/auth/mock.ts      In-memory. Deterministic failures on reserved addresses
                               (taken@example.com → EMAIL_TAKEN, wrong@example.com →
                               INVALID_CREDENTIALS) so every error path is reachable by hand
                               and in tests, plus a ~600ms delay so loading states are real.
                               signIn also returns `emailVerified`, unused by the screens
                               today — see §10 on why S02 cannot branch on it yet.
src/services/auth/index.ts     Exports the mock today; the swap point later.
```

`AuthError` is a union of codes, never a raw string, so a screen maps a code to copy rather
than displaying whatever a server said. Session state, when it exists, goes in Zustand per
`ARCHITECTURE.md`; this cluster does not create it, because there is nothing to persist until
a real provider returns a real token. `expo-secure-store` is therefore **not** installed yet
either — deferred with the provider.

---

## 12. Responsive and safe areas

- Frames are 390 × 877–971. An iPhone SE is 375 × 667, so all four screens **scroll**, unlike
  S01 (Welcome spec D8). Each uses `KeyboardAwareScrollView`-equivalent behaviour:
  `ScrollView` + `KeyboardAvoidingView`, `keyboardShouldPersistTaps="handled"` so a tap on
  the submit button while the keyboard is open registers on the first tap.
- Content column caps at `maxWidth: 448` (S03/S04/S05 already specify it) and centres.
- S05's vertically-centred layout is achieved with `contentContainerStyle: { flexGrow: 1,
  justifyContent: 'center' }` — centred when the content is short, scrolling when the keyboard
  or a small screen makes it tall. A plain `justifyContent` on the `ScrollView` itself would
  fight the scroll.
- `AppHeader` is pinned; it clears the notch via `useSafeAreaInsets`.
- The submit button clears the home indicator by the bottom inset.
- The glow is a percentage-positioned `View`, not a fixed 1161pt circle, so it holds its
  relationship on any height.

---

## 13. Error handling

| Case | Behaviour |
|---|---|
| Field validation | On blur, and on submit for untouched fields. Message under the field in `feedback.error`; never colour alone. |
| Wrong credentials (S02) | Form-level message above the submit button. Password clears, email is kept — retyping a correct email is pure friction. |
| Email already taken (S03) | Attached to the email field, with "Sign In" offered inline. |
| Network / unknown | Form-level "Something went wrong. Try again." — never a raw error string. |
| Double submit | `Button`'s 600ms guard, plus `loading` disabling the control. |
| Resend spam (S04) | 60s countdown gates the button. |
| Reset for an unknown address (S05) | Reports success regardless. Confirming which addresses exist is account enumeration. Recorded here so it is not later "fixed" into a leak. |
| Fonts fail | `_layout.tsx` already hides the splash on error, degrading to the system face. |
| Copy drift | Each `copy/*.ts` throws in `__DEV__` if a headline stops matching its source, following `copy/welcome.ts`. |

---

## 14. Copy

`src/copy/{signIn,createAccount,verifyEmail,forgotPassword}.ts`, one per screen, following
`copy/welcome.ts`. `BRAND.name` is never typed literally — S02's footer and S03's lede both
interpolate it, per the rule in `config/brand.ts`.

---

## 15. Testing (D27)

Add `jest-expo`, `@testing-library/react-native`, and a `test` script. This also closes the
Welcome spec's open item #5.

| Test | Asserts |
|---|---|
| `Button` × 4 variants | Label, `accessibilityRole`; 56pt height for `primary`/`soft`/`outline` (`link` is text-only) |
| `Button` loading | `accessibilityState.busy`, `onPress` not called |
| `Button` disabled | `onPress` not called, disabled fill applied |
| `Input` states | rest / focus / error / disabled each render their treatment |
| `Input` error | Message rendered and reachable via `accessibilityHint` |
| `Input` secure | Toggle flips `secureTextEntry` and its `accessibilityLabel` |
| `Divider` | With and without a label; rules are flexible, not fixed-width |
| `AppHeader` | Back button present only with `onBack`; spacer keeps the wordmark centred |
| Each screen renders | All blocks present, copy sourced from `copy/` |
| S02 submit | Valid input calls `signIn`; `INVALID_CREDENTIALS` shows the form error and clears only the password |
| S03 requirements | Each rule flips as the password changes; submit gates on the schema |
| S03 taken email | `EMAIL_TAKEN` attaches to the email field |
| S04 countdown | Resend disabled while running, enabled at zero |
| S05 unknown email | Success state shown (no enumeration) |
| Navigation | All nine edges of the §10 graph |
| Contrast | The §5 table asserted programmatically, so a token edit that breaks AA fails the suite |

The last row is the one that earns its keep: four of this cluster's decisions are contrast
fixes, and nothing else stops them being undone by a future "tidy the palette" commit.

---

## 16. Open items

1. **Figma is behind this spec** (D13). Owed: the numeric tokens, 9 text styles, 5 shadow
   styles, and five normalised frames. Needs Figma Professional with a Full/Dev seat, or next
   month's Starter allowance. The 14 colour tokens already landed. Until then this spec is
   authoritative — the same arrangement as the Welcome spec's open item #3.
2. **Icon fidelity** (D23). `@expo/vector-icons` glyphs are not the Figma icons. Figma
   remains the target for a later swap of the 6 utility icons.
3. **Google's mark is brand-non-compliant as specced.** Google's Sign-In guidelines require
   the official multi-colour "G"; vector-icons ships a monochrome glyph. Must be fixed before
   OAuth ships. Not a design preference — a brand requirement.
4. **Welcome loses its verified mark** (§9) and needs re-verification.
5. **Sign In's heading colour in Figma still reads `#1D1A21`** — carried over from the
   Welcome spec's open item #3, now also covered by open item 1.
6. **Device verification still outstanding for S01's three native behaviours** (Welcome spec
   open item #4): `mixBlendMode: 'multiply'`, `expo-image` rendering SVGs, and stacked
   `boxShadow`. The second matters less now that D23 removes SVG icons from this cluster.
7. **`expo-glass-effect` blur on the header is unverified** on either platform. The flat 80%
   fill fallback is specified so a failure degrades rather than breaks.
8. **`SCREENS.md` needs updating** — five M00 rows move from `[ ]` to `[~]`, and the tracker
   has no column for "design deviates from Figma by decision", which is now true of all five.

---

## 17. Out of scope

A real authentication provider, OAuth for Google or Apple, session persistence, secure
storage, the session/pairing redirect, a change-email screen, a reset-password-entry screen
(reached from an email link, not from the app), dark theme, `msw`, `date-fns`, Storybook, and
every screen in Clusters 2–4.
