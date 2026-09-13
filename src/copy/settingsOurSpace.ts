/**
 * Copy for Settings → Our Space.
 *
 * The settings counterpart to `PersonalizeSpaceScreen` in onboarding: the same
 * three answers, asked again later. The labels match that screen's so the two
 * read as the same question, not two similar ones.
 */
export const SETTINGS_OUR_SPACE_COPY = {
  title: 'Our Space',
  lede: 'What you called the thing you share.',

  nameGroup: 'Name',
  nameLabel: 'Space name',
  namePlaceholder: 'Our little world',
  nameRequired: 'Give your space a name.',
  shortNameLabel: 'Short name',
  shortNamePlaceholder: 'Used where there is less room',

  coverGroup: 'Cover',
  coverLabel: 'Cover style',
  dawn: 'Dawn',
  dusk: 'Dusk',
  night: 'Night',

  save: 'Save changes',
  saved: 'Your space was updated.',
} as const
