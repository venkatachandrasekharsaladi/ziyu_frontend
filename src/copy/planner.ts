/**
 * Copy for M06-S13 — the screen that builds the plan.
 *
 * THE STAGE LINES ARE THE HONEST PART OF THIS SCREEN. The couple is watching a
 * wait and being told it is worth it, so every line here has to describe
 * something the planner genuinely does (see `services/planner/mock.ts`): it
 * reads the vibes, it goes through the catalogue, it keeps a day walkable, it
 * drops what the daily budget cannot carry, it orders what is left.
 *
 * Nothing here says "AI is thinking" or "consulting 10,000 travellers". When
 * the real planner lands and genuinely does more, these lines get to say more —
 * and not before.
 */
export const PLANNER_COPY = {
  eyebrow: 'Building your plan',
  title: 'Give us a moment.',
  lede: (place: string) => `Putting together ${place} for the two of you.`,

  stages: {
    reading: 'Reading what the two of you like',
    searching: 'Going through places worth your time',
    routing: 'Keeping each day walkable',
    budgeting: 'Balancing it against your budget',
    writing: 'Writing it out in order',
  },

  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,

  /** Shown under the stages — sets expectations honestly. */
  footnote: 'We leave gaps on purpose. The best bits are usually the ones you find.',

  cancel: 'Cancel',

  errors: {
    DESTINATION_UNKNOWN: {
      heading: "We don't know that one yet.",
      lede: (place: string) =>
        `We couldn't place "${place}". Try one of the spots below, or pick "Surprise us".`,
      action: 'Change destination',
    },
    NO_PLAN_FOUND: {
      heading: 'That budget is a bit tight.',
      lede: 'Nothing survived the daily ceiling. Try a higher band or fewer days.',
      action: 'Adjust the plan',
    },
    NETWORK: {
      heading: 'Could not reach the planner.',
      lede: 'Check your connection and try again.',
      action: 'Try again',
    },
    UNKNOWN: {
      heading: 'Something went wrong.',
      lede: 'That one is on us. Try again in a moment.',
      action: 'Try again',
    },
  },

  /** The "we can plan these" list on the error and setup screens. */
  weKnow: 'We can plan these right now',

  done: 'Your plan is ready',
} as const
