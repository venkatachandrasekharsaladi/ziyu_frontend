/**
 * THE STORY BOUNDARY.
 *
 * Mirrors `services/auth` and `services/pairing` exactly: a typed interface,
 * errors as codes rather than strings, and a mock until a provider exists.
 */
export type StoryErrorCode = 'NETWORK' | 'UNKNOWN'

export type StoryError = {
  code: StoryErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: StoryError }

/**
 * How precisely a date is known.
 *
 * M01-S12 offers all three because "we met sometime in 2019" is a real answer,
 * and forcing a day would make the user invent one. What is stored is always a
 * full `YYYY-MM-DD`; the precision records how much of it to believe.
 */
export type DatePrecision = 'exact' | 'monthYear' | 'yearOnly'

export type StoryDate = {
  /** `YYYY-MM-DD`. Unknown parts are filled with 01. */
  value: string
  precision: DatePrecision
}

/** One moment on the timeline: M01-S13, S14 and S15 all share this shape. */
export type Moment = {
  date?: string
  location?: string
  note?: string
  photoUri?: string
}

/** The recurring dates on M01-S16. All optional — none is required to continue. */
export type KeyDates = {
  anniversary?: string
  yourBirthday?: string
  partnerBirthday?: string
  firstDate?: string
  firstMeeting?: string
}

export type Story = {
  met?: StoryDate
  firstDate?: Moment
  becameUs?: Moment
  firstMemory?: Moment
  keyDates?: KeyDates
}

export type StoryService = {
  /** Persists the whole story. Called once, when the user commits on M01-S17. */
  saveStory: (input: Story) => Promise<Result<Story>>
}
