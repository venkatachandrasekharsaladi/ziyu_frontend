import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import { ReadReceipt } from '@/modules/module-03-chat/components/ReadReceipt'
import type { Message } from '@/services/chat/types'

type Props = {
  message: Message
  onLongPress?: (id: string) => void
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * One message. Figma `Ziyu` 3390:665.
 *
 * The frame draws a darker vertical strip on the leading edge of incoming
 * bubbles. It is a misaligned overlay, not a design element, and is not
 * reproduced — see the spec, §9.
 */
export function MessageBubble({ message, onLongPress }: Props) {
  const mine = message.authorId === 'me'

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <Pressable
        onLongPress={() => onLongPress?.(message.id)}
        accessibilityRole="button"
        accessibilityLabel={message.body ?? 'Message'}
        style={[styles.bubble, mine ? styles.mine : styles.theirs]}
      >
        {/* `onChat` — the one ink value contrast-checked against both bubble
            fills (`Text.tsx`'s tone map). `Text` has no `style` prop by
            design, so a bespoke bubble colour has to be a tone, not an
            inline override. */}
        {message.body ? <Text tone="onChat">{message.body}</Text> : null}
      </Pressable>

      {message.reactions.length > 0 && (
        <View style={styles.reactions}>
          {message.reactions.map((r) => (
            <Text key={`${r.emoji}-${r.authorId}`} variant="footnote">
              {r.emoji}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.meta}>
        <Text variant="caption" tone="placeholder">
          {clockTime(message.sentAt)}
        </Text>
        {mine && <ReadReceipt status={message.status} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: { marginBottom: theme.spacing.lg, maxWidth: '82%' },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.panel,
  },
  mine: { backgroundColor: theme.colors.chat.bubbleOutgoing },
  theirs: { backgroundColor: theme.colors.chat.bubbleIncoming },
  reactions: { flexDirection: 'row', marginTop: -theme.spacing.sm },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
}))
