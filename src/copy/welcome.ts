import { BRAND } from '@/config/brand'

/**
 * Copy for M00-S01 Welcome.
 *
 * Screen copy lives here; brand identity lives in `@/config/brand`. The
 * headline IS the tagline — it is only split across two lines because that is
 * how the design typesets it. The assertion below keeps the split honest: if
 * someone edits BRAND.tagline, the app fails loudly in development rather than
 * quietly rendering stale copy.
 */
export const WELCOME_COPY = {
  headlineLines: ['Your relationship.', 'Beautifully kept.'],
  subtitleLines: ['A private digital home for everything', 'that makes you, you.'],
  primaryCta: 'Get Started',
  secondaryText: 'Already have an account?',
  secondaryLink: 'Sign In',
  privacyNote: 'Your space belongs to both of you.',
} as const

if (__DEV__ && WELCOME_COPY.headlineLines.join(' ') !== BRAND.tagline) {
  throw new Error(
    `Welcome headline has drifted from BRAND.tagline.\n` +
      `  headlineLines → "${WELCOME_COPY.headlineLines.join(' ')}"\n` +
      `  BRAND.tagline → "${BRAND.tagline}"`,
  )
}
