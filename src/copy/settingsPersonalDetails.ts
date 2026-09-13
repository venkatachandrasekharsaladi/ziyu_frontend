/**
 * Copy for Settings → Personal Details.
 *
 * The fields mirror `CreateProfileScreen`'s, because they are the same fields —
 * this is where you change what you told the app during onboarding. The labels
 * are kept identical on purpose: a field called "Nickname" in onboarding and
 * "Preferred name" here would read as two different things.
 *
 * The phone number is the ONE field onboarding never asks for. Its helper says
 * what it is for, because being asked for a phone number by an app that never
 * wanted one before deserves a reason.
 */
export const SETTINGS_PERSONAL_DETAILS_COPY = {
  title: 'Personal Details',
  lede: 'How you appear in your space.',

  photoLabel: 'Your photo',

  aboutGroup: 'About you',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  nameRequired: 'Your name is needed.',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: 'What they call you',
  birthdayLabel: 'Birthday',
  pronounsLabel: 'Pronouns',
  pronounsPlaceholder: 'they/them',

  contactGroup: 'Contact',
  emailLabel: 'Email',
  emailLocked: 'Your email is how you sign in. Changing it is under Security.',
  phoneLabel: 'Phone number',
  phonePlaceholder: '+91 98765 43210',
  phoneInvalid: 'Enter a phone number with its country code, like +91 98765 43210.',
  phoneHelp: 'Used to confirm it is you before anything irreversible.',
  phoneVerified: 'Verified',
  phoneUnverified: 'Not verified',
  verifyAction: 'Verify',

  save: 'Save changes',
  saved: 'Your details were saved.',
} as const
