import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { CHAT_COPY } from '@/copy/chat'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { IconButton } from '@/design-system/patterns/IconButton'
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
 * this screen's only exit is `onEnd`, which returns to that conversation.
 */
export function VoiceMomentScreen() {
  // Ending a call returns to the conversation it was started from — by
  // popping the stack normally, or by going there directly when this screen
  // was itself opened from a link and has no stack behind it.
  const onEnd = useBackTo('/(app)/chat/conversation')
  const insets = useSafeAreaInsets()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [muted, setMuted] = useState(false)

  // Cleared on unmount, same lesson `VoiceNoteRecorder` already learned the
  // hard way (Task 9's review finding): leaving unmounts this screen
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
        <Avatar name="Sweatcha" size={128} />
        {/* `wordmark` (20/600), not `h2` (34/700): the frame draws the
            partner's name at 20pt semibold (node 3391:919), the same size
            `ChatHeader` already gives it. The 128pt avatar is this screen's
            focal point — the name is its caption, not a page heading. */}
        <Text variant="wordmark" tone="heading">
          Sweatcha
        </Text>
        {/* "Together for 08:42" (node 3391:921, 16/400 = `label`) — labelled,
            as the frame draws it, not the bare clock this screen shipped
            with. */}
        <Text variant="label" tone="placeholder">
          {`${CHAT_COPY.moments.togetherForPrefix} ${clock(elapsedMs)}`}
        </Text>
        <Text variant="label" tone="muted" align="center">
          {CHAT_COPY.moments.voiceCaption}
        </Text>
      </View>

      {/*
        KEEP MOMENT — the frame's one affordance this screen never had.
        Disabled on purpose rather than wired to a no-op: `IconButton`
        renders `disabled` when `onPress` is omitted, which is this app's
        "honestly unavailable" rule (see its own header comment, and
        `BottomNav` for an unbuilt tab). Keeping a moment would have to write
        a Memory from a call that carries no audio and no recording — there
        is no service behind it — so it announces itself and stays inert
        until there is.
      */}
      <View style={styles.keep}>
        <IconButton icon="heart" label={CHAT_COPY.moments.keepMoment} tone="accent" />
        <Text variant="caption" tone="muted" align="center">
          {CHAT_COPY.moments.keepMoment}
        </Text>
      </View>

      <View style={styles.controls}>
        <CallControls
          muted={muted}
          onToggleMute={() => setMuted((was) => !was)}
          onEnd={onEnd}
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
  keep: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xl,
  },
  controls: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.xxl,
  },
}))
