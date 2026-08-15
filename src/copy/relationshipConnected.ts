import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S08 Relationship Connected. Figma 522:802 (canonical; 522:506 is
 * the earlier pass).
 *
 * M01-S10 Relationship Confirmation was retired as a duplicate of this screen
 * (D30) — the two read almost identically and Figma only ever drew one.
 */
export const RELATIONSHIP_CONNECTED_COPY = {
  heading: `You're officially a ${BRAND.name} couple ❤️`,
  lede: 'Your space is ready. Everything you keep here belongs to both of you.',
  confirm: 'Continue',
} as const
