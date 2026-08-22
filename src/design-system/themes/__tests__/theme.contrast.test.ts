import { lavenderTheme, themes, type AppTheme, type ThemeName } from '@/design-system/themes/theme'
import { contrast } from '@/test/contrast'

const AA = 4.5

const NAMES = Object.keys(themes) as ThemeName[]

/**
 * Every pair a user has to be able to READ, in whichever theme is passed.
 *
 * One table, both themes. When this file only described the lavender theme it
 * was a list of specific hexes; now it is a list of ROLES, and a dark palette
 * that puts pale body text on a pale card fails here rather than on a phone.
 */
const readable = (t: AppTheme): [string, string, string][] => {
  const { text, surface, brand, border, feedback } = t.colors

  return [
    ['heading on page', text.heading, surface.page],
    ['heading on card', text.heading, surface.card],
    ['heading on field', text.heading, surface.field],
    ['heading on soft', text.heading, surface.soft],
    ['body on page', text.body, surface.page],
    ['body on card', text.body, surface.card],
    ['body on field', text.body, surface.field],
    ['body on soft', text.body, surface.soft],
    ['brand on page', brand.primary, surface.page],
    ['brand on card', brand.primary, surface.card],
    ['brand on field', brand.primary, surface.field],
    // The bottom bar's active pill fills with `soft` and labels itself brand.
    ['brand on soft', brand.primary, surface.soft],
    ['link on page', brand.link, surface.page],
    ['onPrimary on brand', text.onPrimary, brand.primary],
    ['placeholder on field', text.placeholder, surface.field],
    ['placeholder on page', text.placeholder, surface.page],
    ['placeholder on card', text.placeholder, surface.card],
    ['error on page', feedback.error, surface.page],
    ['error on field', feedback.error, surface.field],
    ['success on card', feedback.success, surface.card],
    // M00-S06's strength meter states its level in these inks.
    ['success on page', feedback.success, surface.page],
    ['disabled button label', text.body, border.field],
  ]
}

/**
 * Contrast, in every theme.
 *
 * Four of this cluster's decisions are contrast fixes to values the Figma
 * designs got wrong (spec D20). This suite is what stops them being undone —
 * and now also what stops the midnight palette, which no design ever drew, from
 * shipping something unreadable.
 *
 * The negative assertions matter as much as the positive ones: they pin the
 * values that must STAY too faint to be text, so promoting one to a text role
 * fails loudly rather than quietly.
 */
describe.each(NAMES)('%s contrast', (name) => {
  const t: AppTheme = themes[name]

  it.each(readable(t))('%s meets AA', (_label, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(AA)
  })

  it('keeps text.muted away from anything a user must read', () => {
    // Decorative only. In lavender it scores ~1.7:1 on the white card, which is
    // what made M00-S03's requirement rows unreadable; the dark counterpart is
    // held to the same rule so it cannot become a text colour there either.
    // See D20.3.
    expect(contrast(t.colors.text.muted, t.colors.surface.card)).toBeLessThan(AA)
  })

  it('keeps the row accent tints as fills rather than as text', () => {
    // They sit on the row card. Pale-on-light or deep-on-dark by design — the
    // glyph on top carries the meaning, so the fill only has to be visible.
    for (const accent of t.colors.accents) {
      expect(contrast(accent.soft, t.colors.surface.card)).toBeLessThan(AA)
    }
  })

  it('pairs every row accent tint with an ink that clears AA on it', () => {
    // The accents are ordered PAIRS precisely because each tint is only ever
    // checked against the ink shipped beside it. This is what stops an ink from
    // one pair being dropped onto another pair's fill.
    for (const accent of t.colors.accents) {
      expect(contrast(accent.ink, accent.soft)).toBeGreaterThanOrEqual(AA)
    }
  })

  it('keeps every strength bar distinguishable from its own track', () => {
    // The lavender-only rule below ("too pale to be text") does not translate:
    // on a dark track a pale bar is high-contrast, and that is correct.
    //
    // The bar is 1.1 and not something respectable because lavender's `fair`
    // scores 1.16:1 on its track — `peachAccent` on `greyLavender200`, both
    // read from the Stitch design system. That is genuinely faint, and it is
    // tolerable only because the meter also STATES its level in words, in an
    // ink that clears AA (see `PasswordStrength`). The words are the signal;
    // the bars are reinforcement. Midnight clears 6.9 on every bar.
    const { strength } = t.colors

    for (const bar of [strength.weak, strength.fair, strength.strong]) {
      expect(contrast(bar, strength.track)).toBeGreaterThan(1.1)
    }
  })

  it('makes the full-strength bar unmistakable', () => {
    // `strong` is the one state worth reading off the bar alone, and it is the
    // brand colour in both themes, so it can be held to a real bar.
    expect(contrast(t.colors.strength.strong, t.colors.strength.track)).toBeGreaterThanOrEqual(AA)
  })

  it('separates the surfaces enough to show a card against the page', () => {
    // Midnight carries elevation with the surface step instead of shadow, since
    // the shared `elevation` shadows are black at 5-10% and invisible on a dark
    // ground. So the step itself has to be perceptible in both themes.
    expect(contrast(t.colors.surface.card, t.colors.surface.page)).toBeGreaterThan(1.03)
  })

  it('keeps the two border roles distinct', () => {
    // border.field is for inputs, border.subtle for dividers and outlines.
    // Collapsing them into one value would erase the distinction the spec draws.
    expect(t.colors.border.field).not.toBe(t.colors.border.subtle)
  })

  it('uses one control height', () => {
    expect(t.control.height).toBe(56)
  })
})

/**
 * Lavender-only. These pin specific REJECTED hexes from the Figma file, so they
 * are statements about that palette rather than rules a theme must satisfy.
 */
describe('lavender contrast, specifically', () => {
  const { text, surface } = lavenderTheme.colors

  it('does not reintroduce the placeholder ink that fails AA', () => {
    // #7A7583 is the Figma value. At full opacity it reaches only 4.03:1 on the
    // field fill; at the 50% Figma actually draws, roughly 2.1:1. See D20.1.
    expect(contrast('#7A7583', surface.field)).toBeLessThan(AA)
    expect(text.placeholder).not.toBe('#7A7583')
  })

  it('keeps the strength accents away from text', () => {
    // The meter fills bars with these and says the level in words beside them.
    // Both fail AA on the lavender page by a wide margin, which is fine for a
    // bar and never fine for a label — pinned so nobody promotes them to one.
    expect(contrast(lavenderTheme.colors.strength.weak, surface.page)).toBeLessThan(AA)
    expect(contrast(lavenderTheme.colors.strength.fair, surface.page)).toBeLessThan(AA)
  })
})
