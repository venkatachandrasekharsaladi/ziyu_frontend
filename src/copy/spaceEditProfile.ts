/**
 * Copy for Space → Edit My Profile. Figma `3430:2146` "(Refined)" and
 * `3430:1113` "(Module 05)".
 *
 * FOUR FIELDS, not the six `settingsPersonalDetails.ts` asks for. The board's
 * frame drops email and phone, and that is the right cut for this entrance:
 * this screen is reached from Our Identity and is about how you APPEAR to your
 * partner. Email is a sign-in credential and phone is a verification channel;
 * both still live on Settings → Personal Details, which is where changing them
 * belongs.
 *
 * Both screens write the same `relationshipStore.profile`, so the four fields
 * here are the same four values that one edits — never a second copy.
 */
export const SPACE_EDIT_PROFILE_COPY = {
  barTitle: 'Edit Profile',
  title: 'A little about you.',
  lede: 'How you appear in your shared world.',

  photo: 'Change photo',

  nameLabel: 'FULL NAME',
  namePlaceholder: 'Your name',
  nameRequired: 'Tell us what to call you.',

  nicknameLabel: 'NICKNAME',
  nicknamePlaceholder: 'What they call you',

  pronounsLabel: 'PRONOUNS',
  pronounsPlaceholder: 'They/Them',

  birthdayLabel: 'BIRTHDAY',

  save: 'Save Changes',
  saved: 'Your profile was updated.',
} as const
