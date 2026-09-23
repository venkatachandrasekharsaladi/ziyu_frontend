import { createExpoMediaService } from '@/services/media/expoMedia'
import { request } from '@/services/http/client'

export type * from '@/services/media/types'

/**
 * The swap point, same as every other service — every screen imports
 * `mediaService` from here, never from `expoMedia`.
 *
 * Unlike the others this is NOT a mock: the implementation behind it is real,
 * because picking a photo needs a device rather than a server. The indirection
 * still pays for itself — it is what lets a test pick a photo without one.
 */
export const mediaService = createExpoMediaService()

/**
 * MEDIA UPLOAD.
 *
 * THE PROBLEM THIS SOLVES. Every picker in the app hands back a *local* URI —
 * `file:///…`, `content://…`, `ph://…`. The mocks stored those strings happily,
 * because the image never left the device. A real server cannot: `photoUri` and
 * `mediaUri` are validated as `http(s)` URLs, and a `file://` path means
 * nothing to the partner's phone.
 *
 * So a local URI has to become a remote one before it is attached to anything.
 * `ensureRemoteUri` is that step, and it is a no-op for a URI that is already
 * remote — which keeps it safe to call unconditionally from every adapter,
 * including on an edit that did not change the photo.
 *
 * WHY UPLOAD FIRST, THEN ATTACH. The alternative — posting the memory and the
 * bytes together — makes one request that can half-fail: a 20 MB video that
 * dies at 90% would take the caption with it. Two steps means a failed upload
 * costs the upload only, and the retry does not re-send the text.
 */

export type UploadedMedia = {
  url: string
  contentType: string
  bytes: number
}

const REMOTE = /^https?:\/\//i

export function isRemoteUri(uri: string): boolean {
  return REMOTE.test(uri)
}

/**
 * Guesses a MIME type from the extension.
 *
 * React Native's `FormData` needs an explicit `type` on a file part — it will
 * not sniff one — and the server rejects anything outside its allow-list. This
 * is a client-side hint only: the server re-derives the real type and does not
 * trust what is claimed here.
 */
function guessContentType(uri: string): string {
  const extension = uri.split('?')[0]?.split('.').pop()?.toLowerCase() ?? ''
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'heic':
      return 'image/heic'
    case 'mp4':
      return 'video/mp4'
    case 'mov':
      return 'video/quicktime'
    case 'm4a':
      return 'audio/mp4'
    case 'mp3':
      return 'audio/mpeg'
    case 'ogg':
      return 'audio/ogg'
    case 'webm':
      return 'audio/webm'
    default:
      return 'application/octet-stream'
  }
}

export async function uploadMedia(localUri: string): Promise<UploadedMedia> {
  const form = new FormData()

  /**
   * The `{ uri, name, type }` shape is React Native's file part. It is not
   * standard DOM `FormData`, hence the cast — RN's bundler resolves it at
   * runtime. The name is a placeholder: the server discards client filenames
   * and stores a random one, so nothing depends on this value.
   */
  form.append('file', {
    uri: localUri,
    name: `upload.${localUri.split('?')[0]?.split('.').pop() ?? 'bin'}`,
    type: guessContentType(localUri),
  } as unknown as Blob)

  // Uploads are slower than JSON calls; the default 15s timeout would clip them.
  const response = await request<UploadedMedia>('/media', {
    method: 'POST',
    form,
    timeoutMs: 120_000,
  })

  return response.data
}

/** Uploads only when needed. Safe to call on any URI, including `undefined`. */
export async function ensureRemoteUri(uri: string | undefined): Promise<string | undefined> {
  if (!uri) return undefined
  if (isRemoteUri(uri)) return uri
  return (await uploadMedia(uri)).url
}
