import { StyleSheet } from 'react-native-unistyles'

/**
 * The shell every settings row is drawn in — the card, the icon well, the copy
 * column, and the two numbers that hold them.
 *
 * Extracted because `SettingsRow` and `SettingsToggleRow` carried byte-identical
 * copies of all three styles, plus the same 48 and the same 32 under two
 * different names (`MIN_ROW_HEIGHT` and `TOUCH_TARGET_MIN`). Two files agreeing
 * by coincidence is a thing that stops being true quietly, and the settings
 * cluster is twenty-odd more screens of these rows sitting inside one another's
 * `SectionPanel`s — a row that is 4pt shorter or 8pt further left than the row
 * under it is visible immediately and traceable to nothing.
 *
 * What stays local to each row is what differs: `SettingsRow`'s static wrapper,
 * `SettingsToggleRow`'s dimming, `SettingsChoiceRow`'s stacked control.
 */

// Minimum touch target in logical pixels. Touch targets must never shrink to
// satisfy spacing scale updates, which is why this is a number here and not
// `theme.spacing.*` — it is an affordance size, not spacing.
export const MIN_ROW_HEIGHT = 48

// Icon-well diameter in logical pixels. Same rule: it must not scale with the
// spacing scale, because it is an affordance size, not spacing.
export const ICON_WELL_SIZE = 32

export const rowShell = StyleSheet.create((theme) => ({
  /** The card a row sits on, and the line its icon and copy share. */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: MIN_ROW_HEIGHT,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
  },
  /** The leading disc. Reserved even when a row has no icon, so labels line up. */
  iconWell: {
    width: ICON_WELL_SIZE,
    height: ICON_WELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  /** Label over optional detail. Takes the room the trailing control leaves. */
  copy: {
    flex: 1,
    gap: 2,
  },
}))
