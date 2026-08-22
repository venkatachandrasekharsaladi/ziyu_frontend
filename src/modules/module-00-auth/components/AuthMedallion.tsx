import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

/**
 * The 96pt lavender medallion on M00-S02. Figma 522:68.
 *
 * Composed from primitives rather than imported as artwork: in Figma it is a
 * rounded rect, a 45° gradient overlay and a heart glyph, so building it this way
 * is faithful reconstruction, not substitution (spec D24). It also means the
 * cluster needs no Figma asset exports, which are quota-blocked.
 */
export function AuthMedallion() {
  const { theme } = useUnistyles()

  return (
    <View
      style={styles.wrapper}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.medallion}>
        <LinearGradient
          colors={[theme.colors.surface.wash, theme.colors.surface.washFade]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.overlay}
        />
        <Feather name="heart" size={40} color={theme.colors.brand.primary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.medallion,
    backgroundColor: theme.colors.surface.soft,
    boxShadow: theme.elevation.medallion,
    transform: [{ rotate: '-3deg' }],
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}))
