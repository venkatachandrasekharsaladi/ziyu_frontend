/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * Four of this cluster's decisions are contrast fixes (spec D20). Without a
 * test, a later "tidy the palette" commit silently undoes them.
 *
 * Accepts 6-digit hex only. Tokens carrying alpha are not comparable this way —
 * a translucent colour's contrast depends on what is behind it, so those are
 * resolved to their composited value before being passed here.
 */
function channel(value: number): number {
  const c = value / 255

  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const n = hex.replace('#', '')

  if (n.length !== 6) {
    throw new Error(`luminance() needs a 6-digit hex, received "${hex}"`)
  }

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
