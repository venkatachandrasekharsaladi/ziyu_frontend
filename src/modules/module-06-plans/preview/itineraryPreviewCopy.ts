/**
 * Copy for the ALTERNATE itinerary design — Figma `Tales of Two` /
 * `New Features` / 3482:965 ("Our Paris Adventure").
 *
 * Deliberately NOT in `src/copy/`. See `README.md` beside this file: the whole
 * point of this folder is that the design can be deleted in one move.
 *
 * This frame writes its moments differently from the shipped one (3482:15) —
 * Café Saint-Régis rather than Le Chien qui Fume, a "Tales Prompt" pinned
 * inside the second moment, extras that each carry their own instruction. Those
 * differences are the reason it is worth showing to someone at all, so they are
 * reproduced rather than pointed at the other screen's strings.
 */
export const PREVIEW_COPY = {
  eyebrow: 'Plan Something Together',
  headerTitle: 'Our Paris Adventure',

  badge: 'Private itinerary',
  title: 'Our Paris Adventure',
  dateRange: '14 – 17 Oct 2026',
  couple: (names: string) => names,

  duration: 'Duration',
  durationValue: (days: number, people: number) =>
    `${days} days · ${people} ${people === 1 ? 'person' : 'people'}`,
  budget: 'Estimated budget',
  budgetValue: (total: string, perDay: string) => `${total} (${perDay}/day)`,

  planned: (done: number, total: number) => `${done} of ${total} moments planned`,
  serendipity: 'Room for serendipity, spontaneous detours & getting lost together.',

  selectDay: 'Select day',
  dayOf: (day: number, total: number) => `Thu, 15 Oct · Day ${day} of ${total}`,
  dayChip: (n: number) => `Day ${String(n).padStart(2, '0')}`,
  plannedBadge: (n: number) => `${n} planned`,

  dayTitle: 'Day 1: "First steps together"',
  daySubtitle: 'Montmartre slopes, warm croissants and pink dusk skies',

  /** The pinned suggestion inside the second moment. */
  promptLabel: 'Tales prompt',

  saved: 'Saved to Plans',
  save: 'Save',
  replace: 'Replace',
  addNote: 'Add note',

  ideaLabel: 'One little idea',
  ideaQuote: 'Leave some room for getting wonderfully lost.',
  ideaBody:
    'The best memories are often the accidental bistros you stumble into when it begins to drizzle.',

  extrasLabel: 'Add a little something',
  extrasLede: 'Turn the journey into chapters of your shared story',
  viewAll: 'View all',

  regenerate: (day: number) => `Regenerate Day ${day}`,
  adjustBudget: 'Adjust budget',
  changeVibe: 'Change vibe',

  primary: 'Save itinerary to Our Plans',
  footnote: 'Once saved, each moment will automatically sync with your shared timeline.',
  savedConfirmation: 'Saved to Our Plans.',

  /** Marks the screen as a design under consideration, not a shipped one. */
  previewBadge: 'Alternate design',
} as const

/** The three moments this frame draws, in its own words. */
export const PREVIEW_MOMENTS = [
  {
    id: 'pv-1',
    index: 1,
    time: '09:30 AM',
    slot: 'Morning café',
    cost: '~£18',
    title: 'Breakfast at Café Saint-Régis',
    description:
      'Corner table on Île Saint-Louis. Fresh almond croissants, double espresso, and quiet people-watching across the bridge.',
    photoKey: 'cafeInterior',
    photoCaption: 'Intimate corner table',
    prompt: null,
    saved: true,
  },
  {
    id: 'pv-2',
    index: 2,
    time: '02:00 PM',
    slot: 'Romantic walk',
    cost: 'Free',
    title: 'Wander the Hidden Stairs of Montmartre',
    description:
      "Slip behind Sacré-Cœur tourists to Rue de l'Abreuvoir and Place Dalida. Hold hands on the cobblestones and stop for a portrait by the pink house.",
    photoKey: null,
    photoCaption: null,
    prompt: "Take one candid film photo here that we don't look at until we get home.",
    saved: false,
  },
  {
    id: 'pv-3',
    index: 3,
    time: '06:45 PM',
    slot: 'Sunset picnic',
    cost: '~£32',
    title: 'Sunset Wine & Comté along the Seine',
    description:
      'Pick up aged cheese, sourdough baguette & Pinot Noir. Sit at Square du Vert-Galant as the bateaux-mouches glide past and the street lanterns turn gold.',
    photoKey: 'embraceSunset',
    photoCaption: 'Golden hour illumination',
    prompt: null,
    saved: false,
  },
] as const

/** The 2×2 "add a little something" grid, each with its own instruction. */
export const PREVIEW_EXTRAS = [
  {
    key: 'surprise',
    icon: 'gift',
    title: 'Surprise date',
    body: 'Keep the destination hidden from them until arrival.',
    action: 'Add to Day 1',
  },
  {
    key: 'photo',
    icon: 'camera',
    title: 'Photo moment',
    body: 'Golden hour reminder at Pont Alexandre III.',
    action: 'Pin time',
  },
  {
    key: 'letter',
    icon: 'mail',
    title: 'Letter to open later',
    body: 'Send a note to be read on our final Parisian night.',
    action: 'Write letter',
  },
  {
    key: 'challenge',
    icon: 'award',
    title: 'Couple challenge',
    body: 'Order only in French using hand gestures & laughter.',
    action: 'Accept',
  },
] as const

/** The day pills this frame draws, with its own day names. */
export const PREVIEW_DAYS = [
  { number: 1, title: 'First steps' },
  { number: 2, title: 'Old quarters' },
  { number: 3, title: 'Hidden park' },
  { number: 4, title: 'Until next time' },
] as const
