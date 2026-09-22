import { useCallback, useState } from 'react'

import { PHOTO_PICK_COPY } from '@/copy/photoPick'
import { mediaService } from '@/services/media'
import type { MediaErrorCode, PickOptions } from '@/services/media/types'

type UsePhotoPick = {
  /** Opens the library. Calls `onPicked` with a local uri on success. */
  pick: () => void
  /** Opens the camera. */
  capture: () => void
  /** A sentence to show the user, or `null`. Cancelling sets nothing. */
  error: string | null
  /** Dismisses the message — call it when the user tries again. */
  clearError: () => void
  /** True while a picker is open, for disabling the control. */
  busy: boolean
}

/**
 * Picking a photo, wired once instead of in four screens.
 *
 * Four screens needed exactly this — Create Profile, First Memory, First Date
 * Memory and Add Memory — and each of them carried `useCallback(() => {}, [])`
 * while `expo-image-picker` was uninstalled. This is what those stubs become.
 *
 * CANCELLING IS NOT AN ERROR. Closing the picker is a decision, so it clears
 * `error` rather than setting one; only a refusal or a missing capability
 * produces a sentence. Getting this backwards means telling somebody something
 * went wrong every time they change their mind.
 */
export function usePhotoPick(onPicked: (uri: string) => void, options?: PickOptions): UsePhotoPick {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (open: 'pick' | 'capture') => {
      setBusy(true)
      setError(null)

      const result =
        open === 'pick'
          ? await mediaService.pickPhoto(options)
          : await mediaService.takePhoto(options)

      setBusy(false)

      if (result.ok) {
        onPicked(result.value.uri)

        return
      }

      // Cancelling leaves the screen exactly as it was.
      if (result.error.code === 'CANCELLED') return

      setError(PHOTO_PICK_COPY.errors[result.error.code as Exclude<MediaErrorCode, 'CANCELLED'>])
    },
    [onPicked, options],
  )

  return {
    pick: useCallback(() => void run('pick'), [run]),
    capture: useCallback(() => void run('capture'), [run]),
    error,
    clearError: useCallback(() => setError(null), []),
    busy,
  }
}
