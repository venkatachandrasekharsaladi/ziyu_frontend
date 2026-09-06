import { Feather } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { Pressable } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type FeatherName = ComponentProps<typeof Feather>['name']

/**
 * Diameter, and the glyph that suits it. One place, so a control cannot be
 * built at 40 (under the 44 a finger reliably hits) by accident again.
 */
const SIZE = {
  sm: { box: 36, glyph: 18 },
  md: { box: 44, glyph: 20 },
  lg: { box: 56, glyph: 24 },
} as const

type Props = {
  icon: FeatherName
  /** What the control announces, and what a test finds it by. */
  label: string
  /**
   * Omit to render the control `disabled` — the "honestly unavailable" rule
   * this app follows everywhere (`SocialButton` for OAuth, `BottomNav` for an
   * unbuilt tab): a control with nowhere to go says so, rather than looking
   * pressable and quietly doing nothing.
   */
  onPress?: () => void
  size?: keyof typeof SIZE
  /**
   * `plain` for chrome on a page (a header's back arrow); `quiet` for a
   * secondary action on a bar; `accent` for the one action a surface is for;
   * `danger` for the destructive one; `onMedia` for a control laid over a
   * photo or video, where any solid surface token would read as a stray chip.
   */
  tone?: 'plain' | 'quiet' | 'accent' | 'danger' | 'onMedia'
  /** Extends the touch target past the drawn circle, without spending width. */
  hitSlop?: number
  testID?: string
}

/**
 * A round, centred, icon-only control.
 *
 * Built once because it was written eleven times: the composer's attach and
 * send, the recorder's cancel and send, the photo preview's two, the call
 * controls' mute and end, the reaction bar's "more", the voice player's play,
 * the chat header's five — each re-declaring the same five style properties at
 * its own diameter, in seven different sizes, with its own idea of which fill
 * means "primary". Changing how a control answers a press, or what a disabled
 * one looks like, meant finding all eleven.
 */
export function IconButton({
  icon,
  label,
  onPress,
  size = 'md',
  tone = 'quiet',
  hitSlop,
  testID,
}: Props) {
  const { theme } = useUnistyles()
  const disabled = !onPress

  styles.useVariants({ size, tone, disabled })

  const ink = disabled
    ? theme.colors.border.field
    : tone === 'accent'
      ? theme.colors.chat.onAccent
      : tone === 'danger' || tone === 'onMedia'
        ? theme.colors.text.onPrimary
        : tone === 'plain'
          ? theme.colors.text.heading
          : theme.colors.text.body

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={hitSlop}
      testID={testID}
      style={styles.button}
    >
      <Feather name={icon} size={SIZE[size].glyph} color={ink} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    variants: {
      size: {
        sm: { width: SIZE.sm.box, height: SIZE.sm.box },
        md: { width: SIZE.md.box, height: SIZE.md.box },
        lg: { width: SIZE.lg.box, height: SIZE.lg.box },
      },
      tone: {
        plain: { backgroundColor: 'transparent' },
        quiet: { backgroundColor: theme.colors.surface.field },
        accent: { backgroundColor: theme.colors.chat.accent },
        danger: { backgroundColor: theme.colors.feedback.error },
        onMedia: { backgroundColor: theme.colors.surface.scrim },
      },
      // The same 0.6 dimming `BottomNav` uses for a tab whose destination is
      // not built yet, so an unavailable control looks the same everywhere.
      disabled: { true: { opacity: 0.6 }, false: {} },
    },
  },
}))
