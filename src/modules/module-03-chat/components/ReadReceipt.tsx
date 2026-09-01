import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { MessageStatus } from '@/services/chat/types'

// `Record<MessageStatus, string>` rather than `Partial` — adding a status to
// the union without a label here is a compile error, not a silent blank. That
// is what caught `'failed'` when Task 3 added retry: a failed send is NOT
// "sent but unconfirmed", it needs its own word and its own colour below.
const LABEL: Record<MessageStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed to send',
}

type Props = {
  status: MessageStatus
  /**
   * A formatted clock reading (`MessageBubble`'s own `clockTime(sentAt)`),
   * folded into the accessible name so two outgoing messages sitting at the
   * same status — which happens the moment a second `me` message reaches
   * `read`, the most common status in the thread — don't share one. Optional
   * only so a bare unit render (no message context to draw a time from)
   * still gets a sensible label instead of a required prop with nothing to
   * pass it.
   */
  time?: string
}

export function ReadReceipt({ status, time }: Props) {
  const { theme } = useUnistyles()

  // `failed` gets the error colour so a broken send doesn't blend in with a
  // merely-unread one — the whole reason this component takes the full
  // `MessageStatus` union instead of a narrower "delivery" type.
  const tint =
    status === 'read'
      ? theme.colors.chat.accent
      : status === 'failed'
        ? theme.colors.feedback.error
        : theme.colors.text.placeholder

  const label = time ? `${LABEL[status]}, sent at ${time}` : LABEL[status]

  return (
    <View style={styles.row} accessibilityLabel={label}>
      <Feather
        name={status === 'sending' ? 'clock' : status === 'failed' ? 'alert-circle' : 'check'}
        size={12}
        color={tint}
      />
      {(status === 'delivered' || status === 'read') && (
        <Feather name="check" size={12} color={tint} style={styles.second} />
      )}
    </View>
  )
}

const styles = StyleSheet.create(() => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  second: { marginLeft: -6 },
}))
