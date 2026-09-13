/**
 * Copy for Settings → Verify Phone.
 *
 * The number is shown back in full rather than masked. Masking protects a
 * secret from someone reading over a shoulder; this is the user's own number,
 * which they just typed, and the whole question on this screen is "is this the
 * right number" — which a masked number cannot answer.
 */
export const SETTINGS_VERIFY_PHONE_COPY = {
  title: 'Verify your number',
  lede: 'We sent you a six-digit code.',

  codeLabel: 'Code',
  sentToPrefix: 'Sent to',
  noNumber: 'Add a phone number on Personal Details first.',
  goToDetails: 'Personal Details',

  submit: 'Verify',
  resend: 'Send it again',
  resendIn: 'You can ask again in',
  wrongCode: 'That code did not match. Check it and try again.',
  verified: 'Your number is verified.',
} as const
