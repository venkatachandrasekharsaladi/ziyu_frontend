import type { FeatherName } from '@/design-system/patterns/SettingsRow'

/**
 * Copy for Space → Privacy Details. Figma `3430:1563` "(Refined)",
 * `3430:1411` "(Module 05)", and `3430:489` "Keep Our Space Private".
 *
 * All three frames make the same four promises in the same order, so the
 * pillars live here once and the screens differ only in their chrome.
 *
 * These are CLAIMS ABOUT THE PRODUCT, not decoration. "Every interaction is an
 * encrypted thread" is a statement someone will hold the app to, and it is
 * repeated verbatim from the frame rather than paraphrased — if the engineering
 * behind it changes, this file is the one place the wording has to change too.
 */
export const PRIVACY_PILLARS: readonly {
  key: string
  icon: FeatherName
  accent: number
  title: string
  body: string
}[] = [
  {
    key: 'private',
    icon: 'lock',
    accent: 1,
    title: 'Private by Default',
    body: 'Your relationship space is invisible to the outside world. Only you and your partner hold the keys to this shared diary.',
  },
  {
    key: 'memories',
    icon: 'heart',
    accent: 0,
    title: 'Your Memories',
    body: 'Photos, letters, and voice notes are securely stored. They belong to your timeline, creating a lasting archive of your unique story.',
  },
  {
    key: 'choices',
    icon: 'sliders',
    accent: 2,
    title: 'Your Choices',
    body: "You decide what to keep, what to delete, and how your space feels. We don't mine your moments for ads or attention.",
  },
  {
    key: 'connection',
    icon: 'link',
    accent: 0,
    title: 'The Connection',
    body: 'Every interaction is an encrypted thread between you two. Safe, quiet, and intimately protected from digital noise.',
  },
] as const

export const SPACE_PRIVACY_COPY = {
  title: 'Your space stays yours.',
  lede: 'LoveOS is built differently. We believe your memories, conversations, and connection should be a private haven, not a public square.',
  /** The small tilted chip at the foot of the page. */
  footer: 'A safe place for us.',

  /** `3430:489` asks the same thing as a question and adds a way out. */
  keepPrivateTitle: 'Keep our space private.',
  reviewSettings: 'Review Privacy Settings',
} as const
