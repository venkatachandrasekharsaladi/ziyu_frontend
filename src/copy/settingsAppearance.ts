/**
 * Copy for Settings → Appearance.
 *
 * No design draws this screen; the wording is chosen rather than read, the same
 * way `copy/appearance.ts` was. Each option names a DESTINATION — "Light", not
 * "Switch to light" — because these are three states of one control, not three
 * buttons.
 */
export const SETTINGS_APPEARANCE_COPY = {
  title: 'Appearance',
  lede: 'How your space looks on this device.',

  themeLabel: 'Theme',
  themeDetail: "Auto follows your device's light and dark setting.",
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',

  coverLabel: 'Space cover',
  coverDetail: 'Change the cover your space wears.',
  coverAction: 'Our Space',
} as const
