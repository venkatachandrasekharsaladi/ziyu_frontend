import { useCallback, useState } from 'react'

import { VIDEO_PICK_COPY } from '@/copy/videoPick'
import { mediaService } from '@/services/media'
import type { MediaErrorCode } from '@/services/media/types'

type PickedVideo = { uri: string; durationMs?: number }

type UseVideoPick = {
  /** Opens the library. Calls `onPicked` with a local uri on success. */
  pick: () => void
  /** Opens the camera in video mode. */
  capture: () => void
  /** A sentence to show the user, or `null`. Cancelling sets nothing. */
  error: string | null
  clearError: () => void
  /** True while a picker is open, for disabling the control. */
  busy: boolean
}

/**
 * Picking a video, the video sibling of `usePhotoPick` — same shape, same
 * cancel-is-not-an-error rule, so a screen that already knows one already
 * knows the other.
 */
export function useVideoPick(onPicked: (video: PickedVideo) => void): UseVideoPick {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (open: 'pick' | 'capture') => {
      setBusy(true)
      setError(null)

      const result = open === 'pick' ? await mediaService.pickVideo() : await mediaService.takeVideo()

      setBusy(false)

      if (result.ok) {
        onPicked(result.value)

        return
      }

      if (result.error.code === 'CANCELLED') return

      setError(VIDEO_PICK_COPY.errors[result.error.code as Exclude<MediaErrorCode, 'CANCELLED'>])
    },
    [onPicked],
  )

  return {
    pick: useCallback(() => void run('pick'), [run]),
    capture: useCallback(() => void run('capture'), [run]),
    error,
    clearError: useCallback(() => setError(null), []),
    busy,
  }
}
