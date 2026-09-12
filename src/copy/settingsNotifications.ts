/**
 * Copy for Settings → Notifications.
 *
 * The six categories are the six things this app can actually interrupt someone
 * for, taken from what the app builds: messages and voice notes (Module 03
 * chat), new memories and On This Day (Module 03 memories), occasions (the
 * calendar's reminders and the occasion countdown), and partner activity.
 *
 * Partner activity defaults OFF. Every other category is something the partner
 * deliberately sent; this one is the app narrating someone's presence, and
 * being watched is not a default anyone opts into.
 */
export const SETTINGS_NOTIFICATIONS_COPY = {
  title: 'Notifications',
  lede: 'What reaches you, and when.',

  masterGroup: 'Everything',
  masterLabel: 'Allow notifications',
  masterDetail: 'Turn everything off without losing your choices below.',

  categoryGroup: 'What you hear about',
  messages: 'Messages',
  messagesDetail: 'Anything they write to you.',
  voiceNotes: 'Voice notes',
  voiceNotesDetail: 'When they leave you something to listen to.',
  newMemories: 'New memories',
  newMemoriesDetail: 'When a memory is added to your space.',
  onThisDay: 'On This Day',
  onThisDayDetail: 'A memory from this date in another year.',
  occasions: 'Occasions & anniversaries',
  occasionsDetail: 'Your dates that matter, before they arrive.',
  partnerActivity: 'Partner activity',
  partnerActivityDetail: 'When they open the app or add something quietly.',

  quietGroup: 'Quiet hours',
  quietLabel: 'Pause overnight',
  quietDetail: 'Hold everything until morning.',
  quietFrom: 'From',
  quietTo: 'Until',
  /**
   * HONEST LIMIT: the two times are shown, not set — there is no time picker
   * behind either row, so they report 22:00 and 07:00 and cannot be moved. A
   * settings screen that displays a value a user cannot change has to say so;
   * discovering it by tapping twice and getting nothing is the alternative.
   * Same disclosure rule as `settingsLanguage.ts`.
   */
  quietTimesFixed: 'These two times cannot be changed yet. Quiet hours use them as they are.',

  soundGroup: 'Sound & vibration',
  sound: 'Sound',
  vibration: 'Vibration',
} as const
