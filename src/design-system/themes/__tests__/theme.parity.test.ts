import {
  lavenderTheme,
  midnightTheme,
  themeNameOf,
  themes,
  type ThemeName,
} from '@/design-system/themes/theme'

const NAMES = Object.keys(themes) as ThemeName[]

/** `{ a: { b: 'x' } }` -> `{ 'a.b': 'x' }`, arrays included by index. */
function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') {
    out[prefix] = value

    return out
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, `${prefix}.${i}`, out))

    return out
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
    }
  }

  return out
}

const flat = Object.fromEntries(
  NAMES.map((name) => [name, flatten(themes[name].colors)] as const),
) as Record<ThemeName, Record<string, string>>

/**
 * Colours that are the SAME in both themes on purpose.
 *
 * Both are pale bar fills on the password-strength meter. They were chosen to
 * read against a light track and they read against a dark one too, so there is
 * nothing to invert. Anything NOT on this list must differ between themes —
 * that is the assertion below, and it is what catches a dark token that was
 * copied from the light palette and never actually darkened.
 */
const SHARED_ON_PURPOSE = ['strength.weak', 'strength.fair']

/**
 * The structural half of dark-mode testing.
 *
 * `ThemeColors` already makes a MISSING token a compile error. This covers what
 * the type cannot see: that the values are real colours, that they actually
 * differ, that the two themes agree on everything which is not a colour, and
 * that `themeNameOf` — which the mode hook and the whole test harness lean on —
 * can tell them apart.
 */
describe('theme parity', () => {
  it('registers both themes under the names the app configures', () => {
    expect(NAMES).toEqual(['lavender', 'midnight'])
    expect(themes.lavender).toBe(lavenderTheme)
    expect(themes.midnight).toBe(midnightTheme)
  })

  it('gives every theme exactly the same set of colour tokens', () => {
    const [first, ...rest] = NAMES
    const expected = Object.keys(flat[first]).sort()

    // Not just the same count — the same paths. A dark theme with `border.hair`
    // where the light one has `border.hairline` would pass a count check.
    for (const name of rest) {
      expect(Object.keys(flat[name]).sort()).toEqual(expected)
    }
  })

  it('gives every colour token a value a renderer can use', () => {
    const usable = /^(#[0-9A-Fa-f]{6}|rgba?\([\d.,\s]+\))$/

    for (const name of NAMES) {
      for (const [path, value] of Object.entries(flat[name])) {
        expect(`${name}.${path} = ${value}`).toMatch(
          new RegExp(`= (#[0-9A-Fa-f]{6}|rgba?\\([\\d.,\\s]+\\))$`),
        )
        expect(usable.test(value)).toBe(true)
      }
    }
  })

  it('actually repaints — every colour differs between the themes', () => {
    const same = Object.keys(flat.lavender).filter(
      (path) => flat.lavender[path] === flat.midnight[path],
    )

    // A token that is identical in both is a token dark mode forgot, unless it
    // is on the list of ones that were never meant to move.
    expect(same.sort()).toEqual([...SHARED_ON_PURPOSE].sort())
  })

  it('ships the same number of row accents, so a row keeps its colour slot', () => {
    const counts = NAMES.map((name) => themes[name].colors.accents.length)

    expect(new Set(counts).size).toBe(1)
    // Cycling is by index. Different lengths would move every row's accent when
    // the theme changed, which looks like a bug and is one.
    expect(counts[0]).toBeGreaterThan(1)
  })

  it('shares every non-colour token group by identity, not by copy', () => {
    // Dark mode is a repaint, not a relayout. Sharing the actual object is the
    // strongest form of that guarantee: there is no second value to drift.
    for (const group of ['spacing', 'radii', 'typography', 'elevation', 'control', 'layout', 'motion'] as const) {
      expect(midnightTheme[group]).toBe(lavenderTheme[group])
    }
  })

  it('puts each theme on one end of the light/dark axis, and not the same end', () => {
    expect(lavenderTheme.scheme).toBe('light')
    expect(midnightTheme.scheme).toBe('dark')
  })

  it('gives each theme a distinct page ground', () => {
    // This is what makes `themeNameOf` total, and with it `activeTheme()` in the
    // test harness. If two themes ever share a page ground, both break quietly.
    const grounds = NAMES.map((name) => themes[name].colors.surface.page)

    expect(new Set(grounds).size).toBe(NAMES.length)
  })

  it('resolves every theme back to its own name', () => {
    for (const name of NAMES) {
      expect(themeNameOf(themes[name])).toBe(name)
    }
  })

  it('falls back on the scheme rather than throwing for an unknown theme', () => {
    // A theme this module has not been told about is a config mistake; taking
    // down the screen over it is worse than picking the nearer of the two.
    const stranger = {
      colors: { ...midnightTheme.colors, surface: { ...midnightTheme.colors.surface, page: '#010203' } },
      scheme: 'dark',
    } as const

    expect(themeNameOf(stranger)).toBe('midnight')
  })
})
