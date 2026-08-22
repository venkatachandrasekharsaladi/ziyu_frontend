/**
 * Copy for M03-S07 — On this day. Figma `Ziyu`, Memories Page frame 4
 * (node 3362:1978).
 *
 * The frame is a year-by-year rail: one marker per year with a relative chip
 * ("1 YEAR AGO"), then that year's memories for the same calendar day. The chip
 * is computed against the current year rather than copied from the design, so it
 * stays true as years pass.
 */
export const ON_THIS_DAY_COPY = {
  title: 'On this day',
  eyebrow: 'Chandu & Sarah',
  add: 'Add a memory for today',
  menu: 'Open menu',
  /** `2023` seen in 2026 -> "3 years ago". */
  yearsAgo: (years: number) =>
    years <= 0 ? 'This year' : years === 1 ? '1 year ago' : `${years} years ago`,
  empty: {
    heading: 'Nothing on this day yet.',
    lede: 'When you have a memory from today in another year, it will surface here.',
  },
  back: 'Back to memories',
} as const
