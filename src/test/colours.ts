import { elevation } from '@/design-system/tokens/elevation'
import { themes, type AppTheme, type ThemeName } from '@/design-system/themes/theme'

/** Every string leaf under an object, arrays included. */
function leaves(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => leaves(item, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => leaves(child, out))
  }

  return out
}

/** The rgba(...) values baked into the shared `elevation` shadow strings. */
const elevationColours = leaves(elevation).flatMap(
  (shadow) => shadow.match(/rgba?\([^)]*\)/g) ?? [],
)

/** Every colour a given theme can legitimately put on screen. */
export function themeColours(theme: AppTheme): Set<string> {
  return new Set([...leaves(theme.colors), ...elevationColours].map((c) => c.toLowerCase()))
}

/**
 * Colours that appear in a rendered tree without coming from the theme, and are
 * fine.
 *
 * Kept SHORT on purpose. Every entry is a place the app cannot express a colour
 * through a token, and each one is a small hole in theming — so the list is the
 * honest record of them rather than a way to silence the check.
 */
const NOT_A_THEME_COLOUR = new Set([
  'transparent',
  // RN resolves an absent colour to these; neither paints anything.
  '#00000000',
  'rgba(0, 0, 0, 0)',
])

/** Colour-bearing style keys, plus the `color` prop that icon sets take. */
const COLOUR_KEYS = /(^color$|Color$)/

/**
 * Every colour actually present in a rendered tree.
 *
 * Walks what `render(...).toJSON()` produced, reading style objects and the
 * `color` props the icon components take. This is the mechanism behind the
 * "every corner" claim: rather than asserting a handful of components by testID,
 * it harvests the whole tree and checks the lot.
 *
 * `boxShadow` is parsed for its rgba parts too, because a focus ring hides a
 * colour inside a string where no style key names it.
 */
export function renderedColours(tree: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(tree)) {
    tree.forEach((child) => renderedColours(child, out))

    return out
  }

  if (!tree || typeof tree !== 'object') return out

  const node = tree as { props?: Record<string, unknown>; children?: unknown }
  const props = node.props ?? {}

  const styles = Array.isArray(props.style) ? props.style.flat(Infinity) : [props.style]

  for (const style of styles) {
    if (!style || typeof style !== 'object') continue

    for (const [key, value] of Object.entries(style)) {
      if (typeof value !== 'string') continue

      if (COLOUR_KEYS.test(key)) out.add(value.toLowerCase())
      if (key === 'boxShadow') {
        for (const rgba of value.match(/rgba?\([^)]*\)/g) ?? []) out.add(rgba.toLowerCase())
      }
    }
  }

  // Icon sets and LinearGradient take colours as props, not styles.
  if (typeof props.color === 'string') out.add(props.color.toLowerCase())
  if (Array.isArray(props.colors)) {
    for (const c of props.colors) if (typeof c === 'string') out.add(c.toLowerCase())
  }

  renderedColours(node.children, out)

  return out
}

/**
 * Split a rendered tree's colours into: ones the active theme owns, ones that
 * belong to a DIFFERENT theme, and ones from nowhere in particular.
 *
 * The middle bucket is the one that matters — a colour only the other theme
 * defines is a hardcoded value or a token read off the wrong theme, and it is
 * exactly what "dark mode is broken in this one spot" looks like.
 */
export function auditColours(tree: unknown, active: ThemeName) {
  const found = renderedColours(tree)
  const mine = themeColours(themes[active])

  const otherNames = (Object.keys(themes) as ThemeName[]).filter((n) => n !== active)
  const foreign = new Set<string>()

  for (const name of otherNames) {
    for (const colour of themeColours(themes[name])) {
      if (!mine.has(colour)) foreign.add(colour)
    }
  }

  return {
    found: [...found],
    fromOtherTheme: [...found].filter((c) => foreign.has(c)),
    untokenised: [...found].filter((c) => !mine.has(c) && !NOT_A_THEME_COLOUR.has(c)),
  }
}
