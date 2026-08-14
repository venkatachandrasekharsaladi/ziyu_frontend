/**
 * Copy for M01-S02 Create Your Profile. Figma 522:598.
 *
 * Nickname and pronouns are carried across from the earlier frame `522:349`,
 * which the later pass silently dropped (D31). For an app about how two people
 * refer to each other, pronouns are meaningful, and both are optional fields on
 * a form being built anyway — adding them later means migrating stored profiles.
 */
export const CREATE_PROFILE_COPY = {
  heading: 'Tell us about you.',
  lede: 'This is how your partner will see you.',

  photoLabel: 'Add Photo',

  nameLabel: 'YOUR NAME',
  namePlaceholder: 'Your name',
  nameRequired: 'Enter your name',

  /** D31 — carried from 522:349. */
  nicknameLabel: 'How should your partner see you?',
  nicknamePlaceholder: 'Nickname, pet name…',

  birthdayLabel: 'Birthday',
  birthdayInvalid: 'Enter a real date',

  /** D31 — carried from 522:349. */
  pronounsLabel: 'PRONOUNS',
  pronounsPlaceholder: 'E.g. they/them',

  submit: 'Continue',

  errors: {
    CODE_INVALID: 'Something went wrong. Try again.',
    CODE_EXPIRED: 'Something went wrong. Try again.',
    CANNOT_PAIR_WITH_SELF: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
