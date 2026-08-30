import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type Props = {
  onReply: () => void
  onCopy: () => void
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
    { label: 'Reply', icon: 'corner-up-left', onPress: onReply },
    { label: 'Copy', icon: 'copy', onPress: onCopy },
    { label: 'Save Memory', icon: 'bookmark', onPress: onSaveMemory },
  ] as const

  return (
    <View style={styles.card}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Feather name={item.icon} size={18} color={theme.colors.text.body} />
          {/* `heading` tone, not `body` — the menu is a card floating over the
              scrim, not chat/page copy, and `heading` is the ink this app
              reaches for on any surface-card row label (see `ChatHeader`'s
              "Sarah"). */}
          <Text tone="heading">{item.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.tile,
    paddingVertical: theme.spacing.sm,
    boxShadow: theme.elevation.card,
    minWidth: 190,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
}))
