/**
 * THE MEDIA BOUNDARY — choosing a photo off the device.
 *
 * Mirrors `services/auth` and `services/pairing` in shape: a typed interface and
 * errors as codes rather than strings. It differs from them in one way worth
 * knowing — the implementation behind this one is REAL, not a mock, because
 * picking a photo is a device capability and needs no server. Nothing here
 * uploads anything; a picked photo is a local `file://` URI and lives exactly as
 * long as everything else in this app does, which is until the process dies.
 *
 * The boundary still earns its place: it keeps `expo-image-picker` out of four
 * screens, it turns three different permission outcomes into one union a screen
 * can switch on, and it is what lets a test pick a photo without a device.
 */

export type MediaErrorCode =
  /** The user closed the picker without choosing. Not an error to shout about. */
  | 'CANCELLED'
  /** Permission was refused. The screen should say how to undo that. */
  | 'PERMISSION_DENIED'
  /** No camera or library on this platform — the web build, typically. */
  | 'UNAVAILABLE'
  | 'UNKNOWN'

export type MediaError = {
  code: MediaErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: MediaError }

export type PickedPhoto = {
  /** A local `file://` URI. Nothing has been uploaded. */
  uri: string
  width: number
  height: number
}

export type PickOptions = {
  /**
   * Offers the system crop step. Used where the result lands in a fixed frame —
   * an avatar well is a circle, so a landscape photo has to be cropped by
   * somebody, and the system's cropper is better than ours.
   */
  allowsEditing?: boolean
  /** Crop aspect, when editing. `[1, 1]` for an avatar. */
  aspect?: [number, number]
}

export type MediaService = {
  /** Opens the photo library. */
  pickPhoto: (options?: PickOptions) => Promise<Result<PickedPhoto>>
  /** Opens the camera. */
  takePhoto: (options?: PickOptions) => Promise<Result<PickedPhoto>>
}
