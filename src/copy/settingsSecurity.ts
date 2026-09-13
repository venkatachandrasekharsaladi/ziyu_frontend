/**
 * Copy for Settings → Security & Sessions.
 *
 * The device list names a city, never anything finer. A settings screen that
 * prints a street for a signed-in session is a stalking tool the day one of
 * these two people wants to leave the other.
 */
export const SETTINGS_SECURITY_COPY = {
  title: 'Security & Sessions',
  lede: 'How you get in, and what is already signed in.',

  credentialsGroup: 'Signing in',
  changePassword: 'Change password',
  changePasswordDetail: 'You will need your current one.',
  twoFactor: 'Two-factor authentication',
  twoFactorDetail: 'A code from your phone as well as your password.',

  sessionsGroup: 'Signed in',
  thisDevice: 'This device',
  lastActivePrefix: 'Last active',

  dangerGroup: 'Everywhere else',
  signOutAll: 'Sign out everywhere else',
  signOutAllDetail: 'Ends every session except this one.',
  signOutAllTitle: 'Sign out of other devices?',
  signOutAllBody:
    'Every other phone, tablet and browser signed into your account is signed out. This device stays signed in.',
  signOutAllCancel: 'Leave them',
  signOutAllConfirm: 'Sign them out',
  signedOutAll: 'Your other devices were signed out.',
} as const
