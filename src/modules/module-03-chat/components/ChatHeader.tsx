import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'

type Props = {
  onBack: () => void
  onVideoCall: () => void
  onVoiceCall: () => void
  /** Reserved — see the control below. Optional so a caller can omit it. */
  onMore?: () => void
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
 * "Sarah" / "Online" are hardcoded, matching `Composer`'s own
 * "Message Sarah…" placeholder — this app has exactly one partner and no
 * store yet exposes their live presence. Both would move onto a partner
 * profile the moment one exists.
 */
export function ChatHeader({ onBack, onVideoCall, onVoiceCall, onMore }: Props) {
  const { theme } = useUnistyles()

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
          Online
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
          for its contents exists yet, so this stays a labelled no-op rather
          than guessing at one. */}
      <Pressable
        onPress={onMore}
        accessibilityRole="button"
        accessibilityLabel="More options"
        style={styles.control}
      >
        <Feather name="more-vertical" size={20} color={theme.colors.text.heading} />
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
  // the far edge regardless of how wide "Sarah" / "Online" render.
  identity: { flex: 1 },
}))
