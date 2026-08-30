import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'
import { CallControls } from '@/modules/module-03-chat/components/CallControls'
import { clock } from '@/modules/module-03-chat/components/VoiceNotePlayer'

/** How often the elapsed-call readout ticks. */
const TICK_MS = 1000

/**
 * Voice Moment — the in-call screen a voice call lands on. Figma `Ziyu`
 * 3391:884.
 *
 * There is no WebRTC or audio-capture dependency in this project (checked —
 * nothing matching "webrtc" or "call" in package.json) and adding one is out
 * of scope for this task, per the brief. This is a visual shell: the partner
 * "answers" the instant the screen mounts, mute/end are real UI state, and
 * the elapsed timer is a real `setInterval`, cleared on unmount — nothing
 * here is actually carrying audio. `ConversationScreen`'s call controls are
 * this screen's only entry point (see `ChatHeader`'s own header comment);
 * this screen's only exit is `onEnd`, which is always `router.back()`.
 */
export function VoiceMomentScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [muted, setMuted] = useState(false)

  // Cleared on unmount, same lesson `VoiceNoteRecorder` already learned the
  // hard way (Task 9's review finding): `router.back()` unmounts this screen
  // from underneath the interval, and a leaked timer would keep ticking a
  // state setter on an unmounted component.
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs((previous) => previous + TICK_MS)
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ThemedStatusBar />

      <View style={styles.spacer} />

      <View style={styles.identity}>
        {/* Sized up from the header's own default — this is the whole
            screen's focal point, not a row accessory. */}
        <Avatar name="Sarah" size={128} />
        <Text variant="h2" tone="heading">
          Sarah
        </Text>
        <Text variant="body" tone="placeholder">
          {clock(elapsedMs)}
        </Text>
      </View>

      <View style={styles.controls}>
        <CallControls
          muted={muted}
          onToggleMute={() => setMuted((was) => !was)}
          onEnd={router.back}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
    alignItems: 'center',
  },
  spacer: { flex: 1 },
  identity: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  controls: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.xxl,
  },
}))
