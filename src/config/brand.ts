/**
 * BRAND — the single source of truth for the product's identity.
 *
 * RULE: the product name is written here and ONLY here.
 * Never type "LoveOS" directly into a screen, button, alert, or message.
 * Every surface reads from this file.
 *
 * The name is still provisional (see SCOPE.md, open decision #1). Because of
 * this rule, renaming the product is a change to these few lines rather than
 * a hunt through hundreds of files.
 */
export const BRAND = {
  /** Display name shown to users. */
  name: 'LoveOS',

  /** Short descriptor used under the name on the welcome screen. */
  tagline: 'your relationship, beautifully organised',

  /**
   * Reverse-DNS app identifier used by the app stores.
   * WARNING: this can NEVER be changed once published. Confirm before the
   * first store submission.
   */
  bundleId: 'com.loveos.app',
} as const

export type Brand = typeof BRAND
