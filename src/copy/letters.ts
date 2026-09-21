/**
 * Copy for M06-S08 Letters (the vault), M06-S09 the composer, and M06-S10 the
 * reading view. Figma `Tales of Two` / `New Features` / 3483:4305.
 *
 * The tallest frame on the page at 4349pt, because it draws the entire life of a
 * letter in one column: waiting → written → sealed → opened → archived. Those
 * are three screens here, split where the user's intent changes rather than
 * where the frame has a gap.
 */
export const LETTERS_COPY = {
  eyebrow: 'A Private Couple Vault',
  headerTitle: 'Keepsakes & Archives',
  title: 'Letters',
  lede: 'Words worth keeping. Some things are too quiet for chat and too heavy to let disappear.',

  tabs: {
    waiting: 'Waiting for you',
    fromYou: 'From you',
    fromMe: 'From me',
    opened: 'Opened',
  },

  sectionWaiting: (name: string) => `Waiting for ${name} · sealed keepsakes`,
  privateTo: (names: string) => `Private to ${names}`,

  number: (n: number) => `No. ${String(n).padStart(3, '0')}`,
  sealedKeepsake: 'Sealed Keepsake',
  anniversaryVault: 'Anniversary Vault',

  states: {
    sealed: 'Sealed',
    ready: 'Ready to open',
    opened: 'Opened',
  },

  to: 'To',
  from: 'From',
  written: 'Written',
  opensOn: 'Opens on',
  unlocked: 'Unlocked',
  today: 'Today',

  unlocksIn: (days: number) => (days === 1 ? 'Unlocks in 1 day' : `Unlocks in ${days} days`),
  breakSeal: 'Break Wax Seal',
  readLetter: 'Read letter',

  write: 'Write a letter',

  archivesLabel: 'From our shared archives',
  viewAll: (n: number) => `View all ${n} letters`,

  empty: {
    waiting: 'Nothing waiting. They will get here.',
    fromYou: "You haven't written one yet.",
    fromMe: 'Nothing from you yet.',
    opened: 'Nothing opened yet.',
  },
} as const

export const LETTER_COMPOSE_COPY = {
  eyebrow: 'Letter composer',
  title: "Write something they'll keep.",
  lede: 'No typing indicators. No read receipts. Just an unhurried digital letter waiting for the right moment.',

  toLabel: 'To',
  fromLabel: 'From',
  titleLabel: 'Letter title',
  titlePlaceholder: 'For the day you need a little reminder',

  bodyLabel: 'The letter',
  bodyPlaceholder: 'Dearest…',
  wordCount: (n: number) => (n === 1 ? '1 word written' : `${n} words written`),

  encloseLabel: 'Enclose with this letter',
  encloseOptional: 'Optional',
  enclosures: {
    photo: { label: 'Attach a photo', hint: 'From your memories' },
    memory: { label: 'Link a memory', hint: 'A story milestone' },
    note: { label: 'Add outer note', hint: '"Open before morning coffee"' },
  },

  whenLabel: 'When should they open it?',
  whenLede: 'Choose the moment, then let it wait.',
  waxSealed: 'Wax sealed',
  sealUntil: 'Seal this letter until…',
  sealedFor: (date: string) => `Sealed until ${date}`,
  change: 'Change',

  seal: 'Seal the letter',
  sealWarning: (date: string) =>
    `Once sealed, neither of you can open this letter until ${date}.`,
  sealNow: 'Send it now',
  sendWarning: 'They will be able to read this the moment you send it.',

  titleRequired: 'Give the letter a title.',
  bodyRequired: 'A letter needs some words in it.',

  done: {
    badge: 'Confirmed keepsake',
    title: 'Your letter is sealed.',
    lede: 'Now it has somewhere to wait.',
    stored: (names: string, date: string) => `Stored safely in the ${names} archive · opens ${date}`,
    storedOpen: (names: string) => `Stored safely in the ${names} archive`,
    back: 'Back to letters',
  },
} as const

export const LETTER_READ_COPY = {
  eyebrow: 'Recipient experience',
  title: 'A letter for you.',
  openedOn: (date: string) => `Opened ${date}`,

  brand: (n: number) => `Tales of Two · Letter No. ${String(n).padStart(3, '0')}`,
  writtenIn: (place: string) => `Written in ${place}`,

  enclosed: 'Enclosed photograph',

  keep: 'Keep this letter',
  addToStory: 'Add this moment to our story',
  preserved: 'Permanently preserved in Memories',

  /** Shown in place of the body while the letter is still sealed. */
  stillSealed: {
    heading: 'Still sealed.',
    lede: (date: string) => `This one opens on ${date}. Not long now.`,
  },
} as const
