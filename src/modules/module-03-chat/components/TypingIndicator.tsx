import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

/**
 * The three-dot "partner is typing" bubble. Task 6 mounts and unmounts this
 * in place of the conversation's last row rather than animating the dots
 * themselves — no `Text` involved, so it needs none of the primitive's
 * tone/variant machinery, just the incoming bubble's own fill and ink.
 */
export function TypingIndicator() {
  return (
    <View style={styles.bubble} accessibilityLabel="Partner is typing">
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.chat.bubbleIncoming,
    borderRadius: theme.radii.panel,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.chat.bubbleInk },
}))
