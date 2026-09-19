import { Feather } from '@expo/vector-icons'
import { Fragment } from 'react'
import { Switch, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

type Row = {
  key: string
  label: string
  /** What a reader says instead of `label` — see the copy file's `spoken`. */
  srLabel: string
  detail: string
  value: boolean
  onValueChange: (next: boolean) => void
}

type PreferenceGroupProps = {
  title: string
  icon: FeatherName
  /** Index into `theme.colors.accents` — the group's tile colour. */
  accent: number
  rows: readonly Row[]
}

/**
 * One group of switches on Our Preferences. Figma `3430:1887`.
 *
 * NOT `SettingsToggleRow`. That row is the settings list's: it requires an icon
 * per row, draws a 16pt label and sits on its own card. The frame draws these
 * as one card per GROUP, with the icon on the group rather than the row, a
 * 20pt label, and a hairline between rows. Forcing the settings row to do both
 * jobs would have meant making its icon optional and adding a second size —
 * two new ways for it to be wrong everywhere else it is used.
 *
 * The switch keeps the `disabled`-style guard its settings cousin documents:
 * RNTL delivers `valueChange` straight to the handler, so the row reports only
 * what the platform would.
 */
export function PreferenceGroup({ title, icon, accent, rows }: PreferenceGroupProps) {
  const { theme } = useUnistyles()
  const pair = theme.colors.accents[accent] ?? theme.colors.accents[0]

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.tile, { backgroundColor: pair.soft }]}>
          <Feather name={icon} size={20} color={pair.ink} />
        </View>

        <Text variant="h3" tone="heading">
          {title}
        </Text>
      </View>

      <View style={styles.rows}>
        {rows.map((row, i) => (
          <Fragment key={row.key}>
            {i > 0 ? <View style={styles.divider} /> : null}

            <View style={styles.row}>
              <View style={styles.copy}>
                <Text variant="labelStrong" tone="heading">
                  {row.label}
                </Text>
                <Text variant="body" tone="body">
                  {row.detail}
                </Text>
              </View>

              <Switch
                value={row.value}
                onValueChange={row.onValueChange}
                accessibilityLabel={row.srLabel}
                accessibilityState={{ checked: row.value }}
                trackColor={{
                  false: theme.colors.border.field,
                  true: theme.colors.brand.primary,
                }}
                thumbColor={theme.colors.text.onPrimary}
              />
            </View>
          </Fragment>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.xxxl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.field,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
  },
  rows: {
    gap: theme.spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xxl,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subtle,
  },
}))
