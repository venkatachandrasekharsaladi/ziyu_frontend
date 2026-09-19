/**
 * Copy for Space → Our Identity. Two frames, two screens, one copy file.
 *
 * `3430:138` "(Module 05)" is the full page: a card each for the two of you,
 * the day the journey began, and a save.
 *
 * `3430:1813` "(Refined)" is the short version: the pair's names, the date,
 * two portraits, a save.
 *
 * They share this file because they are the SAME SCREEN said twice. The lede
 * is identical in both frames, and two copies of it would be two things that
 * drift. What differs is which keys each screen reads.
 *
 * `pair` and `togetherSince` are functions for the reason the hub's are: the
 * whole sentence belongs in this file, not half of it here and half in a
 * template in the component.
 */
export const SPACE_IDENTITY_COPY = {
  /** (Module 05) — asks the question. */
  title: 'Who are we?',
  /** (Refined) — answers it, with the two names. */
  pair: (you: string, partner: string) => `${you} ♡ ${partner}`,
  togetherSince: (date: string) => `Together since ${date}`,
  lede: 'This is the little identity at the heart of your LoveOS space.',

  /**
   * The epithets are the couple's own words for each other, not ours. Until
   * there is a field for them these placeholders stand in — see the screen's
   * note on why they are not invented per-person.
   */
  youEpithet: 'THE PLANNER',
  partnerEpithet: 'THE DREAMER',

  editMine: 'Edit my profile',
  editPartner: 'Edit partner',

  journeyBegan: 'OUR JOURNEY BEGAN',
  journeyUnknown: 'Not recorded yet',
  /** Handwritten, tilted, on the journey card. */
  forever: '"Forever to go..."',

  save: 'Save Our Identity',
  saved: 'Your identity was saved.',
} as const
