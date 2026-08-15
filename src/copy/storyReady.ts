import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S19 Your Story Is Ready. Stitch screen f97fc75c.
 *
 * A checklist of what was captured. Each row states plainly whether it was
 * added or skipped: a tick beside something the user never filled in would be
 * a lie, and skipping was always allowed.
 */
export const STORY_READY_COPY = {
  heading: 'Your story is ready.',
  lede: `${BRAND.name} is ready to keep it with you.`,
  since: (date: string) => `Together since ${date}`,
  rows: {
    met: 'First met',
    firstDate: 'First date',
    becameUs: 'Became us',
    keyDates: 'Birthdays added',
    firstMemory: 'First memory',
  },
  added: 'Added',
  skipped: 'Skipped',
  submit: 'Welcome Home',
} as const
