import { type ReactNode, useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, View, type LayoutChangeEvent } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text, type TextTone } from '@/design-system/primitives/Text'

export type ButtonVariant = 'primary' | 'soft' | 'outline' | 'link'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  /** Shows a spinner, blocks presses, and reports `busy` to a screen reader. */
  loading?: boolean
  /** Content after the label — M00-S02's arrow, M00-S04's countdown. */
  trailing?: ReactNode
  /** Overrides the label read out by a screen reader. */
  accessibilityLabel?: string
}

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  soft: 'brand',
  outline: 'brand',
  link: 'link',
}

/**
 * The only button in the app.
 *
 * Figma drew five different primary buttons across the five M00 screens —
 * three heights, three label sizes and four shadow colours, with no two frames
 * agreeing. This is the one they normalise to: one control height (spec D14),
 * `labelStrong` (D15) and a black two-stack shadow (D16).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  trailing,
  accessibilityLabel,
}: ButtonProps) {
  const isBlocked = disabled || loading

  styles.useVariants({ variant, disabled: isBlocked })

  const { theme } = useUnistyles()

  /*
   * The label's own centering, independent of whatever sits after it.
   *
   * `content` used to be a single `justifyContent: 'center'` row, which
   * centres the LABEL+TRAILING PAIR as one block — correct with no trailing,
   * but with one (Verify Email's countdown, Sign In's arrow) the label itself
   * sat left of centre by roughly half the trailing's width. Mirroring an
   * invisible spacer of that same measured width on the other side keeps the
   * row symmetric around the label, so the label's own midpoint lands back on
   * the button's midpoint regardless of how wide the trailing content is.
   * `loading`'s spinner goes through the same slot so it gets the same
   * treatment.
   */
  const [trailingWidth, setTrailingWidth] = useState(0)
  const measureTrailing = useCallback((event: LayoutChangeEvent) => {
    setTrailingWidth(event.nativeEvent.layout.width)
  }, [])

  // Navigation is not instant. Without this guard a fast double tap pushes the
  // destination twice and the user has to press back twice to escape.
  const isHandling = useRef(false)

  const handlePress = useCallback(() => {
    if (isHandling.current) return

    isHandling.current = true
    onPress()

    // Long enough to swallow a double tap, short enough that a user returning
    // to this screen finds the button live again.
    setTimeout(() => {
      isHandling.current = false
    }, 600)
  }, [onPress])

  // A disabled primary loses its purple fill for a grey one, so its label has to
  // switch from white to body ink to stay legible. See spec D20.4.
  const tone = isBlocked && variant === 'primary' ? 'body' : LABEL_TONE[variant]

  return (
    <Pressable
      onPress={handlePress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={styles.pressable}
    >
      <View style={styles.content}>
        {loading || trailing ? <View style={{ width: trailingWidth }} /> : null}

        <Text variant="labelStrong" tone={tone} align="center">
          {label}
        </Text>

        {loading ? (
          <View onLayout={measureTrailing}>
            <ActivityIndicator
              size="small"
              color={
                variant === 'primary' ? theme.colors.text.onPrimary : theme.colors.brand.primary
              }
            />
          </View>
        ) : trailing ? (
          <View onLayout={measureTrailing}>{trailing}</View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    width: '100%',
    variants: {
      variant: {
        primary: {
          height: theme.control.height,
          backgroundColor: theme.colors.brand.primary,
          boxShadow: theme.elevation.control,
        },
        soft: {
          height: theme.control.height,
          backgroundColor: theme.colors.surface.field,
        },
        outline: {
          height: theme.control.height,
          backgroundColor: theme.colors.surface.card,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        },
        link: {
          paddingVertical: theme.spacing.md,
        },
      },
      disabled: {
        // NOT opacity. Dimming the fill renders white on an effective #9A85C2,
        // about 3.22:1 — permitted for an inactive control, but illegible. A
        // solid grey fill with body ink reaches 5.48:1. See spec D20.4.
        true: {
          backgroundColor: theme.colors.border.field,
          borderColor: theme.colors.border.field,
          boxShadow: 'none',
        },
        false: {},
      },
    },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
}))
