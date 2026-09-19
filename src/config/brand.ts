/**
 * BRAND — the single source of truth for the product's identity.
 *
 * RULE: the product name is written here and ONLY here.
 * Never type "Tales of Two" directly into a screen, button, alert, or message.
 * Every surface reads from this file.
 *
 * The name was provisional ("LoveOS") until the domain was bought on
 * 2026-09-14. Because of this rule, that rename was a change to these few
 * lines rather than a hunt through hundreds of files.
 */
export const BRAND = {
  /** Display name shown to users. */
  name: 'Tales of Two',

  /**
   * Short descriptor for the product.
   *
   * Rendered as the headline on M00-S01 Welcome, where the design typesets it
   * across two lines — see `@/copy/welcome`, which asserts the two stay in sync.
   */
  tagline: 'Your relationship. Beautifully kept.',

  /**
   * The product's home on the web. Lowercase — hostnames are case-insensitive
   * and the marketing material styles it "TalesofTwo.world".
   */
  domain: 'talesoftwo.world',

  /**
   * Reverse-DNS app identifier used by the app stores. Derived from the
   * domain, so `talesoftwo.world` → `world.talesoftwo.app`.
   * WARNING: this can NEVER be changed once published. Nothing has shipped
   * yet, so this was safe to rename — confirm it once more before the first
   * store submission. Must stay in step with `app.json`.
   */
  bundleId: 'world.talesoftwo.app',
} as const

export type Brand = typeof BRAND
