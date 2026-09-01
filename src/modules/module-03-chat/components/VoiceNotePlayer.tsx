import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type Props = {
  durationMs: number
  /**
   * A formatted clock reading (`MessageBubble`'s own `clockTime(sentAt)`),
   * folded into the play control's accessible name so two voice notes in
   * the same thread don't share one fixed "Play voice note" name. Optional:
   * a bare unit render with no message behind it keeps the plain name.
   */
  time?: string
}

/**
 * A static waveform. Real audio capture/playback is out of scope for this
 * mock (no audio dependency in this project — see `VoiceNoteRecorder`'s
 * header comment), so there is no decoded amplitude data to draw from. These
 * heights are a fixed, hand-picked cadence that reads as a waveform at a
 * glance; they do not correspond to any real waveform, and they do not
 * change with `durationMs`.
 */
const BAR_HEIGHTS = [6, 12, 18, 10, 22, 14, 8, 16, 20, 11, 7, 15]

/**
 * Formats a duration as `m:ss` — NOT `toLocaleTimeString`, which is a clock
 * reading and varies with the device locale/timezone. A voice note's length
 * has no timezone; writing the maths out by hand keeps `65000` reading
 * `1:05` on every device the app runs on. Exported so `VoiceNoteRecorder`'s
 * live elapsed-time readout uses the exact same formatting rather than a
 * second, driftable implementation.
 */
export function clock(ms: number): string {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * A received/sent voice note. `MessageBubble` renders this when
 * `message.kind === 'voice'`, additively alongside a transcript body — same
 * pattern Task 8 established for a photo message's caption (see
 * `MessageBubble.tsx`).
 *
 * `durationMs` is the only prop: there is no audio dependency in this
 * project (checked — nothing matching "audio" in package.json) and adding
 * one is out of scope here, so there is no real clip behind this to seek
 * or scrub. The play control only flips its own icon between play/pause —
 * a visual toggle, not real playback — which is why it takes no callback
 * prop at all.
 */
export function VoiceNotePlayer({ durationMs, time }: Props) {
  const { theme } = useUnistyles()
  const [isPlaying, setIsPlaying] = useState(false)

  // Not derived from `isPlaying` — Task 14 asserts on this exact prefix and
  // there is no "Pause voice note" label in the contract for it to flip to.
  const label = time ? `Play voice note, sent at ${time}` : 'Play voice note'

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => setIsPlaying((was) => !was)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.playButton}
      >
        <Feather
          name={isPlaying ? 'pause' : 'play'}
          size={16}
          color={theme.colors.chat.onAccent}
        />
      </Pressable>

      <View style={styles.waveform}>
        {BAR_HEIGHTS.map((height, i) => (
          // Index as key: a fixed-length, never-reordered array, same as
          // `TypingIndicator`'s three dots.
          <View key={i} style={[styles.bar, { height }]} />
        ))}
      </View>

      <Text variant="caption" tone="onChat">
        {clock(durationMs)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: 180,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chat.accent,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.chat.accent,
  },
}))
