import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CHAT_COPY as COPY } from '@/copy/chat'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import { truncateWords } from '@/modules/module-03-chat/truncate'
import type { Message } from '@/services/chat/types'

type Props = {
  /** The first pinned message in the thread — see `ConversationScreen`,
   * which is what picks that one out of `messages` before this ever sees it. */
  message: Message
  onPress: () => void
}

/** How much of the pinned body the thin strip shows before truncating. */
const PREVIEW_MAX = 40

/**
 * The pinned-message strip. Figma `Ziyu` 3390:60 draws it as a thin band
 * sitting above the thread whenever at least one message is pinned. It
 * shows only the ONE pinned message handed to it — never every pin in the
 * conversation at once, that full list is what `PinnedAndSearchScreen`
 * (which this opens) is for.
 *
 * A component, not a screen: it takes `onPress` rather than importing
 * `expo-router` itself, same as `ChatHeader`'s own `onVideoCall`/`onVoiceCall`
 * — navigation is the caller's decision, not this component's.
 */
export function PinnedBanner({ message, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel="Pinned message">
      <View style={styles.wrap}>
        <Text variant="caption" tone="muted">
          {COPY.search.pinnedLabel}
        </Text>
        {/* `numberOfLines` backstops `truncateWords` the same way
            `ChatHomeScreen`'s own preview does — belt and braces against a
            body that somehow survives truncation still too long to fit one
            line. */}
        <Text variant="footnote" tone="body" numberOfLines={1}>
          {truncateWords(message.body ?? '', PREVIEW_MAX)}
        </Text>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.chat.accentSoft,
    marginBottom: theme.spacing.md,
  },
}))
