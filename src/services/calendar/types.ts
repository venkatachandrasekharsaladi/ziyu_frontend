export type CalendarErrorCode = 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN'

export type CalendarError = { code: CalendarErrorCode }
export type Result<T> = { ok: true; value: T } | { ok: false; error: CalendarError }

export type CalendarEventKind =
  | 'anniversary'
  | 'birthday'
  | 'dateNight'
  | 'trip'
  | 'reminder'
  | 'custom'

export type CalendarEvent = {
  id: string
  title: string
  /** `YYYY-MM-DD`. */
  date: string
  startsAt?: string
  endsAt?: string
  location?: string
  notes?: string
  kind: CalendarEventKind
  repeatsAnnually: boolean
  reminderMinutesBefore?: number
  createdAt: string
}

export type ComingUp = {
  key: string
  label: string
  detail?: string
  days: number
  date: string
  kind: string
  source: 'calendar' | 'story'
}

export type CreateCalendarEvent = Omit<CalendarEvent, 'id' | 'createdAt'>
export type UpdateCalendarEvent = Partial<CreateCalendarEvent>

export type CalendarService = {
  list: (input?: { from?: string; to?: string; limit?: number }) => Promise<Result<CalendarEvent[]>>
  upcoming: (input?: { withinDays?: number; limit?: number }) => Promise<Result<ComingUp[]>>
  get: (input: { id: string }) => Promise<Result<CalendarEvent>>
  create: (input: CreateCalendarEvent) => Promise<Result<CalendarEvent>>
  update: (input: { id: string; changes: UpdateCalendarEvent }) => Promise<Result<CalendarEvent>>
  remove: (input: { id: string }) => Promise<Result<void>>
}
