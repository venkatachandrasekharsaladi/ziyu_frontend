/**
 * Copy for M01-S14 First Date Memory. Stitch screen 3b933246.
 *
 * The Stitch markup splits this into a form column and a live-preview column,
 * but that split is `lg:grid-cols-12` — it only applies from 1024px. At phone
 * width the source itself is `grid-cols-1`, so stacking is the design, not a
 * deviation from it.
 */
export const FIRST_DATE_COPY = {
  heading: 'And your first date? ❤️',
  lede: 'The one you still bring up.',
  photoLabel: 'Add a Photo',
  dateLabel: 'Date',
  locationLabel: 'Location',
  locationPlaceholder: 'Where did you go?',
  memoryLabel: 'Memory',
  memoryPlaceholder: 'What do you remember about it?',
  submit: 'Save Memory',
  skip: 'Skip for now',
  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
