import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

/**
 * The photo-collage hero. Figma 522:286.
 *
 * The asset is a real transparent PNG — the white paper the collage sat on in
 * Figma's export was flood-filled out (everything reachable from the four
 * corners at ~white, feathered 1px so the edge stays anti-aliased instead of
 * jagged), so it drops onto the page gradient with plain alpha compositing.
 *
 * An earlier version relied on `mixBlendMode: 'multiply'` against a fully
 * opaque white-background export instead, matching how Figma composites the
 * layer. That reads correctly in Figma and on native, but on web the blend
 * only ever multiplied against a transparent backdrop local to the image's
 * own wrapper — never the true page gradient several elements up — leaving a
 * visible white rectangle behind the photos on every browser. Real
 * transparency has no backdrop-chain to depend on, so it is correct
 * everywhere the same way.
 *
 * `flexShrink` still matters: the design frame is 869.89pt tall — taller than
 * a small phone. The hero is the one block allowed to give up space, so the
 * primary button can never be pushed off-screen.
 *
 * `contentFit="contain"` reproduces Figma's inner offset for free: fitting
 * the artwork to a 280×405.89 box yields a 272pt width, centred — the
 * 97.11% / 1.44% inset the design specifies.
 */
export function HeroCollage() {
  return (
    <View style={styles.frame}>
      <Image
        source={require('@/assets/images/welcome/hero.png')}
        style={IMAGE}
        contentFit="contain"
        accessibilityIgnoresInvertColors
        alt="A couple together, with photographs of shared moments"
      />
    </View>
  )
}

const ASPECT_RATIO = 280 / 405.89

/**
 * Plain style object — Unistyles styles do not reach expo-image.
 *
 * Unistyles binds its styles to the native shadow node and does not process
 * expo-image, so a Unistyles style handed to `<Image>` arrives with `width`
 * and `height` stripped. The artwork then drew 0×0 inside a frame that kept
 * its shape — a hero-sized hole where the collage should be, with nothing in
 * the logs to say why. Six other components already carry this same note;
 * this was the one left behind.
 */
const IMAGE = {
  width: '100%',
  height: '100%',
} as const

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 280,
    maxHeight: 405.89,
    aspectRatio: ASPECT_RATIO,
    flexShrink: 1,
    alignSelf: 'center',
  },
})
