import { TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
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
 *
 * Only the send action takes the accent fill. When the bar shouted in accent
 * whatever state it was in, the colour said nothing; now it means "there is
 * something here to send", which is the one thing worth colouring.
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
  const insets = useSafeAreaInsets()
  const hasText = value.trim().length > 0

  return (
    // The bar reads the bottom inset itself rather than being padded by the
    // screen: it is the thing sitting against the home indicator, and every
    // surface that mounts it would otherwise have to remember to do this.
    // `Math.max` keeps a comfortable base gap on the phones that report none.
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
      {replyTo && onCancelReply && <ReplyPreview body={replyTo} onCancel={onCancelReply} />}

      <View style={styles.bar}>
        <IconButton icon="plus" label="Add attachment" onPress={onAttach} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Message Sweatcha…"
          placeholderTextColor={theme.colors.text.placeholder}
          accessibilityLabel="Message"
          multiline
          style={styles.input}
        />

        {hasText ? (
          <IconButton icon="arrow-up" label="Send message" onPress={() => onSend(value)} tone="accent" />
        ) : (
          <IconButton icon="mic" label="Record voice note" onPress={onRecord} />
        )}
      </View>
    </View>
  )
}

/**
 * The field matches `IconButton`'s own `md` diameter, so the bar reads as one
 * line however tall the field has grown.
 */
const CONTROL = 44

const styles = StyleSheet.create((theme) => ({
  dock: {
    // A shadow cast upward instead of a rule drawn across: the thread scrolls
    // under this bar, and a soft edge lets a message pass beneath it rather
    // than being sliced by a line.
    backgroundColor: theme.colors.surface.page,
    boxShadow: theme.elevation.composer,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  input: {
    flex: 1,
    // Grows with content up to a cap, then scrolls — `minHeight` matches the
    // round buttons either side so a one-line message doesn't look cramped
    // against them; `maxHeight` is the cap `multiline` needs to start scrolling
    // instead of pushing the bar taller forever.
    minHeight: CONTROL,
    maxHeight: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
    ...theme.typography.body,
    color: theme.colors.text.body,
  },
}))
