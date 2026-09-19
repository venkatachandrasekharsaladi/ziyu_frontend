/**
 * Copy for the Space tab's hub — Figma `3430:2338`, "Our Space (Refined)".
 *
 * The refined frame replaces the `(Module 05)` one at `3430:3`: same three
 * sections, but the stats moved into two stacked cards and the settings links
 * gained a one-line description each.
 *
 * `privateBody` and `since` are FUNCTIONS, not strings. Both name something the
 * pair supplied — the partner and the day they started — and a template held in
 * the screen would put half of a sentence in the component and half here. The
 * whole sentence lives in this file or none of it does.
 */
export const SPACE_HOME_COPY = {
  title: 'Our little world.',
  lede: 'Everything that makes this space yours, together.',

  timeTogether: 'TIME TOGETHER',
  daysLabel: 'days of shared memories',
  since: (date: string) => `Since ${date}`,
  /** Drawn when the pair has not recorded the day they started. */
  sinceUnknown: 'Since you began',

  privateTitle: 'Private Space',
  privateBody: (partner: string) =>
    `Only you and ${partner} can access this shared environment.`,
  privateBodySolo: 'Only the two of you can access this shared environment.',

  personalize: 'Personalize Our Space',

  identityTitle: 'Our Identity',
  identityBody: 'Manage names, avatars, and anniversaries',
  preferencesTitle: 'Space Preferences',
  preferencesBody: 'Theme colors, notifications, and privacy',
} as const
