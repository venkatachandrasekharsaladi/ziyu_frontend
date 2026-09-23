import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

/**
 * Decorative hearts and sparkles that float behind the Welcome content.
 * Figma 522:272.
 *
 * Positions are percentages, not the absolute offsets Figma lists. The design
 * frame is a fixed 869.89pt tall; a real screen is not. Percentages keep the
 * elements in the same visual relationship on a small phone as on a large one.
 *
 * The whole layer is hidden from assistive tech — these shapes carry no
 * meaning and announcing four unlabelled images would only add noise.
 *
 * Two plain colour dots ride alongside the four line-art shapes — rose and
 * peach, the same pair `PasswordRequirements`' strength meter already uses
 * and the only two colours in the palette explicitly marked decorative-only.
 * Every other shape here is a single outline hue; without them the app's
 * only screen that isn't purple-on-purple read as flat rather than warm.
 */
/**
 * Each shape carries its OWN complete style, `position` included.
 *
 * Plain objects, because Unistyles styles do not reach expo-image — it binds to
 * the native shadow node and does not process expo-image, so anything from
 * `StyleSheet.create` arrives stripped. These entries were already plain, which
 * is why the shapes had their sizes; `position: 'absolute'` was coming from a
 * Unistyles style beside them and was the one property being dropped, so the
 * decoration laid itself out in flow instead of floating behind the content.
 */
const AMBIENT = [
  {
    key: 'heart-outline',
    source: require('@/assets/icons/ambient-heart-outline.svg'),
    style: { position: 'absolute', left: '10.77%', top: '20.69%', width: 30, height: 27.5 },
  },
  {
    key: 'sparkle-xs',
    source: require('@/assets/icons/ambient-sparkle-xs.svg'),
    style: { position: 'absolute', right: '20%', top: '15%', width: 24, height: 36 },
  },
  {
    key: 'star',
    source: require('@/assets/icons/ambient-star.svg'),
    style: { position: 'absolute', right: '5%', top: '40%', width: 48, height: 56 },
  },
  {
    key: 'sparkle-sm',
    source: require('@/assets/icons/ambient-sparkle-sm.svg'),
    style: { position: 'absolute', right: '15%', top: '60%', width: 30, height: 41 },
  },
] as const

export function AmbientLayer() {
  const { theme } = useUnistyles()

  return (
    <View
      style={styles.layer}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {AMBIENT.map(({ key, source, style }) => (
        <Image key={key} source={source} style={style} contentFit="contain" />
      ))}

      <View style={[DOT_ROSE, { backgroundColor: theme.colors.strength.weak }]} />
      <View style={[DOT_PEACH, { backgroundColor: theme.colors.strength.fair }]} />
    </View>
  )
}

const DOT_ROSE = {
  position: 'absolute',
  left: '72%',
  top: '8%',
  width: 10,
  height: 10,
  borderRadius: 5,
  opacity: 0.8,
} as const

const DOT_PEACH = {
  position: 'absolute',
  left: '14%',
  top: '46%',
  width: 8,
  height: 8,
  borderRadius: 4,
  opacity: 0.8,
} as const

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    // Decoration must never intercept a tap meant for the button beneath it.
    pointerEvents: 'none',
  },
})
