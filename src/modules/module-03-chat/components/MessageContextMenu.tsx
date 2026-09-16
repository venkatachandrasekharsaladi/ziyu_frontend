import { Feather } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useEntrance } from '@/design-system/patterns/useEntrance'
import { Text } from '@/design-system/primitives/Text'

type Props = {
  onReply: () => void
  /**
   * Real "Copy" needs `expo-clipboard`, not installed in this project. Left
   * unset by the caller rather than aliased to some other action — omitted
   * (not merely a no-op) renders the row `disabled` below, so it honestly
   * reads as unavailable instead of looking pressable and quietly doing
   * something else (or nothing).
   */
  onCopy?: () => void
  onSaveMemory: () => void
}

/**
 * The message context menu — Reply / Copy / Save Memory.
 *
 * A dumb list: it only renders the three rows and calls whatever it was
 * handed. What each action actually DOES (dismiss, start a reply, write a
 * memory) is `ConversationScreen`'s decision, made where the store lives —
 * see the WHY-comments there, especially the one on `onCopy`.
 */
export function MessageContextMenu({ onReply, onCopy, onSaveMemory }: Props) {
  const { theme } = useUnistyles()

  const items = [
    { label: 'Reply', icon: 'corner-up-left', onPress: onReply, disabled: false },
    { label: 'Copy', icon: 'copy', onPress: onCopy, disabled: !onCopy },
    { label: 'Save Memory', icon: 'bookmark', onPress: onSaveMemory, disabled: false },
  ] as const

  // Rises the short distance into place rather than appearing. A menu that
  // pops in has no relationship to the bubble that summoned it; a menu that
  // settles does.
  const entrance = useEntrance()

  return (
    <Animated.View entering={entrance.rise} exiting={entrance.fadeOut} style={styles.card}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          disabled={item.disabled}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ disabled: item.disabled }}
        >
          <Feather
            name={item.icon}
            size={18}
            color={item.disabled ? theme.colors.border.field : theme.colors.text.body}
          />
          {/* `heading` tone, not `body` — the menu is a card floating over the
              scrim, not chat/page copy, and `heading` is the ink this app
              reaches for on any surface-card row label (see `ChatHeader`'s
              "Sweatcha"). `muted` when disabled, same as `BottomNav`'s own
              not-yet-built tabs. */}
          <Text tone={item.disabled ? 'muted' : 'heading'}>{item.label}</Text>
        </Pressable>
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.tile,
    paddingVertical: theme.spacing.sm,
    boxShadow: theme.elevation.card,
    // Same floor-and-ceiling rule as `VoiceNotePlayer`'s row: 190pt keeps the
    // three action labels on one line each, `maxWidth` keeps the menu inside
    // the screen when the floor is a large fraction of a 320pt device.
    minWidth: 190,
    maxWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
}))
