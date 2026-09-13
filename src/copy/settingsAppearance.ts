/**
 * Copy for Settings → Appearance.
 *
 * No design draws this screen; the wording is chosen rather than read, the same
 * way `copy/appearance.ts` was. Each option names a DESTINATION — "Light", not
 * "Switch to light" — because these are three states of one control, not three
 * buttons.
 *
 * A PANEL NAMES THE GROUP, A ROW NAMES THE SETTING, and the two are never the
 * same word. `themeLabel` alone used to do both jobs here, so "Theme" was the
 * panel title, the row label and the control's accessible name — three of the
 * same word stacked on one screen. `settingsAccessibility.ts` already had this
 * right with "Display" over "Text size", and twenty more screens will copy
 * whichever of the two they read first.
 */
export const SETTINGS_APPEARANCE_COPY = {
  title: 'Appearance',
  lede: 'How your space looks on this device.',

  displayGroup: 'Display',
  themeLabel: 'Theme',
  themeDetail: "Auto follows your device's light and dark setting.",
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',

  coverLabel: 'Space cover',
  coverDetail: 'Change the cover your space wears.',
  coverAction: 'Our Space',
} as const
