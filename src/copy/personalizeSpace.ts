import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S20 Personalize Our Space. Stitch screen d7262d77.
 *
 * Stitch holds two passes at this screen — "Personalize Your Space" and
 * "Personalize Our Space" — doing the same job: name the shared space and pick
 * a cover. This follows the richer of the two, which asks for both a display
 * name and a short name and offers the style choice explicitly.
 */
export const PERSONALIZE_SPACE_COPY = {
  heading: 'One last little touch.',
  lede: `Make your ${BRAND.name} feel like yours.`,
  nameLabel: 'Couple display name',
  namePlaceholder: 'e.g. Chandu & Sarah',
  shortNameLabel: 'Our little world (Optional)',
  shortNamePlaceholder: 'e.g. C + S',
  styleLabel: 'Choose a subtle cover style',
  styles: [
    { value: 'dawn' as const, label: 'Dawn' },
    { value: 'dusk' as const, label: 'Dusk' },
    { value: 'night' as const, label: 'Night' },
  ],
  nameRequired: 'Give your space a name',
  submit: 'Continue',
  skip: 'Skip',
  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
