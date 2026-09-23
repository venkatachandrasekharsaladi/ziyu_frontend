import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import type { CoverStyle } from '@/state/spaceStore'

type CoverPreviewProps = {
  coverStyle: CoverStyle
  label: string
}

const EMOJI: Record<CoverStyle, string> = {
  dawn: '🌅',
  dusk: '🌆',
  night: '🌙',
}

/**
 * The couple's space, previewed as a time-of-day gradient — `theme.colors.cover`.
 *
 * Lives on M01-S20's own picker (so choosing a style shows it changing
 * something, not just a segment lighting up) and on Our Space settings (so
 * the choice is still visible after the fact, not a preference collected and
 * never shown again).
 *
 * White text over three very different gradients needs one thing to stay
 * legible on all of them: `surface.scrim`, the same token the Album Detail
 * hero already reads white text over a photo through, at a strength already
 * checked for exactly this "unknown brightness underneath" case.
 */
export function CoverPreview({ coverStyle, label }: CoverPreviewProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.frame}>
      <LinearGradient colors={theme.colors.cover[coverStyle]} style={GRADIENT_FILL}>
        <View style={[SCRIM_FILL, { backgroundColor: theme.colors.surface.scrim }]} />
        <Text variant="labelStrong" tone="onPrimary" align="center">
          {EMOJI[coverStyle]}  {label}
        </Text>
      </LinearGradient>
    </View>
  )
}

/**
 * Plain style objects — Unistyles styles do not reach `LinearGradient`. See
 * `WelcomeScreen`'s `GRADIENT_SCREEN` for the failure this avoids: every
 * property arrives stripped, not just the ones that happen to matter here.
 */
const GRADIENT_FILL = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
} as const

const SCRIM_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

const styles = StyleSheet.create((theme) => ({
  frame: {
    width: '100%',
    height: 96,
    borderRadius: theme.radii.field,
    overflow: 'hidden',
  },
}))
