/**
 * Long-form legal content.
 *
 * NOT in `src/copy/`. Copy files hold interface text — labels, errors, the
 * words on a button. This is document content: it is replaced wholesale by a
 * lawyer, it is versioned by date, and it has no business sitting next to a
 * button label.
 *
 * EVERYTHING HERE IS PLACEHOLDER, and `isPlaceholder` is what makes that
 * visible in the app rather than only in this comment. `LegalDocument` renders
 * a banner from that flag, so a real document arrives by replacing the prose
 * and setting the flag false — and nobody can ship invented terms by
 * forgetting to remove a note.
 */
export type LegalSection = {
  heading: string
  body: string
}

export type LegalDocumentData = {
  title: string
  updated: string
  isPlaceholder: boolean
  sections: LegalSection[]
}

export const LEGAL_TERMS: LegalDocumentData = {
  title: 'Terms & Conditions',
  updated: '2026-09-12',
  isPlaceholder: true,
  sections: [
    {
      heading: 'What this app is',
      body: 'A private space for two people to keep their shared record — messages, photographs, voice notes and the dates that matter to them. It is not a social network, and there is no audience.',
    },
    {
      heading: 'Your account',
      body: 'You are responsible for keeping your sign-in details to yourself. A space is shared between exactly two paired accounts, and either person can end that pairing.',
    },
    {
      heading: 'What you put here',
      body: 'What you create stays yours. You give us only what is needed to store it and show it back to the two of you.',
    },
    {
      heading: 'Ending it',
      body: 'You can delete your account at any time from Settings. What that removes is described on that screen before you confirm.',
    },
  ],
}

export const LEGAL_PRIVACY: LegalDocumentData = {
  title: 'Privacy Policy',
  updated: '2026-09-12',
  isPlaceholder: true,
  sections: [
    {
      heading: 'What is collected',
      body: 'What you type, record and upload, plus what is needed to sign you in. Nothing is collected to build a profile of you for anyone else.',
    },
    {
      heading: 'Who can see it',
      body: 'You and the person you paired with. There is no public profile, no feed, and no way for anyone outside your pair to find your space.',
    },
    {
      heading: 'Where it lives',
      body: 'On your device, and — once a server exists — on that server so it survives a lost phone. This build has no server, so today it lives only on your device.',
    },
    {
      heading: 'Getting a copy, and getting rid of it',
      body: 'Settings → Data & Storage offers a copy of everything. Settings → Delete Account removes it.',
    },
  ],
}

export type License = {
  name: string
  version: string
  license: string
}

/**
 * The runtime dependencies this app actually ships, from `package.json`.
 *
 * Hand-written rather than generated at build time: generating it needs a build
 * step this project does not have, and a stale list is a smaller problem than a
 * new toolchain. Regenerate by reading `package.json` when dependencies change.
 */
export const LICENSES: License[] = [
  { name: 'react', version: '19.2.3', license: 'MIT' },
  { name: 'react-native', version: '0.86.2', license: 'MIT' },
  { name: 'expo', version: '57.0.12', license: 'MIT' },
  { name: 'expo-router', version: '57.0.12', license: 'MIT' },
  { name: 'react-native-unistyles', version: '3.3.0', license: 'MIT' },
  { name: 'react-native-reanimated', version: '4.5.1', license: 'MIT' },
  { name: 'react-native-gesture-handler', version: '2.32.0', license: 'MIT' },
  { name: 'react-native-safe-area-context', version: '5.7.0', license: 'MIT' },
  { name: 'react-native-screens', version: '4.26.0', license: 'MIT' },
  { name: '@tanstack/react-query', version: '5.101.4', license: 'MIT' },
  { name: 'react-hook-form', version: '7.85.0', license: 'MIT' },
  { name: 'zod', version: '3.25.76', license: 'MIT' },
  { name: 'zustand', version: '5.0.14', license: 'MIT' },
  { name: '@expo/vector-icons', version: '15.0.2', license: 'MIT' },
  { name: '@expo-google-fonts/plus-jakarta-sans', version: '0.4.2', license: 'MIT' },
]
