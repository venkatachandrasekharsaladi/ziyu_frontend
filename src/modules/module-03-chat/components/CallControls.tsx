import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

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
  const { theme } = useUnistyles()
  // Presence, not truthiness: `cameraOn === false` on a video call must still
  // show the button (camera off, offering to turn it back on).
  const hasCamera = onToggleCamera !== undefined

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleMute}
        accessibilityRole="button"
        accessibilityLabel={muted ? 'Unmute' : 'Mute'}
        style={styles.round}
      >
        <Feather
          name={muted ? 'mic-off' : 'mic'}
          size={24}
          color={theme.colors.text.onPrimary}
        />
      </Pressable>

      {hasCamera && (
        <Pressable
          onPress={onToggleCamera}
          accessibilityRole="button"
          accessibilityLabel={cameraOn ? 'Turn camera off' : 'Turn camera on'}
          style={styles.round}
        >
          <Feather
            name={cameraOn ? 'video' : 'video-off'}
            size={24}
            color={theme.colors.text.onPrimary}
          />
        </Pressable>
      )}

      <Pressable
        onPress={onEnd}
        accessibilityRole="button"
        accessibilityLabel="End call"
        style={styles.endRound}
      >
        <Feather name="phone-off" size={24} color={theme.colors.text.onPrimary} />
      </Pressable>
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
  round: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Translucent-on-anything, same reasoning `PhotoSharePreview`'s round
    // controls already use: this row sits over a photo/video surface on the
    // video screen and a plain page on the voice one, and a solid surface
    // token would look like a stray chip on one of the two.
    backgroundColor: theme.colors.surface.scrim,
  },
  endRound: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.feedback.error,
  },
}))
