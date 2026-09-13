import { BRAND } from '@/config/brand'

/**
 * Copy for Settings → About.
 *
 * The product name comes from `BRAND` and only from `BRAND` — the rule that
 * file sets, so renaming the product stays a change to a few lines.
 */
export const SETTINGS_ABOUT_COPY = {
  title: `About ${BRAND.name}`,
  lede: BRAND.tagline,

  appGroup: 'This app',
  version: 'Version',
  build: 'Build',
  madeFor: 'Made for two',
  madeForDetail: 'No feed, no followers, no audience. Just the two of you.',

  legalGroup: 'Legal',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  licenses: 'Licenses',
} as const
