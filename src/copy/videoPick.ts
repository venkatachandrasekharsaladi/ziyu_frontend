/**
 * Copy for picking a video — the video sibling of `photoPick.ts`, same shape
 * and same reasoning: one wording of each refusal rather than one per screen.
 */
export const VIDEO_PICK_COPY = {
  errors: {
    PERMISSION_DENIED:
      'We need permission to open your videos. You can turn it on in your device settings.',
    UNAVAILABLE: 'No video library is available on this device.',
    UNKNOWN: 'That video could not be opened. Try another one.',
  },

  choose: 'Choose a video',
  take: 'Record a video',
  remove: 'Remove video',
} as const
