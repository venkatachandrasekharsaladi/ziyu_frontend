import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S05 Invitation Sent. Figma 522:655.
 *
 * Cancelling confirms first: the partner may already be holding the code, so
 * destroying it silently would strand them (spec §10).
 */
export const INVITATION_SENT_COPY = {
  heading: 'Your invitation is on its way ❤️',
  lede: 'They can enter this code any time. It stays valid until you cancel it.',
  codeLabel: 'YOUR UNIQUE CODE',
  shareAgain: 'Share Again',
  copy: 'Copy Code',
  cancel: 'Cancel Invitation',
  shareMessage: (code: string) => `Join me on ${BRAND.name}. My code is ${code}.`,

  confirmTitle: 'Cancel this invitation?',
  confirmBody: 'Your partner may already have this code. Cancelling makes it stop working.',
  confirmKeep: 'Keep it',
  confirmDestroy: 'Cancel invitation',

  errors: {
    CODE_INVALID: 'Something went wrong. Try again.',
    CODE_EXPIRED: 'Something went wrong. Try again.',
    CANNOT_PAIR_WITH_SELF: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
