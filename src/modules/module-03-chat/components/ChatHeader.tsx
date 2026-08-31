import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CHAT_COPY } from '@/copy/chat'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'

type Props = {
  onBack: () => void
  onVideoCall: () => void
  onVoiceCall: () => void
  /**
   * Reserved — see the control below. Optional so a caller can omit it;
   * omitting it (rather than a no-op) renders the control `disabled`, the
   * same "honestly unavailable" rule `SocialButton` follows for OAuth.
   */
  onMore?: () => void
  /**
   * Swaps the presence line to "Typing…" — Figma `3390:521`. A prop, not a
   * store read: components never import a service, and `useChatStore`
   * already lives one layer up in `ConversationScreen`, which is where
   * `isPartnerTyping` actually comes from.
   */
  isPartnerTyping?: boolean
}

/**
 * The conversation's top bar. Figma `Ziyu` 3390:665.
 *
 * Nothing in the 16-task plan builds this but Task 6 — see the ledger's
 * pre-Task-6 ruling. Without it the frame is not reproduced, there is no way
 * back out of the conversation, and Task 12's voice/video Moment screens are
 * unreachable dead routes. The two call controls ARE the entry points to
 * those screens: pressing either is this app's only route into a Moment.
 *
 * "Sarah" is hardcoded, matching `Composer`'s own "Message Sarah…"
 * placeholder — this app has exactly one partner and no store yet exposes
 * their identity. That would move onto a partner profile the moment one
 * exists. The presence line underneath it is no longer a second hardcode:
 * it swaps between `CHAT_COPY.conversation.presenceOnline` and
 * `.presenceTyping` on `isPartnerTyping`, the one piece of live presence
 * this store already tracks (see the prop's own comment above).
 */
export function ChatHeader({ onBack, onVideoCall, onVoiceCall, onMore, isPartnerTyping = false }: Props) {
  const { theme } = useUnistyles()
  const moreDisabled = !onMore

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.control}
      >
        <Feather name="arrow-left" size={20} color={theme.colors.text.heading} />
      </Pressable>

      <Avatar name="Sarah" />

      <View style={styles.identity}>
        <Text variant="labelStrong" tone="heading">
          Sarah
        </Text>
        <Text variant="footnote" tone="placeholder">
          {isPartnerTyping ? CHAT_COPY.conversation.presenceTyping : CHAT_COPY.conversation.presenceOnline}
        </Text>
      </View>

      <Pressable
        onPress={onVideoCall}
        accessibilityRole="button"
        accessibilityLabel="Start video call"
        style={styles.control}
      >
        <Feather name="video" size={20} color={theme.colors.text.heading} />
      </Pressable>

      <Pressable
        onPress={onVoiceCall}
        accessibilityRole="button"
        accessibilityLabel="Start voice call"
        style={styles.control}
      >
        <Feather name="phone" size={20} color={theme.colors.text.heading} />
      </Pressable>

      {/* Reserved for a message-search / mute-thread / block menu — no design
          for its contents exists yet, so this renders `disabled` rather than
          guessing at one, same rule `SocialButton` follows for OAuth. */}
      <Pressable
        onPress={onMore}
        disabled={moreDisabled}
        accessibilityRole="button"
        accessibilityLabel="More options"
        accessibilityState={{ disabled: moreDisabled }}
        style={styles.control}
      >
        <Feather
          name="more-vertical"
          size={20}
          color={moreDisabled ? theme.colors.border.field : theme.colors.text.heading}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  control: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The only flexed slot — it is what pushes the three trailing controls to
  // the far edge regardless of how wide "Sarah" / the presence line render.
  identity: { flex: 1 },
}))
