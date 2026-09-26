import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
import { Text } from '@/design-system/primitives/Text'

type Props = {
  uri: string
  /** Shown before playback has loaded a real duration. */
  fallbackDurationMs?: number
}

/** `m:ss`, not a locale clock — a clip's length has no timezone. */
function clock(ms: number): string {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * A memory's voice note, REAL playback via `expo-audio` — unlike chat's
 * `VoiceNotePlayer`, whose own header explains why it draws a static
 * waveform with no audio behind it (no dependency existed yet). This one
 * has the dependency, so play/pause and the elapsed time are both real.
 */
export function MemoryVoicePlayer({ uri, fallbackDurationMs = 0 }: Props) {
  const player = useAudioPlayer(uri)
  const status = useAudioPlayerStatus(player)

  const durationMs = status.duration ? status.duration * 1000 : fallbackDurationMs
  const currentMs = status.currentTime * 1000

  const toggle = () => {
    if (status.playing) player.pause()
    else player.play()
  }

  return (
    <View style={styles.row}>
      <IconButton
        icon={status.playing ? 'pause' : 'play'}
        label={status.playing ? 'Pause voice note' : 'Play voice note'}
        onPress={toggle}
        size="sm"
        tone="accent"
      />

      <Text variant="caption" tone="muted">
        {clock(currentMs)} / {clock(durationMs)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
}))
