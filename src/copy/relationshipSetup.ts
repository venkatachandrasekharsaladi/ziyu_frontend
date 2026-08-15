import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S01 Relationship Setup. Figma 522:302.
 *
 * The lede interpolates `BRAND.name` rather than typing the product name: the
 * name is still provisional, and this is the rule that keeps a rename to one
 * file.
 */
export const RELATIONSHIP_SETUP_COPY = {
  heading: "Now let's create your space together.",
  lede: `${BRAND.name} becomes something special when you share it with your person.`,
  invite: 'Invite My Partner',
  haveCode: 'I Have a Partner Code',
  /** Drawn as `#7A7583`; normalised to `text.body` per spec §5. */
  later: 'Do this later',
} as const
