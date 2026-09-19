import type { BooleanPreferenceKey } from '@/state/preferencesStore'

/**
 * Copy for Space → Our Preferences. Figma `3430:1878` "(Refined)" and
 * `3430:234` "(Module 05)".
 *
 * The eight switches are DATA, not eight pairs of keys, because the screen
 * draws them in three groups and every group is the same row repeated. A flat
 * object would have put the grouping in the component, where a reviewer
 * comparing this against the frame cannot see it.
 *
 * `accent` indexes `theme.colors.accents`. The frame gives each group its own
 * tile colour — pink, lavender, mint — and those are the three pairs that list
 * already ships, so no new token was needed.
 */
export const SPACE_PREFERENCE_GROUPS: readonly {
  title: string
  /**
   * The group's name as a SCREEN READER should say it, folded into each of its
   * switches' accessible names.
   *
   * Two of these switches — "Memories" and "Timeline" — are named exactly like
   * tabs in the bottom bar, which is on screen at the same time. Without the
   * group in front, a reader hears "Memories" twice on one screen and the two
   * mean different things. `title` cannot do this job: it is set in capitals
   * for the design, and some readers spell capitals out letter by letter.
   */
  spoken: string
  icon: 'heart' | 'star' | 'home'
  accent: number
  rows: readonly { key: BooleanPreferenceKey; label: string; detail: string }[]
}[] = [
  {
    title: 'OUR STORY',
    spoken: 'Our story',
    icon: 'heart',
    accent: 0,
    rows: [
      {
        key: 'spaceDates',
        label: 'Dates',
        detail: 'Anniversaries, first meetings, and custom milestones.',
      },
      {
        key: 'spaceMemories',
        label: 'Memories',
        detail: 'Gentle prompts to capture shared moments.',
      },
      {
        key: 'spaceTimeline',
        label: 'Timeline',
        detail: 'Automatically curate our journey together.',
      },
    ],
  },
  {
    title: 'OUR MOMENTS',
    spoken: 'Our moments',
    icon: 'star',
    accent: 2,
    rows: [
      {
        key: 'spaceMeaningfulMoments',
        label: 'Meaningful moments',
        detail: 'Highlight significant events and deep conversations.',
      },
      {
        key: 'spaceUnfinishedMemories',
        label: 'Unfinished memories',
        detail: 'Nudge us to complete drafts or finalize trip plans.',
      },
    ],
  },
  {
    title: 'OUR SPACE',
    spoken: 'Our space',
    icon: 'home',
    accent: 1,
    rows: [
      {
        key: 'spaceMilestones',
        label: 'Milestones',
        detail: 'Track relationship goals and achievements.',
      },
      {
        key: 'spaceDaysTogether',
        label: 'Days together',
        detail: 'Celebrate our ongoing time count on the home screen.',
      },
      {
        key: 'spaceHomePersonalization',
        label: 'Home personalization',
        detail: 'Allow dynamic themes based on our activity.',
      },
    ],
  },
] as const

/**
 * The rest of the Space section, as a list.
 *
 * NOT ON THE BOARD. The About Page frames are a set of screens with no map
 * between them — every frame draws a bottom bar and a back arrow, and none
 * draws a way INTO Space Mood, Gentle Reminders, the assistant, the privacy
 * pages or About. Built as designed, nine finished screens were unreachable on
 * a device, which makes them impossible to review.
 *
 * So this list exists, and it is the one part of this screen a designer did not
 * draw. It is deliberately plain — `SettingsRow`, the same row the settings
 * list uses — so it reads as navigation rather than as invented design. Replace
 * it the moment the board says how these screens are meant to be reached.
 */
export const SPACE_MORE_LINKS: readonly {
  key: string
  icon: 'droplet' | 'bell' | 'zap' | 'lock' | 'shield' | 'info' | 'users'
  label: string
  detail: string
  href: string
}[] = [
  {
    key: 'mood',
    icon: 'droplet',
    label: 'Space Mood',
    detail: 'The atmosphere of your shared space',
    href: '/(app)/space/mood',
  },
  {
    key: 'reminders',
    icon: 'bell',
    label: 'Gentle Reminders',
    detail: 'Anniversaries, birthdays and unfinished memories',
    href: '/(app)/space/reminders',
  },
  {
    key: 'assistant',
    icon: 'zap',
    label: 'LoveOS Assistant',
    detail: 'What it may suggest, and how it speaks',
    href: '/(app)/space/assistant',
  },
  {
    key: 'partner',
    icon: 'users',
    label: 'Partner & Connection',
    detail: 'The person who shares this space',
    href: '/(app)/space/partner',
  },
  {
    key: 'keepPrivate',
    icon: 'lock',
    label: 'Keep Our Space Private',
    detail: 'Visibility, photo sharing and AI access',
    href: '/(app)/space/keep-private',
  },
  {
    key: 'privacy',
    icon: 'shield',
    label: 'Privacy Details',
    detail: 'What we promise about your space',
    href: '/(app)/space/privacy',
  },
  {
    key: 'about',
    icon: 'info',
    label: 'About Our Space',
    detail: 'How long, how many, and when it began',
    href: '/(app)/space/about',
  },
] as const

export const SPACE_PREFERENCES_COPY = {
  title: 'How should LoveOS feel for us?',
  lede: 'Choose how your shared space remembers, reminds and responds.',
  moreTitle: 'MORE IN YOUR SPACE',
} as const
