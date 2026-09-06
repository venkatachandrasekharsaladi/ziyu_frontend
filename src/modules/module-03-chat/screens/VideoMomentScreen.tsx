import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { CHAT_COPY } from '@/copy/chat'
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
  // Ending a call returns to the conversation it was started from — by
  // popping the stack normally, or by going there directly when this screen
  // was itself opened from a link and has no stack behind it.
  const onEnd = useBackTo('/(app)/chat/conversation')
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
        <Avatar name="Sweatcha" size={128} />
      </View>

      {/*
        "Together for 05:20" — the frame labels this readout rather than
        drawing a bare clock (node 3391:868). The prefix is copy; the minutes
        are the live interval value.

        RAMP GAP, documented not papered over: the frame draws this at
        32pt/700 and the ramp has no 32 — `h2` is 34/700 and `h3` is 22. `h2`
        is the closest and the weight is right, so it is used here and the
        2pt difference is recorded, exactly like the Chat Home headline's
        44pt gap `DesignParity.test.tsx` already carries. Inventing a `display`
        token for one node would widen the type ramp on the strength of a
        single frame.
      */}
      <View style={[styles.timer, { top: insets.top + 16 }]}>
        <Text variant="h2" tone="onPrimary" align="center">
          {`${CHAT_COPY.moments.togetherForPrefix} ${clock(elapsedMs)}`}
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
        {/* The frame's caption (3391:842). Sits with the controls rather
            than free-floating: the fixture recorded this frame's TEXT but
            never any node's x/y, so the one honest claim available is that
            the line belongs to the bottom cluster — not a pixel offset
            invented from a zoomed-out screenshot. */}
        <Text variant="label" tone="onPrimary" align="center">
          {CHAT_COPY.moments.videoCaption}
        </Text>

        <CallControls
          muted={muted}
          onToggleMute={() => setMuted((was) => !was)}
          cameraOn={cameraOn}
          onToggleCamera={() => setCameraOn((was) => !was)}
          onEnd={onEnd}
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
    gap: theme.spacing.md,
  },
}))
