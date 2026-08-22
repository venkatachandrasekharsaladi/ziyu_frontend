/**
 * UI-ONLY SAMPLE CONTENT — Figma `Ziyu`, the three Home Dashboard variants.
 *
 * Every value here is drawn in the design: "1,395 beautiful days together",
 * the 8 trips / 42 places tiles, Sarah's birthday six days out, the anniversary
 * reminder. The screen prefers the real store whenever it holds a value and
 * falls back to these only where it is empty, so this file stops being visible
 * the moment a couple enters anything real.
 */
export const SAMPLE_HOME = {
  /** Header line: the couple, as the design's top bar shows them. */
  coupleName: 'Chandu & Sarah',
  greetingName: 'Chandu & Sarah',
  daysTogether: 1395,

  /** "Your little world" — the three stat tiles. */
  stats: [
    { key: 'together', icon: 'heart', value: '1,395', label: 'Together', unit: 'days' },
    { key: 'trips', icon: 'map', value: '8', label: 'Trips', unit: '' },
    { key: 'places', icon: 'map-pin', value: '42', label: 'Places', unit: '' },
  ],

  /** "Coming up" — countdown rows. */
  comingUp: [
    { key: 'anniversary', label: 'Our Anniversary', detail: 'Oct 14', days: 18 },
    { key: 'partnerBirthday', label: "Sarah's Birthday", detail: 'Oct 20', days: 6 },
  ],

  /** The birthday spotlight card from the second dashboard variant. */
  spotlight: {
    eyebrow: 'Upcoming special event',
    heading: "Sarah's birthday is in 6 days 🎂",
    lede: "Let's make her day special.",
    primary: 'Plan a Surprise',
    secondary: 'Create Birthday Card',
    photoUri: 'https://picsum.photos/seed/loveos-birthday-girl/800/900',
    photoCaption: 'Birthday Girl 🎀',
  },

  /** "Relationship pulse". */
  pulse: {
    label: 'Relationship pulse',
    value: '1,432',
    unit: 'days',
    caption: 'since we first met.',
  },

  /** "Little things" — the pinned reminders row. */
  littleThings: [{ key: 'dinner', text: 'Remember to book our anniversary dinner.' }],

  /** "Upcoming" list from the third variant. */
  upcomingEvents: [
    { key: 'movie', icon: 'film', label: 'Movie Night', detail: 'Friday, 8 PM' },
    { key: 'dinner', icon: 'coffee', label: "Dinner at Luigi's", detail: 'Sunday, 7 PM' },
  ],
} as const
