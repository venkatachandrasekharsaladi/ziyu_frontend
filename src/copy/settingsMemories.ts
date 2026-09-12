/**
 * Copy for Settings → Memories & Story.
 *
 * On This Day is the one feature in this app that arrives unasked — it surfaces
 * a photograph from a year ago without anyone opening anything. That makes both
 * the switch and the delivery time non-negotiable: a couple who have had a hard
 * year need to be able to turn it off, and the ones who keep it need to choose
 * when it lands.
 *
 * `albums` are the same local label map the screen's own header comment
 * describes — a placeholder for a real album list, not a read of one — but the
 * three names themselves are still user-facing strings, and every user-facing
 * string in this cluster lives in its screen's copy file, not in the component.
 * The map staying local to the screen (rather than becoming a `services/memories`
 * read) is a separate decision from where its three current labels are typed.
 */
export const SETTINGS_MEMORIES_COPY = {
  title: 'Memories & Story',
  lede: 'What comes back to you, and when.',

  resurfaceGroup: 'On This Day',
  onThisDay: 'Show On This Day',
  onThisDayDetail: 'A memory from this date in an earlier year.',
  deliveryTime: 'Arrives at',

  captureGroup: 'Adding memories',
  autoAdd: 'Add photos from chat',
  autoAddDetail: 'Photos you send each other are kept as memories.',
  defaultAlbum: 'Default album',
  albums: {
    all: 'All memories',
    favourites: 'Favourites',
    trips: 'Trips',
  },
  reminders: 'Memory reminders',
  remindersDetail: 'A nudge when it has been a while since you added anything.',
} as const
