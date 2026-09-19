/**
 * Copy for the Space hub's unpersonalized state. Figma `3430:1503`,
 * "Space Not Personalized (Module 05)".
 *
 * NOT a separate destination. The frame draws the Space tab with its bar
 * active and no way back to a populated hub, which means it is what the tab
 * shows before the pair have named their space — a state, not a page. It is
 * addressable at `/space/welcome` so it can be opened and reviewed on its own,
 * but the hub renders it directly.
 */
export const SPACE_WELCOME_COPY = {
  title: 'Your little world is waiting.',
  lede: 'Add a few personal touches and make LoveOS feel like yours.',

  personalize: 'Personalize Our Space',
  later: 'Maybe Later',

  /** The orb is decorative; this is what a screen reader is told instead. */
  orbLabel: 'A waiting, unpersonalized space',
} as const
