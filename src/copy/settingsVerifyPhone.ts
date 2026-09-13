/**
 * Copy for Settings → Verify Phone.
 *
 * The number is shown back in full rather than masked. Masking protects a
 * secret from someone reading over a shoulder; this is the user's own number,
 * which they just typed, and the whole question on this screen is "is this the
 * right number" — which a masked number cannot answer.
 *
 * The screen also ASKS for a number when there is none on file. It used to
 * send you to Personal Details instead, which is a detour through a six-field
 * form to type the one field this screen is about; the route there is still
 * offered, because that is where a number already saved gets corrected.
 */
export const SETTINGS_VERIFY_PHONE_COPY = {
  title: 'Verify your number',
  lede: 'We sent you a six-digit code.',

  codeLabel: 'Code',
  sentToPrefix: 'Sent to',

  numberHeading: 'Your number',
  numberLede: 'Add the number you want to verify. Include the country code.',
  numberLabel: 'Phone number',
  numberPlaceholder: '+91 98765 43210',
  numberRequired: 'Enter a phone number.',
  numberInvalid: 'Enter a phone number with its country code, like +91 98765 43210.',
  sendCode: 'Send me a code',
  noNumber: 'There is no phone number on your profile yet.',
  goToDetails: 'Personal Details',

  submit: 'Verify',
  resend: 'Send it again',
  resendIn: 'You can ask again in',
  wrongCode: 'That code did not match. Check it and try again.',
  verified: 'Your number is verified.',
} as const
