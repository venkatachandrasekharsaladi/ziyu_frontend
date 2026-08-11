import { useCallback, useRef } from 'react'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text, type TextTone } from '@/design-system/primitives/Text'

export type ButtonVariant = 'primary' | 'link' | 'outline'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  /** Overrides the label read out by a screen reader. */
  accessibilityLabel?: string
}

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  link: 'link',
  outline: 'brand',
}

/**
 * The only button in the app.
 *
 * All three variants are defined now, against M00-S01 *and* M00-S02, so the
 * component is settled once rather than invented on one screen and rebuilt on
 * the next (`SCREENS.md` rule 7). `outline` is what the Google and Apple
 * buttons on Sign In will use; it renders correctly today but nothing
 * currently mounts it.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  styles.useVariants({ variant, disabled })

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

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={styles.pressable}
    >
      <Text variant="label" tone={LABEL_TONE[variant]} align="center">
        {label}
      </Text>
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
          backgroundColor: theme.colors.brand.primary,
          paddingVertical: theme.spacing.xxl,
          // Figma renders two stacked shadows in black at 10% — not a purple
          // tint. `boxShadow` is the only style that can express both.
          boxShadow:
            '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
        },
        link: {
          paddingVertical: theme.spacing.md,
        },
        outline: {
          backgroundColor: theme.colors.text.onPrimary,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
          paddingVertical: theme.spacing.lg,
        },
      },
      disabled: {
        true: { opacity: 0.5 },
        false: { opacity: 1 },
      },
    },
  },
}))
