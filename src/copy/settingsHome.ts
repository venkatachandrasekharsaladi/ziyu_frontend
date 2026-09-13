import { BRAND } from '@/config/brand'

/**
 * Copy for M05-S01 — the Profile tab, which is the settings list.
 *
 * `heading` and `lede` are carried over verbatim from `copy/ourSpace.ts`: they
 * are the only strings on this screen the design actually drew. Everything
 * else is chosen.
 *
 * Sign-out keeps its confirmation. It is reversible, but getting back in costs
 * an email and a password, which is enough friction that an accidental tap is
 * worth one question.
 */
export const SETTINGS_HOME_COPY = {
  heading: 'Our little world.',
  lede: 'Everything that makes this space yours, together.',

  daysTogether: 'days together',

  accountGroup: 'Account',
  personalDetails: 'Personal Details',
  partner: 'Partner & Pairing',
  ourSpace: 'Our Space',

  privacyGroup: 'Privacy',
  privacy: 'Privacy & Security',
  data: 'Data & Storage',

  preferencesGroup: 'Preferences',
  appearance: 'Appearance',
  accessibility: 'Accessibility',
  notifications: 'Notifications',
  chat: 'Chat',
  memories: 'Memories & Story',
  dates: 'Dates & Reminders',
  homeLayout: 'Home Layout',
  language: 'Language',

  planGroup: 'Plan',
  billing: 'Billing & Subscription',

  supportGroup: 'Support',
  help: 'Help & FAQ',
  feedback: 'Contact & Feedback',

  aboutGroup: 'About',
  about: `About ${BRAND.name}`,
  terms: 'Terms & Conditions',
  privacyPolicy: 'Privacy Policy',
  licenses: 'Licenses',

  signOut: 'Sign Out',
  confirmTitle: 'Sign out?',
  confirmBody: `You will need your email and password to get back into ${BRAND.name}.`,
  confirmKeep: 'Stay signed in',
  confirmSignOut: 'Sign out',

  deleteAccount: 'Delete Account',
  deleteDetail: 'Permanently erase your space.',
} as const
