/**
 * Copy for the compatibility card on Home and the screen it opens.
 *
 * SAMPLE-ONLY. Compatibility needs both birthdays, and the app only ever has
 * one — the partner's is never collected today. Rather than invent one on a
 * real couple's account, the card stays behind `USE_SAMPLE_CONTENT`, same as
 * the spotlight and pulse cards. See `CompatibilityCard`.
 *
 * ONLY POSITIVE FACTS. This is meant to be a little delight on the way to
 * somewhere else in the app, not a verdict on the relationship — so the copy
 * and the traits it pairs with a sign are all flattering, by design, never
 * a "these two clash" line.
 */
export const COMPATIBILITY_COPY = {
  eyebrow: 'Just for fun',
  heading: 'Your stars, together',
  cardCta: 'See your compatibility',

  born: (date: string) => `Born ${date}`,
  factsHeading: 'What your signs say',
  togetherHeading: 'Together',
  detailsHeading: 'Other details',
  back: 'Back home',
} as const
