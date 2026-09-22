/**
 * Copy for picking a photo — shared by every screen that offers it.
 *
 * One file rather than a sentence per screen, because there is nothing
 * screen-specific about "we could not open your photos": the same three things
 * can go wrong in Create Profile, First Memory, First Date Memory and Add
 * Memory, and four wordings of one refusal is four chances to word it badly.
 *
 * `CANCELLED` has no entry on purpose. Closing the picker is a decision, not a
 * failure, and it is handled before this table is reached.
 */
export const PHOTO_PICK_COPY = {
  errors: {
    /**
     * Says what to do about it. A refusal the user cannot undo from inside the
     * app is worth naming the actual place they can undo it.
     */
    PERMISSION_DENIED:
      'We need permission to open your photos. You can turn it on in your device settings.',
    UNAVAILABLE: 'No photo library is available on this device.',
    UNKNOWN: 'That photo could not be opened. Try another one.',
  },

  /** The action labels the pickers are opened from. */
  choose: 'Choose a photo',
  take: 'Take a photo',
  change: 'Change photo',
  remove: 'Remove photo',
} as const
