import { create } from 'zustand'

export type TextScale = 'small' | 'default' | 'large'
export type AutoDownload = 'never' | 'wifi' | 'always'
export type UploadQuality = 'standard' | 'high'
export type DateFormat = 'dmy' | 'mdy' | 'ymd'
export type Clock = '12h' | '24h'
export type WeekStart = 'sunday' | 'monday'
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi'
export type ReminderLead = 'sameDay' | 'dayBefore' | 'weekBefore'
export type HomeCardKey = 'featured' | 'comingUp' | 'littleThings'

/**
 * How much of the couple's space the assistant may read. Figma `3430:545`.
 *
 * Two levels, not a switch, because "off" is not one of the options the frame
 * offers — the assistant always sees something. Naming the floor `nudges`
 * rather than calling the whole thing `assistantEnabled: false` keeps that
 * honest.
 */
export type AssistantAccess = 'nudges' | 'full'

/** The assistant's voice. Figma `3430:1349` onward. */
export type AssistantTone = 'quiet' | 'warm' | 'playful' | 'deep'

/** How often it speaks up. Figma `3430:1392`, drawn as a three-stop slider. */
export type AssistantFrequency = 'rarely' | 'balanced' | 'often'

export type Preferences = {
  /** Accessibility. */
  textScale: TextScale
  reduceMotion: boolean
  haptics: boolean
  highContrast: boolean

  /** Notifications. */
  notificationsEnabled: boolean
  notifyMessages: boolean
  notifyVoiceNotes: boolean
  notifyNewMemories: boolean
  notifyOnThisDay: boolean
  notifyOccasions: boolean
  notifyPartnerActivity: boolean
  quietHoursEnabled: boolean
  /** `HH:MM`, 24-hour, regardless of the `clock` preference. */
  quietHoursFrom: string
  quietHoursTo: string
  notificationSound: boolean
  notificationVibration: boolean

  /** Chat. */
  readReceipts: boolean
  typingIndicator: boolean
  autoSaveMedia: boolean
  voiceNoteAutoPlay: boolean
  messageTextScale: TextScale

  /** Memories & story. */
  onThisDayEnabled: boolean
  onThisDayTime: string
  defaultAlbumKey: string
  autoAddChatPhotos: boolean
  memoryReminders: boolean

  /** Dates & reminders. */
  anniversaryLead: ReminderLead
  birthdayLead: ReminderLead
  occasionLead: ReminderLead

  /** Home layout — order is meaningful. */
  homeCards: HomeCardKey[]

  /** Language & region. */
  language: LanguageCode
  dateFormat: DateFormat
  clock: Clock
  weekStart: WeekStart

  /** Privacy. */
  appLock: boolean
  hideNotificationContent: boolean
  showOnlineStatus: boolean
  screenshotAlerts: boolean

  /** Data & storage. */
  autoDownload: AutoDownload
  uploadQuality: UploadQuality

  /**
   * Our Preferences — Figma `3430:1878`. Eight switches in three groups:
   * what the space REMEMBERS, what it REMINDS us of, and how it RESPONDS.
   *
   * Prefixed `space` and kept here rather than in `spaceStore` because that
   * store holds what the space IS — its name, its mood, its texture. These are
   * preferences about behaviour, which is what this store is for, and splitting
   * them would mean two `reset`s to remember on sign-out instead of one.
   */
  spaceDates: boolean
  spaceMemories: boolean
  spaceTimeline: boolean
  spaceMeaningfulMoments: boolean
  spaceUnfinishedMemories: boolean
  spaceMilestones: boolean
  spaceDaysTogether: boolean
  spaceHomePersonalization: boolean

  /**
   * The assistant's three standing permissions. Figma `3430:2292`.
   *
   * Separate from the `space*` group above even though both are switches on a
   * Space screen: these govern what the ASSISTANT may do unprompted, and the
   * difference between "show me our dates" and "let something suggest things to
   * me" is the one a person most wants to be able to find and turn off.
   */
  assistantDateNightIdeas: boolean
  assistantMemorySuggestions: boolean
  assistantAnniversaryIdeas: boolean
  assistantAccess: AssistantAccess

  /**
   * The two suggestions Assistant Preferences (`3430:1276`) offers that the
   * LoveOS Assistant frame (`3430:2279`) does not.
   *
   * FLAGGED FOR THE DESIGNER: `assistantMemoryRecaps` here and
   * `assistantMemorySuggestions` above are two names for adjacent ideas —
   * "weekly this time last year" versus "gentle reminders of past moments".
   * They are kept apart rather than merged because merging them would have
   * meant deciding which of the two frames was wrong, which is not a decision
   * to make quietly in a store.
   */
  assistantMemoryRecaps: boolean
  assistantConversationStarters: boolean

  assistantTone: AssistantTone
  assistantFrequency: AssistantFrequency
}

/** Every key whose value is a boolean — the only keys `toggle` accepts. */
export type BooleanPreferenceKey = {
  [K in keyof Preferences]: Preferences[K] extends boolean ? K : never
}[keyof Preferences]

type PreferencesState = Preferences & {
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  toggle: (key: BooleanPreferenceKey) => void
  reset: () => void
}

/**
 * Defaults. Chosen so a fresh install behaves the way the app already does
 * today — read receipts and typing indicators are on because chat renders them
 * unconditionally right now, and turning them off has to be a decision someone
 * made rather than the state they woke up in.
 *
 * Exported so the store's own test can assert the whole object at once rather
 * than a hand-picked few of the forty fields — a `reset` that missed one would
 * otherwise pass for as long as nobody thought to name it.
 */
export const PREFERENCE_DEFAULTS: Preferences = {
  textScale: 'default',
  reduceMotion: false,
  haptics: true,
  highContrast: false,

  notificationsEnabled: true,
  notifyMessages: true,
  notifyVoiceNotes: true,
  notifyNewMemories: true,
  notifyOnThisDay: true,
  notifyOccasions: true,
  notifyPartnerActivity: false,
  quietHoursEnabled: false,
  quietHoursFrom: '22:00',
  quietHoursTo: '07:00',
  notificationSound: true,
  notificationVibration: true,

  readReceipts: true,
  typingIndicator: true,
  autoSaveMedia: false,
  voiceNoteAutoPlay: false,
  messageTextScale: 'default',

  onThisDayEnabled: true,
  onThisDayTime: '09:00',
  defaultAlbumKey: 'all',
  autoAddChatPhotos: true,
  memoryReminders: true,

  anniversaryLead: 'weekBefore',
  birthdayLead: 'weekBefore',
  occasionLead: 'dayBefore',

  homeCards: ['featured', 'comingUp', 'littleThings'],

  language: 'en',
  dateFormat: 'dmy',
  clock: '12h',
  weekStart: 'monday',

  appLock: false,
  hideNotificationContent: false,
  showOnlineStatus: true,
  screenshotAlerts: false,

  autoDownload: 'wifi',
  uploadQuality: 'high',

  // The frame draws these three on and these three off — 3430:1902 onward.
  spaceDates: true,
  spaceMemories: true,
  spaceTimeline: false,
  spaceMeaningfulMoments: true,
  spaceUnfinishedMemories: false,
  spaceMilestones: true,
  spaceDaysTogether: true,
  spaceHomePersonalization: false,

  // Two on, one off - the states frame 3430:2306 onward draws.
  assistantDateNightIdeas: true,
  assistantMemorySuggestions: true,
  assistantAnniversaryIdeas: false,

  // The frame selects the narrower of the two levels by default.
  assistantAccess: 'nudges',

  // States drawn on 3430:1308 onward: two on, one off, warm, balanced.
  assistantMemoryRecaps: true,
  assistantConversationStarters: false,
  assistantTone: 'warm',
  assistantFrequency: 'balanced',
}

/**
 * Every preference in the settings cluster.
 *
 * Kept apart from `relationshipStore` (who the couple are) and `spaceStore`
 * (what they called the thing they share) for the same reason those two are
 * apart from each other: this is a different question, edited from different
 * screens.
 *
 * NOTHING PERSISTS, deliberately — same rule as `relationshipStore`, and the
 * reason no storage dependency is installed. This file is the single place to
 * wrap in `persist` the day that changes, and the day it does, a language
 * change becomes worth a restart prompt. Not before: a restart today would
 * discard every setting the user just made.
 *
 * One generic `setPreference` rather than forty named setters — see the
 * plan's Task 1 note. `Preferences[K]` keeps it fully type-checked.
 */
export const usePreferencesStore = create<PreferencesState>((set) => ({
  ...PREFERENCE_DEFAULTS,

  setPreference: (key, value) => set({ [key]: value } as Pick<Preferences, typeof key>),

  toggle: (key) => set((state) => ({ [key]: !state[key] }) as Pick<Preferences, typeof key>),

  reset: () => set({ ...PREFERENCE_DEFAULTS }),
}))
