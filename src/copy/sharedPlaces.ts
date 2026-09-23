/**
 * Copy for M06-S12 Where We Are — the private couples map.
 * Figma `Tales of Two` / `New Features` / 3482:2499.
 *
 * The privacy line at the foot of this screen is the most load-bearing sentence
 * in the cluster, so it is quoted from the frame exactly. Do not soften it, and
 * do not let it outrun what the app actually does — see the note on
 * `encryption` below.
 */
export const PLACES_COPY = {
  eyebrow: 'Tales of Two · Shared Spaces',
  title: 'Where we are',
  lede: 'Always a little closer.',
  onlyYouTwo: 'Only you two',

  togetherNow: 'Together right now',
  apart: (label: string) => label,
  liveNow: 'Live now',
  battery: (percent: number) => `${percent}%`,
  updated: (minutes: number) =>
    minutes === 0 ? 'Just now' : minutes === 1 ? '1 min ago' : `${minutes} min ago`,

  sendKiss: 'Send a kiss',
  onMyWay: 'On my way',

  durationLabel: 'Sharing duration',
  activeFor: (minutes: number) =>
    minutes >= 60
      ? `Active: ${Math.round(minutes / 60)} hours remaining`
      : `Active: ${minutes} minutes remaining`,
  /**
   * "Until Off" has no countdown, so it must not borrow one.
   *
   * Without this it fell through to `activeFor(0)` and the panel read "Active:
   * 0 minutes remaining" for the window that never expires — sharing looked
   * finished while it was still live. On a panel about who can see where you
   * are, reading the state wrong in the reassuring direction is the worst way
   * to be wrong.
   */
  activeIndefinitely: 'Active: until you turn it off',
  expiring: (at: string) => at,
  windows: {
    '1h': '1 Hour',
    tonight: 'Until Tonight',
    'until-off': 'Until Off',
  },

  pause: 'Pause my location',
  resume: 'Resume sharing',
  editBounds: 'Edit precise bounds',

  paused: {
    heading: 'Location paused',
    lede: (name: string) => `${name} can't see where you are right now.`,
  },

  actions: {
    suggest: { label: 'Send a pin', hint: 'Suggest a spot' },
    halfway: { label: 'Meet halfway', hint: 'Midpoint calc' },
    save: { label: 'Save memory', hint: 'To scrapbook' },
  },

  meetup: (name: string, walk: string) => `Meetup: ${name} · ${walk}`,

  /**
   * VERBATIM FROM THE FRAME, and a promise the backend has to keep.
   *
   * There is no backend yet, so today this sentence describes an intention
   * rather than a mechanism — nothing leaves the device because nothing is sent
   * anywhere. Whoever wires the real transport owns making it true; it is a
   * claim about encryption, and shipping it over a plain channel would be a lie
   * told to a couple about their own location.
   */
  encryption:
    'End-to-end encrypted between you two. Your coordinates are shared exclusively with each other and are never logged or stored on external servers.',

  mapLabel: (area: string) => `Map of ${area} showing both of your positions`,
} as const
