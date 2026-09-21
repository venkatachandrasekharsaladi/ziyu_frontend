/**
 * Copy for M06-S06 Time Capsules (the vault) and M06-S07 the creation flow.
 * Figma `Tales of Two` / `New Features` / 3482:2146.
 *
 * The frame stacks three things on one artboard — the sealed vault, the 3-step
 * creation flow, and the "It's sealed" confirmation. They are three screens
 * here, because they are three moments: one you return to, one you pass
 * through, and one you see once.
 */
export const CAPSULES_COPY = {
  eyebrow: 'Sealed Vault · Tales of Two',
  headerTitle: 'Keepsakes',
  title: 'Something for our future selves.',
  lede: 'Leave a little piece of today for the two of you to discover later.',

  /** The featured capsule at the top. */
  featured: {
    label: 'Sealed capsule',
    remaining: (days: number) => `${days} days remaining`,
    opensOn: 'Opens on',
    sealedInside: 'Sealed inside',
    vault: (n: number) => `Vault #${String(n).padStart(2, '0')}`,
  },

  contents: {
    photos: 'Photos',
    letter: 'Letters',
    memory: 'Memories',
    prediction: 'Predictions',
    promise: 'Promises',
    question: 'Questions',
  },

  create: 'Create a Time Capsule',
  viewAll: 'View all sealed capsules',

  listLabel: 'Our capsules',
  listCount: (n: number) => (n === 1 ? '1 sealed' : `${n} sealed`),
  createdOn: (date: string, by: string) => `Created ${date} · ${by}`,
  opensIn: (date: string) => `Opens ${date}`,
  itemsEnclosed: (n: number) => (n === 1 ? '1 item enclosed' : `${n} items enclosed`),
  sealed: 'Sealed',

  empty: {
    heading: 'Nothing sealed yet',
    lede: 'The first capsule is the hardest. After that you will want one every year.',
  },

  /** How long a capsule stays shut, before it is sealed. */
  lockedFor: (days: number) => `${days} days`,
} as const

export const CAPSULE_CREATE_COPY = {
  eyebrow: 'Interactive creation flow',
  step: (n: number, of: number) => `Step ${n} of ${of}`,
  newKeepsake: 'New Keepsake',

  /** Step 1. */
  kindsTitle: 'What do we want to leave behind?',
  kindsLede: 'Select the types of intimate pieces to enclose in this capsule.',
  kindsRequired: 'Choose at least one thing to enclose.',

  /** Step 2. */
  whenTitle: 'Choose when it opens',
  whenLede: 'A capsule is only a capsule because it stays shut.',
  unsealsOn: 'Unseals on',
  change: 'Change',
  /** The four offered dates, relative to today. */
  options: {
    year: 'One year from now',
    threeYears: 'On our 3rd anniversary',
    fiveYears: 'On our 5th anniversary',
    tenYears: 'Ten years from now',
  },

  /** Step 3. */
  noteLabel: 'Add a little note (on the seal)',
  noteOptional: 'Optional',
  notePlaceholder: 'Only open this together over morning coffee on our terrace.',

  back: 'Back',
  next: 'Continue',
  seal: 'Seal our time capsule',
  sealWarning: 'Once sealed, contents cannot be opened until the designated date.',

  /** The confirmation. */
  done: {
    badge: 'Sealed & protected',
    title: "It's sealed.",
    lede: 'Whatever happens between now and then, this little moment is waiting for you.',
    vaultCode: 'Vault code',
    timeLocked: 'Time locked',
    sealedBy: 'Sealed by',
    both: 'Both of us',
    home: 'Return Home',
  },
} as const
