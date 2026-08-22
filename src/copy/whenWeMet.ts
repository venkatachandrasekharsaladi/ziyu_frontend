import type { DatePrecision } from '@/services/story/types'

/**
 * Copy for M01-S13 When We Met. Stitch screen c9591260.
 *
 * The design draws a full calendar. This uses `DateField` instead — the app's
 * one date control, already built and tested — because a date years in the past
 * is typed far faster than it is scrolled to, which is the same reason
 * `DateField` exists at all.
 */
export const WHEN_WE_MET_COPY = {
  heading: 'When did your story begin?',
  lede: 'The day everything started. Give us as much as you remember.',
  precisionLabel: 'How well do you remember it?',
  precisions: [
    { value: 'exact' as DatePrecision, label: 'Exact date' },
    { value: 'monthYear' as DatePrecision, label: 'Month + Year' },
    { value: 'yearOnly' as DatePrecision, label: 'Year only' },
  ],
  dateLabel: 'The day we met',
  monthLabel: 'Month and year we met',
  yearLabel: 'Year we met',
  yearPlaceholder: 'yyyy',
  dateRequired: 'Add the date you met',
  yearInvalid: 'Enter a real year',
  submit: 'Continue',
  skip: 'Skip for now',
} as const
