import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import { clockTime } from '@/modules/module-03-chat/clockTime'
import { PhotoMessage } from '@/modules/module-03-chat/components/PhotoMessage'
import { ReadReceipt } from '@/modules/module-03-chat/components/ReadReceipt'
import { VoiceNotePlayer } from '@/modules/module-03-chat/components/VoiceNotePlayer'
import type { Message } from '@/services/chat/types'

type Props = {
  message: Message
  onLongPress?: (id: string) => void
  /**
   * Retries a `failed` send. Optional, not because a failed bubble can skip
   * offering it, but because most callers (every OTHER status) never render
   * the control this guards at all — see the `message.status === 'failed'`
   * check below.
   */
  onRetry?: (id: string) => void
  /**
   * The body of the message THIS one replies to (`message.replyToId`),
   * looked up by the screen — components never import a service, and
   * `ConversationScreen` already holds `messages` to look it up in.
   * Additive alongside the bubble's own body/media, same pattern as a photo
   * caption or a voice transcript below: a reply still shows what it quotes
   * AND what it says, never one instead of the other.
   */
  quotedBody?: string
}

/**
 * One message. Figma `Ziyu` 3390:665.
 *
 * The frame draws a darker vertical strip on the leading edge of incoming
 * bubbles. It is a misaligned overlay, not a design element, and is not
 * reproduced — see the spec, §9.
 */
export function MessageBubble({ message, onLongPress, onRetry, quotedBody }: Props) {
  const mine = message.authorId === 'me'
  const time = clockTime(message.sentAt)

  // The whole-bubble accessible name. A message WITH a body already reads
  // fine as its own body text (and stays stable — two different bodies
  // never collide). A bodyless message (a captionless photo/voice note, the
  // normal path for either) used to fall back to the bare literal
  // 'Message' — which is also `Composer`'s own `TextInput` label, so the two
  // collided the moment both were mounted, which `ConversationScreen`
  // always does. Naming the KIND and the time instead fixes both problems
  // at once: it no longer equals the composer's label, and two bodyless
  // bubbles of the same kind no longer equal EACH OTHER either.
  const kindLabel = message.kind === 'photo' ? 'Photo' : message.kind === 'voice' ? 'Voice' : 'Message'
  const bubbleLabel = message.body ?? `${kindLabel} message, sent at ${time}`

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <Pressable
        onLongPress={() => onLongPress?.(message.id)}
        accessibilityRole="button"
        accessibilityLabel={bubbleLabel}
        style={[styles.bubble, mine ? styles.mine : styles.theirs]}
      >
        {/* The quoted message, when this one is a reply. Additive, same as
            the photo/voice branches below: a reply still renders its own
            body/media too, never the quote INSTEAD of it. */}
        {message.replyToId && quotedBody ? (
          <View style={styles.quote}>
            <View style={styles.quoteBar} />
            <Text variant="footnote" tone="onChat" numberOfLines={1}>
              {quotedBody}
            </Text>
          </View>
        ) : null}

        {/* A photo message renders `PhotoMessage` ADDITIVELY alongside its
            body, not instead of it — `PhotoSharePreview`'s caption (`body` on
            a `kind: 'photo'` message, same field `send()` uses for plain
            text) has to actually reach the screen, not just the store. The
            wrapping `View` carries the gap between image and caption:
            `Text` has no `style` prop by design, so that layout can't live
            on the `Text` itself. */}
        {message.kind === 'photo' && message.mediaUri ? (
          <View style={styles.media}>
            <PhotoMessage uri={message.mediaUri} time={time} />
            {message.body ? <Text tone="onChat">{message.body}</Text> : null}
          </View>
        ) : message.kind === 'voice' ? (
          // Additive, same as the photo branch above: `body` on a voice
          // message is a transcript (`services/chat/types.ts`'s `Message`),
          // not a caption that replaces the player — a voice note WITH a
          // transcript renders both, not one instead of the other.
          <View style={styles.media}>
            <VoiceNotePlayer durationMs={message.durationMs ?? 0} time={time} />
            {message.body ? <Text tone="onChat">{message.body}</Text> : null}
          </View>
        ) : message.body ? (
          // `onChat` — the one ink value contrast-checked against both bubble
          // fills (`Text.tsx`'s tone map). `Text` has no `style` prop by
          // design, so a bespoke bubble colour has to be a tone, not an
          // inline override.
          <Text tone="onChat">{message.body}</Text>
        ) : null}
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
          {time}
        </Text>
        {mine && <ReadReceipt status={message.status} time={time} />}
        {/* The offer, not just the mark: a `failed` send stays in the thread
            (chatStore never drops it), but until this control existed
            nothing let the user actually act on that — `retry()` was tested
            at the store level and called by nothing. Only rendered for the
            couple's own failed sends: a partner's message never has a send
            to retry. */}
        {mine && message.status === 'failed' && onRetry && (
          <Pressable
            onPress={() => onRetry(message.id)}
            accessibilityRole="button"
            accessibilityLabel="Retry sending"
            style={styles.retry}
          >
            <Text variant="caption" tone="error">Retry</Text>
          </Pressable>
        )}
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
  media: { gap: theme.spacing.sm },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  quoteBar: { width: 2, height: 16, borderRadius: 2, backgroundColor: theme.colors.chat.accent },
  reactions: { flexDirection: 'row', marginTop: -theme.spacing.sm },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  retry: { marginLeft: theme.spacing.xs },
}))
