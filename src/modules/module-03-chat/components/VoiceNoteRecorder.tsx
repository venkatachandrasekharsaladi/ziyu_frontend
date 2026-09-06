import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
import { CHAT_COPY } from '@/copy/chat'
import { Text } from '@/design-system/primitives/Text'
import { clock } from '@/modules/module-03-chat/components/VoiceNotePlayer'

type Props = {
  onCancel: () => void
  onSend: (durationMs: number) => void
}

/** How often the elapsed-time readout ticks. One second, same as the clock it drives. */
const TICK_MS = 1000

/**
 * The bar that replaces the composer while `ConversationScreen`'s
 * `s.isRecording` is true. Figma `Ziyu` 3390:164.
 *
 * There is no audio dependency in this project (checked — nothing matching
 * "audio" or "expo-av" in package.json) and adding one is out of scope for
 * this task. Nothing here actually captures sound: the elapsed timer below
 * is real (it is what the send action reports), but the "recording" it is
 * timing is a stand-in. `onSend` hands back a placeholder uri alongside the
 * real elapsed duration — see `ConversationScreen`, which is the only caller
 * and is what turns that into a `sendVoice(uri, durationMs)` call.
 */
export function VoiceNoteRecorder({ onCancel, onSend }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const reduced = useReducedMotion()
  const pulse = useSharedValue(1)

  // The live elapsed-time counter. Cleared on unmount — this effect's own
  // cleanup — rather than only on cancel/send, because either of those
  // callbacks belongs to the caller and this component cannot assume it is
  // still mounted by the time one of them runs (`ConversationScreen` swaps
  // this out for the composer the instant recording stops). A leaked
  // interval here would keep ticking a state setter on an unmounted
  // component and make later tests in this file flaky.
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs((previous) => previous + TICK_MS)
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [])

  // The pulsing dot. A plain opacity loop, same animation library
  // `PressableScale` already uses elsewhere — no new dependency. Honours
  // reduced motion by simply not looping, same call `PressableScale` makes.
  useEffect(() => {
    if (reduced) return
    pulse.value = withRepeat(withTiming(0.3, { duration: 600 }), -1, true)
  }, [reduced, pulse])

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.dot, dotStyle]} />

      {/* Figma `3390:164` node `3390:189` — the caption the pulsing dot alone
          never spelled out. `error` tone pairs it with the dot's own
          `feedback.error` fill rather than a plain body colour, so the two
          read as one "this is recording" signal instead of an unrelated
          label sitting next to a red dot. */}
      <Text variant="labelStrong" tone="error">
        {CHAT_COPY.conversation.recording}
      </Text>

      <Text variant="body" tone="body">
        {clock(elapsedMs)}
      </Text>

      <View style={styles.spacer} />

      <IconButton icon="x" label="Cancel recording" onPress={onCancel} />

      <IconButton icon="check" label="Send voice note" onPress={() => onSend(elapsedMs)} tone="accent" />
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
    boxShadow: theme.elevation.card,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.feedback.error,
  },
  spacer: { flex: 1 },
}))
