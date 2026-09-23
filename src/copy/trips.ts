/**
 * Copy for M06-S02 Plan Something Together (Figma 3482:374) and M06-S03 the
 * itinerary it produces (3482:15).
 *
 * Two screens, one file, because they are one flow: the setup screen's words
 * only make sense as the question the itinerary answers, and every label on the
 * itinerary header is a value the setup screen collected.
 */
export const TRIP_SETUP_COPY = {
  eyebrow: 'Tales of Two · Together',
  title: 'Where should we go next?',
  lede: "Let's turn a little time together into a memory.",

  /** The two mode cards at the top. Only "Plan a Trip" is built. */
  modes: {
    date: { title: 'Plan a Date', lede: 'An evening, an afternoon, a small excuse to go out.' },
    trip: { title: 'Plan a Trip', lede: 'A few days somewhere neither of you has to cook.' },
  },
  nextChapter: 'Next chapter',
  nextChapterFor: (names: string) => `${names}'s getaway`,

  destination: {
    label: 'Where are you thinking?',
    hint: 'Dream spot',
    placeholder: 'Paris, France',
    /** The two suggestion chips under the field. */
    suggestion: 'Paris · Romance capital',
    surprise: 'Surprise us',
  },

  nights: {
    label: 'How many days?',
    hint: 'A long weekend escape',
    unit: (n: number) => (n === 1 ? '1 day' : `${n} days`),
    decrease: 'One day fewer',
    increase: 'One day more',
  },

  budget: {
    label: 'Trip Budget (shared)',
    hint: 'Per person',
    flexible: 'Flexible',
  },

  style: {
    label: 'Travel Style',
    hint: 'Select favourites',
    options: {
      relaxing: 'Relaxing',
      adventure: 'Adventure',
      romantic: 'Romantic',
      foodie: 'Foodie',
      culture: 'Culture',
      nature: 'Nature',
      surprise: 'Surprise us',
    },
  },

  submit: 'Create our plan',
  footer: 'Powered by Tales of Two · Tailored for the two of you',

  /** Shown when the destination field is empty and the user presses Create. */
  destinationRequired: 'Tell us where first.',
} as const

export const TRIP_ITINERARY_COPY = {
  eyebrow: 'Tales of Two',
  handcrafted: 'Handcrafted itinerary',
  heroTitle: (nights: number, place: string) => `${nights} days in ${place.split(',')[0]}`,
  craftedFor: (names: string) => `Crafted for ${names}`,

  budget: (currency: string, spend: number, band: string) =>
    `Est. Budget: ${currency}${spend} / ${band}`,
  travellers: (nights: number, people: number) =>
    `${nights} days · ${people} ${people === 1 ? 'person' : 'people'}`,

  momentsPlanned: (planned: number, total: number) => `${planned} of ${total} moments planned`,
  momentsSet: (percent: number) => `${percent}% set`,
  roomForSerendipity:
    'Plenty of room for spontaneous discoveries and getting lost in alleyways.',

  selectDay: 'Select day',
  dayChip: (n: number) => `Day ${String(n).padStart(2, '0')}`,
  dayHeading: (n: number, title: string) => `Day ${String(n).padStart(2, '0')} · ${title}`,
  dayEmpty: {
    heading: 'Nothing planned for this day yet',
    lede: 'Some of the best ones stay empty. Add a moment whenever you feel like it.',
    action: 'Add a moment',
  },

  save: 'Save',
  saved: 'Saved to Plans',
  replace: 'Replace',

  extrasLabel: 'Add a little something',
  extrasLede: 'Make this trip part of your forever story',

  primary: 'Save to Our Plans',
  share: (name: string) => `Share with ${name}`,

  regenerate: 'Regenerate',
  adjustBudget: 'Adjust budget',
  changeVibe: 'Change vibe',

  /** Confirmation after the primary action. Nothing leaves the device. */
  savedConfirmation: 'Saved. Every moment syncs with your shared timeline.',
} as const
