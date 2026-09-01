import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

/**
 * The photo-collage hero. Figma 522:286.
 *
 * Two things are load-bearing here:
 *
 * 1. `mixBlendMode: 'multiply'`. The artwork's background is pure white, and
 *    white multiplied over anything leaves it untouched — so the page gradient
 *    shows through exactly as Figma composites it, at any position and any
 *    screen height.
 *
 *    HOW THE ASSET WAS MADE — do not regenerate it by plain export. Figma's
 *    export of node 522:288 flattens the multiply, baking the page gradient
 *    into the pixels (its corner reads #FBF5FF, not white). Multiplying that a
 *    second time double-darkens it and the hero shows as a visible rectangle.
 *    The committed asset is that 3× export with the bake divided back out:
 *
 *        artwork = export × 255 / gradient(y)
 *
 *    where gradient(y) is the page gradient across the node's 405.89pt band
 *    starting at y=66 in the 919.89pt frame. Verified: re-multiplying the
 *    result reproduces Figma's export to within 1/255. This buys the full
 *    840×1218 (3×) detail while keeping the blend correct — the raw source
 *    image is only 343×512 and would upscale 2.45× on a 3× display.
 *
 *    `contentFit="contain"` reproduces Figma's inner offset for free: fitting
 *    the artwork to a 280×405.89 box yields a 272pt width, centred — the
 *    97.11% / 1.44% inset the design specifies.
 * 2. `flexShrink`. The design frame is 869.89pt tall — taller than a small
 *    phone. The hero is the one block allowed to give up space, so the primary
 *    button can never be pushed off-screen.
 *
 * Deliberately no background fill: `multiply` composites against whatever sits
 * behind it, so a solid colour here would blend the artwork against a flat
 * block instead of the page gradient. A decode failure cannot collapse the
 * layout anyway — `aspectRatio` fixes the box height with or without pixels.
 */
export function HeroCollage() {
  return (
    <View style={styles.frame}>
      <Image
        source={require('@/assets/images/welcome/hero.png')}
        style={IMAGE}
        contentFit="contain"
        transition={200}
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
 * expo-image, so a Unistyles style handed to `<Image>` arrives with `width`,
 * `height` and `mixBlendMode` all stripped. The artwork then drew 0×0 inside a
 * frame that kept its shape — a hero-sized hole where the collage should be,
 * with nothing in the logs to say why. Six other components already carry this
 * same note; this was the one left behind.
 *
 * `mixBlendMode` is load-bearing, not decoration — see note 1 above — so losing
 * it silently would have been the subtler half of the bug even once the
 * dimensions came back.
 */
const IMAGE = {
  width: '100%',
  height: '100%',
  mixBlendMode: 'multiply',
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
