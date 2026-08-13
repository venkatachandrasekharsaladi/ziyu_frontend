import { lavenderTheme as t } from '@/design-system/themes/theme'
import { contrast } from '@/test/contrast'

const AA = 4.5

/**
 * Four of this cluster's decisions are contrast fixes to values the Figma
 * designs got wrong (spec D20). This suite is what stops them being undone.
 *
 * The two negative assertions matter as much as the positive ones: they pin the
 * rejected values, so reintroducing them fails loudly rather than quietly.
 */
describe('theme contrast', () => {
  const { text, surface, brand, border, feedback } = t.colors

  it.each([
    ['heading on page', text.heading, surface.page],
    ['body on page', text.body, surface.page],
    ['brand on page', brand.primary, surface.page],
    ['link on page', brand.link, surface.page],
    ['onPrimary on brand', text.onPrimary, brand.primary],
    ['placeholder on field', text.placeholder, surface.field],
    ['placeholder on page', text.placeholder, surface.page],
    ['placeholder on card', text.placeholder, surface.card],
    ['error on page', feedback.error, surface.page],
    ['error on field', feedback.error, surface.field],
    ['success on card', feedback.success, surface.card],
    ['disabled button label', text.body, border.field],
  ])('%s meets AA', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(AA)
  })

  it('does not reintroduce the placeholder ink that fails AA', () => {
    // #7A7583 is the Figma value. At full opacity it reaches only 4.03:1 on the
    // field fill; at the 50% Figma actually draws, roughly 2.1:1. See D20.1.
    expect(contrast('#7A7583', surface.field)).toBeLessThan(AA)
    expect(text.placeholder).not.toBe('#7A7583')
  })

  it('keeps text.muted away from anything a user must read', () => {
    // #CAC4D4 is decorative only. On the white card it scores ~1.7:1, which is
    // what made M00-S03's requirement rows unreadable. See D20.3.
    expect(contrast(text.muted, surface.card)).toBeLessThan(AA)
  })

  it('uses one control height everywhere', () => {
    expect(t.control.height).toBe(56)
  })

  it('keeps the two border roles distinct', () => {
    // border.field is for inputs, border.subtle for dividers and outlines.
    // Collapsing them into one value would erase the distinction the spec draws.
    expect(border.field).not.toBe(border.subtle)
  })
})
