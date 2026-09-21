import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'

type PlanCardProps = {
  icon: keyof typeof Feather.glyphMap
  /** The corner label — "Active Board", "Sealed Vault". */
  chip: string
  title: string
  lede: string
  /** The live figure this card reports. */
  status: string
  statusDetail?: string | null
  /** Which of the theme's three accent pairs tints the icon tile. */
  accent: 0 | 1 | 2
  onPress: () => void
}

/**
 * One card on the hub grid — Figma 3482:3155, the six-card block under
 * "Chapters & collections".
 *
 * The accent comes from `theme.colors.accents`, the three tint/ink pairs the
 * design system already ships and the home screen's row icons already use. The
 * frame draws six differently-coloured tiles; six new colours would have meant
 * six new tokens that no contrast test covers, so the six cards cycle the three
 * audited pairs instead. Adjacent cards never share one.
 */
export function PlanCard({
  icon,
  chip,
  title,
  lede,
  status,
  statusDetail,
  accent,
  onPress,
}: PlanCardProps) {
  const { theme } = useUnistyles()
  const pair = theme.colors.accents[accent]

  return (
    <View style={styles.cell}>
      <PressableScale onPress={onPress} accessibilityLabel={`${title}. ${status}`}>
        <View style={styles.card}>
          <View style={styles.top}>
            <View style={[styles.tile, { backgroundColor: pair.soft }]}>
              <Feather name={icon} size={16} color={pair.ink} />
            </View>

            <Text variant="countdown" tone="placeholder">
              {chip.toUpperCase()}
            </Text>
          </View>

          <View style={styles.body}>
            <Text variant="labelStrong" tone="heading">
              {title}
            </Text>

            <Text variant="footnote" tone="body">
              {lede}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text variant="footnote" tone="brand">
              {status}
            </Text>

            {statusDetail ? (
              <Text variant="countdown" tone="placeholder">
                {statusDetail}
              </Text>
            ) : null}
          </View>
        </View>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  /*
   * The grid is two flex cells per row rather than a fixed column width.
   * `minWidth: 0` is what lets a long title wrap instead of forcing the cell
   * wider than half the column — without it one card pushes the other off.
   */
  cell: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  card: {
    minHeight: 168,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  tile: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  footer: {
    gap: 2,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
}))
