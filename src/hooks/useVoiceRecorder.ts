import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { useCallback, useState } from 'react'

import { VOICE_RECORDER_COPY } from '@/copy/voiceRecorder'

type RecordedVoice = { uri: string; durationMs: number }

type UseVoiceRecorder = {
  /** True while actively recording — drives the pulsing-dot UI. */
  isRecording: boolean
  /** How long the current (or just-finished) recording has run, in ms. */
  elapsedMs: number
  start: () => void
  /** Stops the recorder and hands back the clip, or `null` on failure. */
  stop: () => Promise<RecordedVoice | null>
  /** A sentence to show the user, or `null`. */
  error: string | null
  clearError: () => void
}

/**
 * Real microphone capture for a memory's voice note — `expo-audio`, the same
 * "picking a device capability needs no server" territory `usePhotoPick`
 * covers for photos. Chat's own `VoiceNoteRecorder` is a timer with nothing
 * behind it (see that file's header — no audio dependency existed yet); this
 * is that dependency, scoped to Memories for now.
 */
export function useVoiceRecorder(): UseVoiceRecorder {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const state = useAudioRecorderState(recorder, 100)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(() => {
    setError(null)

    void (async () => {
      const permission = await requestRecordingPermissionsAsync()

      if (!permission.granted) {
        setError(VOICE_RECORDER_COPY.permissionDenied)
        return
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
      await recorder.prepareToRecordAsync()
      recorder.record()
    })()
  }, [recorder])

  const stop = useCallback(async () => {
    await recorder.stop()

    if (!recorder.uri) return null

    return { uri: recorder.uri, durationMs: state.durationMillis }
  }, [recorder, state.durationMillis])

  return {
    isRecording: state.isRecording,
    elapsedMs: state.durationMillis,
    start,
    stop,
    error,
    clearError: useCallback(() => setError(null), []),
  }
}
