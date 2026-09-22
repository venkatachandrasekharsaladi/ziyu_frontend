import * as ImagePicker from 'expo-image-picker'

import { createExpoMediaService } from '@/services/media/expoMedia'

/**
 * `expo-image-picker` IS the native module — there is no JS fallback to fall
 * back to. Under Jest its functions reach for a native handle that does not
 * exist, so the four the wrapper calls are replaced here, and nothing else.
 *
 * That the mock is exactly four functions is the point of this file: those four
 * calls, in that order, with those arguments, are the whole contract
 * `createExpoMediaService` has with the platform.
 */
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}))

const picker = jest.mocked(ImagePicker)

/**
 * Only `granted` is read by the wrapper. `status`, `expires` and `canAskAgain`
 * are cast away on purpose rather than filled in with plausible values —
 * spelling them out would imply the wrapper consults them, and the next reader
 * would go looking for where.
 */
function permission(granted: boolean) {
  return { granted } as ImagePicker.MediaLibraryPermissionResponse
}

/** Everything but `uri`, `width` and `height` is optional and unread here. */
const ASSET: ImagePicker.ImagePickerAsset = {
  uri: 'file:///tmp/photo.jpg',
  width: 1200,
  height: 900,
}

const PICKED: ImagePicker.ImagePickerResult = { canceled: false, assets: [ASSET] }
const CLOSED: ImagePicker.ImagePickerResult = { canceled: true, assets: null }

const service = createExpoMediaService()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('pickPhoto', () => {
  it('asks for library permission BEFORE opening the picker', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue(PICKED)

    await service.pickPhoto()

    // Order, not merely presence. Both calls happening is not the guarantee —
    // asking first is, because a picker opened before the ask is a picker the
    // OS may close on its own and report back as a cancellation.
    expect(picker.requestMediaLibraryPermissionsAsync.mock.invocationCallOrder[0]).toBeLessThan(
      picker.launchImageLibraryAsync.mock.invocationCallOrder[0],
    )
  })

  it('reports a refusal as PERMISSION_DENIED without opening the picker at all', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(false))

    const result = await service.pickPhoto()

    expect(result).toEqual({ ok: false, error: { code: 'PERMISSION_DENIED' } })
    // THE REASON THE WRAPPER EXISTS. `launchImageLibraryAsync` without
    // permission resolves as `canceled: true` on some platforms, so a wrapper
    // that launched anyway would report a refusal as a change of mind and the
    // screen would never tell the user to open Settings.
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled()
  })

  it('reports a closed picker as CANCELLED, which is not an error', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue(CLOSED)

    const result = await service.pickPhoto()

    // Distinct from PERMISSION_DENIED above and from UNKNOWN below — three
    // outcomes a screen words differently, and the union is what keeps them
    // from collapsing into one "something went wrong".
    expect(result).toEqual({ ok: false, error: { code: 'CANCELLED' } })
  })

  it('maps the first asset to uri, width and height', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue(PICKED)

    const result = await service.pickPhoto()

    // Exactly three fields: the asset also carries exif, fileName and mimeType,
    // and none of it crosses the boundary. A screen that wanted `fileSize`
    // would have to widen `PickedPhoto` deliberately rather than find it
    // already smuggled through.
    expect(result).toEqual({
      ok: true,
      value: { uri: 'file:///tmp/photo.jpg', width: 1200, height: 900 },
    })
  })

  it('reports an empty assets array as UNKNOWN rather than crashing', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [] })

    // A success carrying nothing should not happen and does — on Android when
    // the file the user chose has since gone. `assets[0].uri` on that result is
    // a TypeError inside a press handler.
    expect(await service.pickPhoto()).toEqual({ ok: false, error: { code: 'UNKNOWN' } })
  })

  it('reports a missing assets array as UNKNOWN rather than crashing', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    // Off-contract on purpose: the declared type says `assets` is always there
    // on a success, and the optional chain in `fromResult` exists because a
    // native module is free to disagree with its own types.
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
    } as ImagePicker.ImagePickerResult)

    expect(await service.pickPhoto()).toEqual({ ok: false, error: { code: 'UNKNOWN' } })
  })

  it('reports a throwing permission request as UNAVAILABLE rather than propagating', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockRejectedValue(new Error('no native module'))

    // The web build has no native module, so the throw arrives from the very
    // first call. It must not escape: the caller is a press handler, and an
    // unhandled rejection there is a red screen rather than a sentence.
    expect(await service.pickPhoto()).toEqual({ ok: false, error: { code: 'UNAVAILABLE' } })
  })

  it('reports a throwing launcher as UNAVAILABLE rather than propagating', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockRejectedValue(new Error('no native module'))

    // The same code from the other side of the permission gate: a simulator
    // with the photos app removed grants permission and then has nothing to
    // launch. One `try` covers both halves, so both halves are tested.
    expect(await service.pickPhoto()).toEqual({ ok: false, error: { code: 'UNAVAILABLE' } })
  })

  it('passes allowsEditing and aspect through to the picker', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue(PICKED)

    await service.pickPhoto({ allowsEditing: true, aspect: [1, 1] })

    // The avatar well is a circle, so Create Profile asks for the system
    // cropper at 1:1. If the option stopped reaching the native call the crop
    // would silently not happen and a landscape photo would land in the well.
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [1, 1] }),
    )
  })

  it('defaults to no editing when no options are given', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchImageLibraryAsync.mockResolvedValue(PICKED)

    await service.pickPhoto()

    // The explicit `false` is what keeps the cropper from appearing on the
    // screens that take the photo as it is; leaving it `undefined` would hand
    // the decision to whatever the native module defaults to this version.
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: false, aspect: undefined }),
    )
  })
})

/**
 * The camera path is written out rather than shared with the library path
 * through a loop, because the thing most likely to break is exactly the thing a
 * loop would factor away: a `takePhoto` that asked for the LIBRARY permission,
 * or launched the LIBRARY, would pass every behavioural assertion above.
 */
describe('takePhoto', () => {
  it('asks for camera permission BEFORE opening the camera', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockResolvedValue(PICKED)

    await service.takePhoto()

    expect(picker.requestCameraPermissionsAsync.mock.invocationCallOrder[0]).toBeLessThan(
      picker.launchCameraAsync.mock.invocationCallOrder[0],
    )
    // The library permission is a different OS prompt with different wording.
    // Asking for it here would prompt the user about photos and then fail at
    // the camera — or, worse, succeed on a device where photos were already
    // allowed and hide the bug until someone declined them.
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled()
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled()
  })

  it('reports a refusal as PERMISSION_DENIED without opening the camera at all', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(false))

    const result = await service.takePhoto()

    expect(result).toEqual({ ok: false, error: { code: 'PERMISSION_DENIED' } })
    expect(picker.launchCameraAsync).not.toHaveBeenCalled()
  })

  it('reports a closed camera as CANCELLED, which is not an error', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockResolvedValue(CLOSED)

    expect(await service.takePhoto()).toEqual({ ok: false, error: { code: 'CANCELLED' } })
  })

  it('maps the first asset to uri, width and height', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockResolvedValue(PICKED)

    expect(await service.takePhoto()).toEqual({
      ok: true,
      value: { uri: 'file:///tmp/photo.jpg', width: 1200, height: 900 },
    })
  })

  it('reports an empty assets array as UNKNOWN rather than crashing', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [] })

    expect(await service.takePhoto()).toEqual({ ok: false, error: { code: 'UNKNOWN' } })
  })

  it('reports a throwing camera as UNAVAILABLE rather than propagating', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockRejectedValue(new Error('no camera on this device'))

    // A simulator has no camera, and neither does the web build. Neither is
    // worth crashing First Memory over.
    expect(await service.takePhoto()).toEqual({ ok: false, error: { code: 'UNAVAILABLE' } })
  })

  it('passes allowsEditing and aspect through to the camera', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue(permission(true))
    picker.launchCameraAsync.mockResolvedValue(PICKED)

    await service.takePhoto({ allowsEditing: true, aspect: [4, 3] })

    expect(picker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [4, 3] }),
    )
  })
})
