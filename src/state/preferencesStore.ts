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
 */
const DEFAULTS: Preferences = {
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
  ...DEFAULTS,

  setPreference: (key, value) => set({ [key]: value } as Pick<Preferences, typeof key>),

  toggle: (key) => set((state) => ({ [key]: !state[key] }) as Pick<Preferences, typeof key>),

  reset: () => set({ ...DEFAULTS }),
}))
