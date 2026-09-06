import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CHAT_COPY } from '@/copy/chat'
import { IconButton } from '@/design-system/patterns/IconButton'
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
 * "Sweatcha" is hardcoded, matching `Composer`'s own "Message Sweatcha…"
 * placeholder — this app has exactly one partner and no store yet exposes
 * their identity. That would move onto a partner profile the moment one
 * exists. The presence line underneath it is no longer a second hardcode:
 * it swaps between `CHAT_COPY.conversation.presenceOnline` and
 * `.presenceTyping` on `isPartnerTyping`, the one piece of live presence
 * this store already tracks (see the prop's own comment above).
 *
 * Five controls and a name have to survive a 320pt phone. They do it by
 * measure, not by hiding: the icons are narrower than a finger and buy the
 * difference back with `hitSlop`, and the name is the one flexible column, so
 * it truncates instead of shoving a call button off the edge.
 */
export function ChatHeader({ onBack, onVideoCall, onVoiceCall, onMore, isPartnerTyping = false }: Props) {
  return (
    <View style={styles.bar}>
      <IconButton icon="arrow-left" label="Back" onPress={onBack} size="sm" tone="plain" hitSlop={HIT} />

      {/* The ring is what makes the avatar read as a person rather than a
          coloured tile — it separates the initial from the bar behind it at
          any theme, without needing a photo to be there yet. */}
      <View style={styles.avatarRing}>
        <Avatar name="Sweatcha" size={36} />
      </View>

      <View style={styles.identity}>
        <Text variant="labelStrong" tone="heading" numberOfLines={1}>
          Sweatcha
        </Text>
        <View style={styles.presence}>
          <View style={styles.presenceDot} />
          <Text variant="footnote" tone="placeholder" numberOfLines={1}>
            {isPartnerTyping ? CHAT_COPY.conversation.presenceTyping : CHAT_COPY.conversation.presenceOnline}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton
          icon="video"
          label="Start video call"
          onPress={onVideoCall}
          size="sm"
          tone="plain"
          hitSlop={HIT}
        />

        <IconButton
          icon="phone"
          label="Start voice call"
          onPress={onVoiceCall}
          size="sm"
          tone="plain"
          hitSlop={HIT}
        />

        {/* Reserved for a message-search / mute-thread / block menu — no design
            for its contents exists yet. Omitting `onMore` renders it disabled
            rather than guessing at one; `IconButton` owns that rule now, so
            every unavailable control in the app dims identically. */}
        <IconButton
          icon="more-vertical"
          label="More options"
          onPress={onMore}
          size="sm"
          tone="plain"
          hitSlop={HIT}
        />
      </View>
    </View>
  )
}

/**
 * Buys each 36pt control back up to a 52pt touch target without spending the
 * width on screen — the trade that lets five controls and a name share a
 * small phone's top bar.
 */
const HIT = 8

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
  avatarRing: {
    padding: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.hairline,
    backgroundColor: theme.colors.surface.card,
  },
  // The only flexed slot — it is what pushes the trailing controls to the far
  // edge regardless of how wide "Sweatcha" / the presence line render, and
  // what makes a longer name truncate rather than crowd them.
  identity: { flex: 1 },
  presence: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  presenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.chat.accent,
  },
  // Tighter than the bar's own gap: these three read as one cluster of
  // actions, and the saved width goes to the name.
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
}))
