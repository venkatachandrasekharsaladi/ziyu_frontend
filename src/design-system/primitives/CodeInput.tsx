import { useCallback, useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type CodeInputProps = {
  label: string
  value: string
  onChangeText: (next: string) => void
  length?: number
  error?: string
}

/**
 * Segmented code entry.
 *
 * ONE hidden `TextInput` backs every box, so the keyboard, autofill and paste
 * all behave normally; the boxes are presentation. Six independent inputs look
 * identical on screen and break all three.
 *
 * Per-box state uses discrete styles rather than Unistyles `variants`, for two
 * reasons: `useVariants` applies to the whole stylesheet and so cannot differ
 * per item, and discrete styles survive the Jest mock, which strips variants.
 */
export function CodeInput({ label, value, onChangeText, length = 6, error }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (next: string) => {
      // Accepts a pasted "L8V · 7QK" as readily as typed characters — that is
      // the form the user sees and therefore the form they will paste.
      const clean = next
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, length)

      onChangeText(clean)
    },
    [onChangeText, length],
  )

  const focus = useCallback(() => inputRef.current?.focus(), [])

  const chars = Array.from({ length }, (_, i) => value[i] ?? '')
  const caretIndex = Math.min(value.length, length - 1)

  return (
    <View style={styles.container}>
      <Text variant="caption" tone="body">
        {label}
      </Text>

      <Pressable style={styles.row} onPress={focus} accessibilityRole="none">
        {chars.map((char, index) => {
          const isCaret = isFocused && index === caretIndex

          return (
            <View
              key={index}
              testID="code-box"
              style={[styles.box, error ? styles.boxError : isCaret ? styles.boxCaret : null]}
            >
              <Text variant="h2" tone="heading">
                {char}
              </Text>
            </View>
          )
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={error}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="one-time-code"
        maxLength={length}
        style={styles.hidden}
      />

      {error ? (
        <View testID="code-error" aria-live="polite">
          <Text variant="footnote" tone="error" align="center">
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
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  box: {
    width: 44,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.field,
  },
  boxCaret: {
    borderColor: theme.colors.brand.primary,
    boxShadow: '0px 0px 0px 3px rgba(56, 19, 132, 0.12)',
  },
  boxError: {
    borderColor: theme.colors.feedback.error,
  },
  // Off-screen rather than hidden: a display:none input cannot take focus, and
  // focus is what brings up the keyboard when the boxes are tapped.
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
}))
