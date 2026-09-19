import type { AssistantAccess } from '@/state/preferencesStore'

/**
 * Copy for Space → Keep Our Space Private. Figma `3430:489`.
 *
 * The sibling of `spacePrivacy.ts`, and deliberately not merged with it.
 * Privacy Details makes four promises and offers nothing to change; this page
 * makes three and puts a real control under the third. Sharing one file would
 * have meant one list doing two jobs and a reader unable to tell which
 * sentences were claims and which were labels.
 *
 * The two status chips are STATEMENTS OF FACT, not controls — the frame draws
 * them flat, and they report what the app does rather than offering a choice.
 * The AI access level beneath them is the one thing here that changes anything.
 */
export const KEEP_PRIVATE_PRINCIPLES: readonly {
  key: string
  icon: 'lock' | 'image'
  accent: number
  title: string
  body: string
  statusLabel: string
  statusValue: string
}[] = [
  {
    key: 'visibility',
    icon: 'lock',
    accent: 0,
    title: 'Private by default',
    body: 'Everything you share—chats, photos, and milestones—is visible only to you and your partner. No social feeds, no external observers.',
    statusLabel: 'SPACE VISIBILITY',
    statusValue: 'Hidden',
  },
  {
    key: 'memories',
    icon: 'image',
    accent: 1,
    title: 'Memories stay here',
    body: 'Your photos and intimate moments are stored securely. You control if and how anything ever leaves this digital scrapbook.',
    statusLabel: 'PHOTO SHARING',
    statusValue: 'Internal Only',
  },
] as const

export const ASSISTANT_ACCESS_OPTIONS: readonly { key: AssistantAccess; label: string }[] = [
  { key: 'nudges', label: 'Helpful Nudges Only' },
  { key: 'full', label: 'Full Memory Context' },
] as const

export const SPACE_KEEP_PRIVATE_COPY = {
  title: 'Just for the two of you.',
  lede: 'Your LoveOS space belongs to both of you. We built it to be a quiet, secure room for your memories, far away from the noise of the rest of the world.',

  assistantTitle: 'Thoughtful AI Assistance',
  assistantBody:
    'Our AI helps organize memories and suggests thoughtful nudges, but it only accesses what you allow. Your private info is never used to train global models.',
  assistantAccessLabel: 'AI ACCESS LEVEL',

  review: 'Review Privacy Settings',
  reviewHint: 'Take a moment to make sure everything feels right.',

  selected: 'Selected',
} as const
