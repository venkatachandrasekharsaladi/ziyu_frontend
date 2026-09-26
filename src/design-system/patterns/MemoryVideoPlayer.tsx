import { useVideoPlayer, VideoView } from 'expo-video'
import { StyleSheet } from 'react-native-unistyles'

type Props = {
  uri: string
  testID?: string
}

/**
 * A memory's video clip. A real `VideoView`, the same `expo-video` module
 * `WatchTogetherScreen` installed — native controls (scrub, fullscreen,
 * volume) come from the platform rather than being drawn by hand.
 */
export function MemoryVideoPlayer({ uri, testID }: Props) {
  const player = useVideoPlayer(uri, (instance) => {
    // Not auto-played — a video that starts on its own inside a memory feed
    // would play over whatever else is open on the screen.
    instance.loop = false
  })

  return (
    <VideoView
      style={styles.video}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      testID={testID}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  video: {
    width: '100%',
    height: 220,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
  },
}))
