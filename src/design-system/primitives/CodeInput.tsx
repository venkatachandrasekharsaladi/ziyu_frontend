import { useCallback, useRef, useState } from 'react'
import { Pressable, TextInput, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import { breakpoints } from '@/design-system/themes/breakpoints'

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
  // The six-box row used to be a FIXED 44pt per box — 6 × 44 + 5 gaps came to
  // 304pt, which does not fit inside a 320pt phone once the screen's own
  // horizontal padding is subtracted (280pt left). `useWindowDimensions`, not
  // `theme.layout`: this is the phone-vs-tablet call `breakpoints.md` exists
  // for, and it is read directly rather than through Unistyles' own
  // breakpoint variants because those resolve on the native side and do not
  // exist as a value JS can branch on here.
  const { width: windowWidth } = useWindowDimensions()
  const isWide = windowWidth >= breakpoints.md

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
              style={[
                styles.box,
                isWide && styles.boxWide,
                error ? styles.boxError : isCaret ? styles.boxCaret : null,
              ]}
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
    width: '100%',
    gap: theme.spacing.sm,
    // Centres the boxes once `maxWidth` on `box` caps their growth and the row
    // has room left over — see `box` below. Harmless when the boxes are
    // shrinking to fit instead: there is no leftover space to centre then.
    justifyContent: 'center',
  },
  box: {
    // `flex: 1` + `maxWidth`, not a fixed `width`: six boxes at a fixed 44pt
    // plus their gaps come to 304pt, which overflows a 320pt phone once the
    // screen's own side padding is subtracted. `flex` lets every box shrink
    // together to whatever the row actually has, and `maxWidth` is what stops
    // them ballooning on a wide phone or tablet instead.
    flex: 1,
    maxWidth: 44,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.field,
  },
  // Tablet and up (`breakpoints.md`): six boxes at the phone's 44pt cap would
  // sit lost in the middle of a much wider screen, so the cap itself grows.
  boxWide: {
    maxWidth: 56,
  },
  boxCaret: {
    borderColor: theme.colors.brand.primary,
    // Built from a token, not written out: a ring keyed to the light brand is
    // a purple halo on a dark field.
    boxShadow: `0px 0px 0px 3px ${theme.colors.focusRing}`,
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
