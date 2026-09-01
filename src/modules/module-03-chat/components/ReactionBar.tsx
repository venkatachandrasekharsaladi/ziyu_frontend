import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * The six quick reactions the long-press bar draws, left to right.
 * Matches the Figma frame (Ziyu, Reaction Picker `3390:439`) exactly:
 * ❤️ 😂 🥹 😍 👍 ✨
 *
 * Do not add 🖤 (black heart) back in: it reads as grief/goth/edgy irony,
 * not affection, and sitting next to a red heart makes it look like a
 * mistake. Do not swap 🥹 (face holding back tears — warm, moved-to-happy-
 * tears) for 🥺 (pleading face — begging/wheedling); they look similar but
 * mean very different things for a couple's app.
 */
const EMOJI = ['❤️', '😂', '🥹', '😍', '👍', '✨']

type Props = {
  onReact: (emoji: string) => void
  /**
   * Opens the full emoji picker / "more reactions" surface. There is no
   * design for what that surface actually is yet, so the caller omits this
   * entirely rather than guess at one — omitted (not merely a no-op) renders
   * the control `disabled` below, the same "honestly unavailable" rule
   * `SocialButton` follows for OAuth and `BottomNav` follows for an unbuilt
   * tab, instead of a control that looks pressable and does nothing.
   */
  onMore?: () => void
}

/**
 * The long-press reaction bar. `ConversationScreen` renders it above
 * `MessageContextMenu` in the overlay it shows when `selectedMessageId` is set.
 */
export function ReactionBar({ onReact, onMore }: Props) {
  const { theme } = useUnistyles()
  const moreDisabled = !onMore

  styles.useVariants({ disabled: moreDisabled })

  return (
    <View style={styles.bar}>
      {EMOJI.map((emoji) => (
        <Pressable
          key={emoji}
          onPress={() => onReact(emoji)}
          accessibilityRole="button"
          accessibilityLabel={`React ${emoji}`}
          style={styles.emojiTouch}
        >
          {/* `Text` has no `style` prop by design (see `Text.tsx`), so the
              larger glyph size the frame draws has to come from a variant
              rather than an inline font size. `h3` is the one variant sized
              close to it (22pt); its semibold weight and slight negative
              tracking are inaudible on a single emoji glyph. */}
          <Text variant="h3">{emoji}</Text>
        </Pressable>
      ))}

      <View style={styles.divider} />

      <Pressable
        onPress={onMore}
        disabled={moreDisabled}
        accessibilityRole="button"
        accessibilityLabel="More reactions"
        accessibilityState={{ disabled: moreDisabled }}
        style={styles.more}
      >
        <Feather
          name="plus"
          size={16}
          color={moreDisabled ? theme.colors.border.field : theme.colors.text.body}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    boxShadow: theme.elevation.card,
  },
  // Layout and touch-target sizing live on this wrapping `Pressable`, not on
  // the `Text` inside it — the same split `Text.tsx` enforces everywhere else.
  emojiTouch: { alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: 22, backgroundColor: theme.colors.border.subtle },
  more: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.field,
    variants: {
      // Same 0.6 dimming `BottomNav` uses for a tab whose destination is not
      // built yet.
      disabled: {
        true: { opacity: 0.6 },
        false: {},
      },
    },
  },
}))
