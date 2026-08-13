import { Feather } from '@expo/vector-icons'
import { type ReactNode, useCallback, useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type InputProps = {
  label: string
  value: string
  onChangeText: (next: string) => void
  placeholder?: string
  /** When set, the message is ALWAYS rendered — the state never rests on colour. */
  error?: string
  /** Masks the value and renders a reveal toggle. */
  secure?: boolean
  /** Sits on the label row, right-aligned. M00-S02's "Forgot password?". */
  labelTrailing?: ReactNode
  keyboardType?: TextInputProps['keyboardType']
  autoComplete?: TextInputProps['autoComplete']
  autoCapitalize?: TextInputProps['autoCapitalize']
  editable?: boolean
  onBlur?: () => void
}

/**
 * The only text field in the app.
 *
 * Figma drew three different treatments across three screens. This is the one
 * they normalise to: filled, radius 12, one control height, label above (spec
 * D17). M00-S03's inset-label version was rejected — it is a floating-label
 * pattern needing a focus animation the design never specifies, and as drawn it
 * vanishes the moment the user types.
 *
 * Focus, error and disabled are INVENTED. No frame draws them.
 *
 * Accessibility note: React Native has no `aria-invalid`, so an error is carried
 * by two mechanisms that do work — `accessibilityHint` on the field, and a polite
 * live region on the message so its appearance is announced rather than only
 * seen.
 */
export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  labelTrailing,
  keyboardType,
  autoComplete,
  autoCapitalize = 'none',
  editable = true,
  onBlur,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const state = !editable ? 'disabled' : error ? 'error' : isFocused ? 'focused' : 'rest'

  styles.useVariants({ state })

  const { theme } = useUnistyles()

  const handleFocus = useCallback(() => setIsFocused(true), [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const toggleReveal = useCallback(() => setIsRevealed((previous) => !previous), [])

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="caption" tone="body">
          {label}
        </Text>
        {labelTrailing}
      </View>

      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          secureTextEntry={secure && !isRevealed}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={error}
          style={styles.textInput}
        />

        {secure ? (
          <Pressable
            onPress={toggleReveal}
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}
            style={styles.toggle}
          >
            <Feather
              name={isRevealed ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.text.placeholder}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View testID="input-error" aria-live="polite">
          <Text variant="footnote" tone="error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.control.height,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    variants: {
      state: {
        rest: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.border.field,
          boxShadow: theme.elevation.field,
        },
        // Focus intensifies the border the field already has, rather than
        // introducing a new mechanism, and adds a ring as a second cue.
        focused: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.brand.primary,
          boxShadow: '0px 0px 0px 3px rgba(56, 19, 132, 0.12)',
        },
        error: {
          backgroundColor: theme.colors.surface.field,
          borderColor: theme.colors.feedback.error,
          boxShadow: theme.elevation.field,
        },
        // Reads as inert by losing its fill, not by dimming its legibility.
        disabled: {
          backgroundColor: theme.colors.surface.page,
          borderColor: theme.colors.border.subtle,
          boxShadow: 'none',
        },
      },
    },
  },
  textInput: {
    flex: 1,
    ...theme.typography.label,
    color: theme.colors.text.heading,
    // Android adds its own vertical padding, which would break the 56pt box.
    paddingVertical: 0,
  },
  toggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -theme.spacing.sm,
  },
}))
