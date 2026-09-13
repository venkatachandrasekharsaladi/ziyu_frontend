/**
 * Copy for Settings → Privacy & Security.
 *
 * "Privacy" in a two-person app does not mean privacy from the public — there
 * is no public. It means the two questions a couple actually has: what this
 * device shows to whoever picks it up, and what your partner can tell about you
 * without asking. Both groups below are one of those.
 */
export const SETTINGS_PRIVACY_COPY = {
  title: 'Privacy & Security',
  lede: 'What this phone shows, and what they can tell.',

  deviceGroup: 'On this device',
  appLock: 'App lock',
  appLockDetail: 'Ask for your passcode or face before opening.',
  hidePreviews: 'Hide message previews',
  hidePreviewsDetail: 'Notifications say a message arrived, not what it said.',

  partnerGroup: 'What they can see',
  onlineStatus: 'Show when I am online',
  onlineStatusDetail: 'They see that you are in the app right now.',
  screenshotAlerts: 'Tell them about screenshots',
  screenshotAlertsDetail: 'They are told when you screenshot your conversation.',

  moreGroup: 'More',
  sessions: 'Security & Sessions',
  sessionsDetail: 'Password, two-factor and signed-in devices.',
  data: 'Data & Storage',
  dataDetail: 'What is stored here, and how to get a copy.',
} as const
