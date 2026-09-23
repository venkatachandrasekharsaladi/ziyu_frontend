/**
 * Copy for M06-S11 Watch Together.
 * Figma `Tales of Two` / `New Features` / 3482:2738.
 */
export const WATCH_COPY = {
  eyebrow: 'Tales of Two · Shared Living Room',
  headerStatus: 'Together · connected',
  inSync: 'In sync',
  title: 'Watch together.',
  lede: 'Same screen. Different places. Snuggle up from wherever you are.',

  tonightsPick: "Tonight's pick",
  pickedBy: (name: string) => `${name}'s pick`,
  match: (score: number) => `${score.toFixed(1)} match`,

  start: 'Start watching now',
  invite: (name: string) => `Invite ${name}`,

  sessionLabel: 'Live synchronized session',
  connected: (names: string) => `${names} connected`,
  disconnected: 'Waiting for them to join',
  watchingTogether: 'Watching together',
  frameLocked: (drift: string) => `Frame locked (${drift})`,

  reactTo: (name: string) => `React to ${name}`,
  whisper: 'Whisper note',
  whispersLabel: "Whispers from tonight's session",
  whispersCount: (n: number) => (n === 1 ? '1 note shared' : `${n} notes shared`),
  whisperPlaceholder: 'Say something only they will read…',
  send: 'Send',

  continueLabel: 'Continue watching',
  viewQueue: (n: number) => `View queue (${n})`,
  finished: (percent: number) => `${percent}% finished`,

  historyLabel: 'Our watch history',
  titlesWatched: (n: number) => `${n} titles watched`,
  completed: 'Completed',

  /** Accessibility only — the player itself carries no visible label. */
  playerLabel: (title: string) => `${title}, shared playback`,

  empty: {
    whispers: 'Nothing whispered yet.',
    queue: 'Nothing queued.',
  },
} as const
