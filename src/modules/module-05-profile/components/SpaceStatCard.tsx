import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { CountUp } from '@/design-system/primitives/CountUp'
import { Text } from '@/design-system/primitives/Text'

type SpaceStatCardProps = {
  /** The small uppercase line above the number. */
  eyebrow: string
  value: number
  /** Reads under the number — "days of shared memories". */
  label: string
  /** A quieter line under that, with an optional icon. */
  footnote?: string
  footnoteIcon?: FeatherName
}

/**
 * One large number, said once.
 *
 * Figma `3430:2369`. The number is `CountUp` rather than static text because
 * every other big figure in this app counts up to itself, and a days-together
 * total that simply appears is the one that looks like a served value rather
 * than something the app has been keeping.
 *
 * The eyebrow is NOT a heading. It labels the number beneath it, and a screen
 * reader that treats it as a heading would offer "TIME TOGETHER" as a landmark
 * to jump to and then land on a card with no content of its own.
 */
export function SpaceStatCard({
  eyebrow,
  value,
  label,
  footnote,
  footnoteIcon,
}: SpaceStatCardProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.card}>
      <Text variant="caption" tone="body" align="center">
        {eyebrow}
      </Text>

      <CountUp
        value={value}
        variant="countdown"
        tone="brand"
        align="center"
        format={(n) => n.toLocaleString()}
      />

      <Text variant="body" tone="heading" align="center">
        {label}
      </Text>

      {footnote ? (
        <View style={styles.footnote}>
          {footnoteIcon ? (
            <Feather name={footnoteIcon} size={11} color={theme.colors.text.placeholder} />
          ) : null}
          <Text variant="footnote" tone="placeholder">
            {footnote}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
}))
