import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = {
  /** Tapping the backdrop, anywhere the content is not. */
  onDismiss: () => void
  /** What that backdrop control announces — "Dismiss attachments", say. */
  dismissLabel: string
  /**
   * Where the content sits against the backdrop. `centre` for something that
   * floats (a dialog, an action menu); `bottom` for a sheet that rises from
   * the edge and spans the full width.
   */
  align?: 'centre' | 'bottom'
  children: ReactNode
}

/**
 * A dimmed backdrop with content floating over it, dismissed by tapping
 * outside.
 *
 * The backdrop is a SIBLING of the content, never its parent. That is the
 * whole reason this exists: every screen that hand-rolled this made the scrim
 * a `Pressable` and put the content inside it, which on web renders a real
 * `<button>` containing the content's own `<button>`s — invalid HTML that
 * React reports as a hydration error ("<button> cannot be a descendant of
 * <button>"), and a nested control that neither a keyboard nor a screen reader
 * can navigate sensibly. Laying the two side by side, with the content on top,
 * fixes the markup and removes the tap-swallowing wrapper each copy needed to
 * stop presses bubbling into the backdrop.
 *
 * `box-none` on the content layer is what keeps the backdrop reachable: the
 * layer fills the screen but does not itself take a press, so a tap outside
 * the children falls straight through to dismiss.
 */
export function Overlay({ onDismiss, dismissLabel, align = 'centre', children }: Props) {
  styles.useVariants({ align })

  return (
    <View style={styles.layer}>
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={dismissLabel}
      />

      {/* `box-none` is what keeps the backdrop reachable: this layer fills the
          screen but takes no press of its own, so a tap outside the children
          falls straight through to dismiss. */}
      {/* The DEPRECATED `pointerEvents` prop, on purpose. React Native 0.86
          wants this in `style`, and react-native-web silently ignores it
          there — the layer then computes to `pointer-events: auto`, covers
          the backdrop, and tap-to-dismiss stops working while every test
          still passes (measured in the browser, not assumed). The prop is
          the only form that reaches CSS here. Revisit when react-native-web
          maps the style property. */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  layer: { ...StyleSheet.absoluteFillObject },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.surface.scrim },
  content: {
    flex: 1,
    // The layer fills the screen but takes no press of its own, so a tap
    variants: {
      align: {
        centre: {
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        // No inset: a sheet meets both edges and carries its own padding.
        bottom: { justifyContent: 'flex-end' },
      },
    },
  },
}))
