import { Feather } from '@expo/vector-icons'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ReplyPreview } from '@/modules/module-03-chat/components/ReplyPreview'

type Props = {
  value: string
  onChangeText: (v: string) => void
  onSend: (v: string) => void
  onAttach: () => void
  onRecord: () => void
  /** The quoted message body, when a reply is in progress. */
  replyTo?: string
  /** Required alongside `replyTo` — there is no way to dismiss a reply without it. */
  onCancelReply?: () => void
}

/**
 * The bottom bar: attach, a growing text field, and a trailing action that is
 * either "record" or "send" depending on whether there is anything to send.
 *
 * That trailing action is one conditional render, not a shared button whose
 * icon/label swap — `queryByLabelText('Record voice note')` has to come back
 * `null` the moment there is text (Task 14 relies on the mic being genuinely
 * absent, not merely hidden, so it can't be focused or tapped by accident).
 * `value.trim()` — not a raw length check — so a composer full of only
 * whitespace still offers "record" instead of a no-op send.
 */
export function Composer({
  value,
  onChangeText,
  onSend,
  onAttach,
  onRecord,
  replyTo,
  onCancelReply,
}: Props) {
  const { theme } = useUnistyles()
  const hasText = value.trim().length > 0

  return (
    <View>
      {replyTo && onCancelReply && <ReplyPreview body={replyTo} onCancel={onCancelReply} />}

      <View style={styles.bar}>
        <Pressable
          onPress={onAttach}
          accessibilityRole="button"
          accessibilityLabel="Add attachment"
          style={styles.round}
        >
          <Feather name="plus" size={20} color={theme.colors.text.body} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Message Sarah…"
          placeholderTextColor={theme.colors.text.placeholder}
          accessibilityLabel="Message"
          multiline
          style={styles.input}
        />

        {hasText ? (
          <Pressable
            onPress={() => onSend(value)}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={styles.send}
          >
            <Feather name="arrow-up" size={20} color={theme.colors.chat.onAccent} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onRecord}
            accessibilityRole="button"
            accessibilityLabel="Record voice note"
            style={styles.send}
          >
            <Feather name="mic" size={20} color={theme.colors.chat.onAccent} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.field,
  },
  input: {
    flex: 1,
    // Grows with content up to a cap, then scrolls — `minHeight` matches the
    // round buttons either side so a one-line message doesn't look cramped
    // against them; `maxHeight` is the cap `multiline` needs to start scrolling
    // instead of pushing the bar taller forever.
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
    ...theme.typography.body,
    color: theme.colors.text.body,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chat.accent,
  },
}))
