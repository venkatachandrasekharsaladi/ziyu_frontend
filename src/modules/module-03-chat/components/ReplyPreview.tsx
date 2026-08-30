import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

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
 */
export function ReplyPreview({ body, onCancel }: Props) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
      <View style={styles.body}>
        <Text numberOfLines={1}>{body}</Text>
      </View>
      <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel reply">
        <Feather name="x" size={18} color={theme.colors.text.placeholder} />
      </Pressable>
    </View>
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
