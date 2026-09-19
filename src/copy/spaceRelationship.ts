/**
 * Copy for Space → Relationship Details. Figma `3430:1187`.
 *
 * The frame is drawn with one couple's answers — a cafe called The Little Owl,
 * a trip to Kyoto, 1,842 days. None of that is here. Every card reads
 * `storyStore`, and each one falls back to its own empty line when the moment
 * behind it was never recorded.
 */
export const SPACE_RELATIONSHIP_COPY = {
  title: 'Your story, in a few details.',
  lede: "These little anchors map out your journey together. Keep them updated to see how far you've come.",

  togetherSince: 'Together Since',
  daysOfUs: (days: number) => `${days.toLocaleString()} DAYS OF US`,
  togetherSinceEmpty: 'Not recorded yet',

  firstDate: 'First Date',
  firstTrip: 'First Trip',
  nextMilestone: 'Next Milestone',

  /** Shown inside a card whose moment has no place or note yet. */
  momentEmpty: 'Nothing written down yet.',
  milestoneEmpty: 'Add a future milestone to look forward to.',

  /** The pencil on each card. Folded with the card's name so it is not "Edit, Edit, Edit". */
  edit: (what: string) => `Edit ${what}`,
} as const
