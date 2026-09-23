import { AntDesign } from '@expo/vector-icons'
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
 *
 * The heart is filled (`AntDesign`), not outlined (`Feather`). Feather's is a
 * thin single-weight stroke that, at 40pt inside a 96pt tile, reads as an
 * unclosed shape rather than a glyph — the app's actual brand mark, in the
 * header and every ambient decoration, is the same thin outline but never
 * scaled past ~14–30pt, where the stroke reads fine. A solid heart carries
 * the weight this size needs and doubles as the one clearly "finished"-looking
 * shape on the screen.
 *
 * The tile itself sits on `accents[0].soft` (the same warm peach tint a list
 * row's icon tile uses) rather than the flat lavender `surface.soft`, with the
 * purple wash still layered on top for depth. Sign In was otherwise the one
 * screen in the cluster with no colour beyond purple-on-purple.
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
          style={OVERLAY_STYLE}
        />
        <AntDesign name="heart" size={40} color={theme.colors.brand.primary} />
      </View>
    </View>
  )
}

/**
 * Plain style object — Unistyles styles do not reach `LinearGradient`. Same
 * note as `AuthScreenLayout`'s `GLOW_STYLE`: without this the wash rendered
 * at 0×0, so the medallion showed only its flat tile colour underneath.
 */
const OVERLAY_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

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
    backgroundColor: theme.colors.accents[0].soft,
    boxShadow: theme.elevation.medallion,
    transform: [{ rotate: '-3deg' }],
    overflow: 'hidden',
  },
}))
