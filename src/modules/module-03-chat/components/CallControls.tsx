import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'

type Props = {
  muted: boolean
  onToggleMute: () => void
  /**
   * Omitted entirely (not just falsy) for a voice call — `VoiceMomentScreen`
   * renders this component without either camera prop, and that ABSENCE, not
   * a `false` value, is what this component reads to decide whether the
   * camera control exists at all. A voice call has no camera to toggle, so
   * there is nothing here for it to render rather than a disabled button.
   */
  cameraOn?: boolean
  onToggleCamera?: () => void
  onEnd: () => void
}

/**
 * The row of in-call controls both Moment screens end on. Figma `Ziyu`
 * 3391:884 (voice) / 3391:842 (video) — same row, the video frame just has
 * one more button in it.
 *
 * Every label here is a contract with Task 14's end-to-end journey (see the
 * task-12 brief's accessibility section) — the exact strings, not just their
 * presence, are asserted on elsewhere, so don't reword them without checking
 * there first.
 */
export function CallControls({
  muted,
  onToggleMute,
  cameraOn,
  onToggleCamera,
  onEnd,
}: Props) {
  // Presence, not truthiness: `cameraOn === false` on a video call must still
  // show the button (camera off, offering to turn it back on).
  const hasCamera = onToggleCamera !== undefined

  return (
    <View style={styles.row}>
      <IconButton
        icon={muted ? 'mic-off' : 'mic'}
        label={muted ? 'Unmute' : 'Mute'}
        onPress={onToggleMute}
        size="lg"
        tone="onMedia"
      />

      {hasCamera && (
        <IconButton
          icon={cameraOn ? 'video' : 'video-off'}
          label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
          onPress={onToggleCamera}
          size="lg"
          tone="onMedia"
        />
      )}

      <IconButton icon="phone-off" label="End call" onPress={onEnd} size="lg" tone="danger" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
}))
