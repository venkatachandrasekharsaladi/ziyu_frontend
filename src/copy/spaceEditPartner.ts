/**
 * Copy for Space → Edit Partner Details. Figma `3430:1040`.
 *
 * The mirror of `spaceEditProfile.ts`: the same questions, asked about the
 * other person. The labels differ on purpose — "About your person" rather than
 * "A little about you" — because the two screens look almost identical and the
 * heading is the only thing that tells you whose details you are about to
 * change.
 */
export const SPACE_EDIT_PARTNER_COPY = {
  barTitle: 'Edit Partner',
  title: 'About your person.',
  lede: 'Update their details to keep your shared space feeling just right.',

  photo: 'Change their photo',

  nameLabel: 'NAME',
  namePlaceholder: 'Their name',
  nameRequired: 'Tell us what to call them.',

  nicknameLabel: 'NICKNAME (OPTIONAL)',
  nicknamePlaceholder: 'What you call them',
  nicknameHint: "We'll use this in cozy spots around the app.",

  birthdayLabel: 'BIRTHDAY',
  pronounsLabel: 'PRONOUNS',
  pronounsPlaceholder: 'They / Them',

  save: 'Save Changes',
  saved: 'Their details were updated.',

  /**
   * The frame assumes a partner exists. Reaching this screen before anyone has
   * joined is possible from Our Identity, so it says so rather than offering a
   * form that would write a partner record out of nothing.
   */
  noPartnerTitle: 'Nobody to edit yet.',
  noPartnerBody: 'Once your invite is accepted, their details live here.',
  invite: 'Invite your partner',
} as const
