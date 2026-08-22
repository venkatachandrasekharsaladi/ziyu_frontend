import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

/**
 * The envelope on M00-S04. Figma 522:248.
 *
 * Composed from primitives (spec D24): in Figma this is a rounded rect, two
 * straight flap lines and a circular seal. The flap is drawn with two rotated
 * hairline views rather than SVG, because `react-native-svg` is not a dependency
 * and Figma asset export is quota-blocked.
 */
export function EnvelopeIllustration() {
  const { theme } = useUnistyles()

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/*
        Figma has a 192pt disc of rgba(56,19,132,.1) behind the card, blurred by
        32pt. React Native cannot blur a View cross-platform, and unblurred the
        disc renders as a hard grey-purple circle with a visible edge — worse
        than no halo at all. The card's own two-layer purple shadow
        (elevation.illustration) already supplies the halo, so the disc is
        dropped rather than approximated badly.
      */}
      <View style={styles.card}>
        <View style={[styles.flap, styles.flapLeft]} />
        <View style={[styles.flap, styles.flapRight]} />

        <View style={styles.seal}>
          <Feather name="heart" size={12} color={theme.colors.feedback.error} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  card: {
    width: 128,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.surface.soft,
    // Follows the page to lavender. Figma draws #FFFCF9 to match a cream page
    // that no longer exists; left cream it would read as a beige rectangle
    // floating on lilac.
    backgroundColor: theme.colors.surface.page,
    boxShadow: theme.elevation.illustration,
    transform: [{ rotate: '-2deg' }],
    overflow: 'hidden',
  },
  flap: {
    position: 'absolute',
    top: 0,
    width: 96,
    height: 1,
    backgroundColor: theme.colors.surface.soft,
  },
  flapLeft: {
    left: -12,
    transform: [{ rotate: '36deg' }],
    transformOrigin: 'left top',
  },
  flapRight: {
    right: -12,
    transform: [{ rotate: '-36deg' }],
    transformOrigin: 'right top',
  },
  seal: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.hairline,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.field,
  },
}))
