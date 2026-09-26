import * as ImagePicker from 'expo-image-picker'

import type {
  MediaService,
  PickedPhoto,
  PickedVideo,
  PickOptions,
  Result,
} from '@/services/media/types'

function ok(asset: ImagePicker.ImagePickerAsset): Result<PickedPhoto> {
  return {
    ok: true,
    value: { uri: asset.uri, width: asset.width, height: asset.height },
  }
}

function okVideo(asset: ImagePicker.ImagePickerAsset): Result<PickedVideo> {
  return {
    ok: true,
    value: { uri: asset.uri, durationMs: asset.duration ?? undefined },
  }
}

/**
 * Turns a picker result into the app's own union.
 *
 * `canceled` is deliberately a RESULT rather than a thrown error or a silent
 * `null`: closing the picker is a thing people do on purpose, and a screen
 * needs to tell it apart from a refusal it should explain.
 */
function fromResult(result: ImagePicker.ImagePickerResult): Result<PickedPhoto> {
  if (result.canceled) return { ok: false, error: { code: 'CANCELLED' } }

  const asset = result.assets?.[0]

  return asset ? ok(asset) : { ok: false, error: { code: 'UNKNOWN' } }
}

function fromVideoResult(result: ImagePicker.ImagePickerResult): Result<PickedVideo> {
  if (result.canceled) return { ok: false, error: { code: 'CANCELLED' } }

  const asset = result.assets?.[0]

  return asset ? okVideo(asset) : { ok: false, error: { code: 'UNKNOWN' } }
}

/**
 * THE REAL PICKER — `expo-image-picker`, wrapped.
 *
 * Not a mock. Choosing a photo is a device capability and needs no server, so
 * unlike `auth` or `pairing` there is nothing here standing in for something
 * that does not exist yet.
 *
 * PERMISSIONS ARE REQUESTED, NOT ASSUMED. Both entry points ask first and map a
 * refusal to `PERMISSION_DENIED`, because the alternative — calling `launch*`
 * without permission — resolves as a cancellation on some platforms, which
 * would have the screen tell the user they changed their mind when in fact the
 * OS said no.
 *
 * NOTHING IS UPLOADED. The returned `uri` is local. That is the same promise the
 * rest of this app makes and the same limitation: it does not survive a
 * reinstall and does not reach the partner's phone until a backend exists.
 */
export function createExpoMediaService(): MediaService {
  return {
    async pickPhoto(options: PickOptions = {}) {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) return { ok: false, error: { code: 'PERMISSION_DENIED' } }

        return fromResult(
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: options.allowsEditing ?? false,
            aspect: options.aspect,
            quality: 0.9,
          }),
        )
      } catch {
        // The web build has no native library module; so does a simulator with
        // the photos app removed. Neither is worth crashing a screen over.
        return { ok: false, error: { code: 'UNAVAILABLE' } }
      }
    },

    async takePhoto(options: PickOptions = {}) {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) return { ok: false, error: { code: 'PERMISSION_DENIED' } }

        return fromResult(
          await ImagePicker.launchCameraAsync({
            allowsEditing: options.allowsEditing ?? false,
            aspect: options.aspect,
            quality: 0.9,
          }),
        )
      } catch {
        return { ok: false, error: { code: 'UNAVAILABLE' } }
      }
    },

    async pickVideo() {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) return { ok: false, error: { code: 'PERMISSION_DENIED' } }

        return fromVideoResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] }))
      } catch {
        return { ok: false, error: { code: 'UNAVAILABLE' } }
      }
    },

    async takeVideo() {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) return { ok: false, error: { code: 'PERMISSION_DENIED' } }

        return fromVideoResult(
          await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'] }),
        )
      } catch {
        return { ok: false, error: { code: 'UNAVAILABLE' } }
      }
    },
  }
}
