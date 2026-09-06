import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { useEntrance } from '@/design-system/patterns/useEntrance'
import { IconButton } from '@/design-system/patterns/IconButton'
import { CHAT_COPY } from '@/copy/chat'
import { Text } from '@/design-system/primitives/Text'

type Props = {
  body: string
  onCancel: () => void
}

/**
 * The quoted-message strip that sits above the composer while replying.
 *
 * Its ground is `surface.field` — a normal surface, not a chat bubble — so the
 * quoted body takes `Text`'s default `body` tone rather than the `onChat` tone
 * `MessageBubble` uses. `onChat` is contrast-checked against `bubbleOutgoing` /
 * `bubbleIncoming` / `accentSoft` only (see `Text.tsx`); it has no guarantee
 * here and would be the wrong tone to reach for.
 *
 * Truncation (`numberOfLines`) passes straight through `Text`'s `...rest` —
 * `TextProps` omits only `style`, not RN's other passthrough props — but the
 * flex that lets the body actually shrink to one line has to live on a
 * wrapping `View`: `Text` has no `style` prop to carry `flex: 1` itself.
 *
 * The attribution line above the quote (Figma `3390:585`'s "Replying to
 * Sweatcha") is `CHAT_COPY.conversation.replyingToPartner` — a fixed string, not a
 * prop, because nothing calling this component knows who authored the
 * message it quotes either: `ConversationScreen` hands over only the quoted
 * `body` (see `Composer`'s `replyTo`), and this app's one thread has exactly
 * one partner to attribute a reply to regardless of whose bubble it was.
 */
export function ReplyPreview({ body, onCancel }: Props) {
  // This strip appears above the composer the instant a reply starts, and
  // pushes the composer down as it does. Rising into place makes that shove
  // read as one movement instead of a jump.
  const entrance = useEntrance()

  return (
    <Animated.View entering={entrance.rise} exiting={entrance.fadeOut} style={styles.wrap}>
      <View style={styles.bar} />
      <View style={styles.body}>
        <Text variant="footnote" tone="placeholder" numberOfLines={1}>
          {CHAT_COPY.conversation.replyingToPartner}
        </Text>
        <Text numberOfLines={1}>{body}</Text>
      </View>
      {/* Was a bare icon with no padding around it — a 18pt tap target. */}
      <IconButton icon="x" label="Cancel reply" onPress={onCancel} size="sm" tone="plain" />
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface.field,
  },
  bar: { width: 3, height: 28, borderRadius: 2, backgroundColor: theme.colors.chat.accent },
  // Only place doing layout for the quoted text — `Text` itself cannot.
  body: { flex: 1 },
}))
