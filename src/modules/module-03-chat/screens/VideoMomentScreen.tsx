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
 * Video Moment — the in-call screen a video call lands on. Figma `Ziyu`
 * 3391:842.
 *
 * Same scope line as `VoiceMomentScreen`: there is no WebRTC or camera
 * dependency in this project and adding one is out of scope here. Both video
 * feeds are stand-ins — the partner's is a full-bleed fill with their avatar
 * centred on it (there is no decoded frame to paint), and the self-view
 * inset is the same idea in miniature rather than a real front-camera
 * preview. Mute/camera/end are real UI state and the elapsed timer is a real
 * `setInterval`, cleared on unmount; nothing here is actually carrying video.
 */
export function VideoMomentScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)

  // Cleared on unmount — see `VoiceMomentScreen`'s identical comment; the
  // reasoning (and the Task 9 review finding it comes from) is the same.
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs((previous) => previous + TICK_MS)
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <View style={styles.page}>
      <ThemedStatusBar />

      {/* The "partner feed" — full-bleed, with their avatar standing in for
          the frame a real camera would decode. */}
      <View style={styles.partnerFeed}>
        <Avatar name="Sarah" size={128} />
      </View>

      <View style={[styles.timer, { top: insets.top + 16 }]}>
        <Text variant="body" tone="onPrimary" align="center">
          {clock(elapsedMs)}
        </Text>
      </View>

      {/* The self-view inset. Shown regardless of `cameraOn`: turning your
          own camera off is something the OTHER party sees reflected (their
          copy of this same screen would blank their partner-feed instead),
          not something that blanks your own preview of yourself. */}
      <View style={[styles.selfView, { top: insets.top + 16 }]}>
        <Avatar name="You" size={48} />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <CallControls
          muted={muted}
          onToggleMute={() => setMuted((was) => !was)}
          cameraOn={cameraOn}
          onToggleCamera={() => setCameraOn((was) => !was)}
          onEnd={router.back}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    // Not `surface.page`: this is meant to read as a video feed, not a form
    // screen, and it stays the same dark-ish fill in both themes rather than
    // flipping to `surface.page`'s light lavender in the light theme, which
    // would read as an empty screen rather than a paused camera.
    backgroundColor: theme.colors.surface.scrim,
  },
  partnerFeed: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  selfView: {
    position: 'absolute',
    right: 16,
    width: 96,
    height: 128,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.soft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
}))
