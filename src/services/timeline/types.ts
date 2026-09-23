export type TimelineItem = {
  id: string
  type: 'memory' | 'calendar' | 'story' | 'occasion'
  /** `YYYY-MM-DD`. */
  date: string
  title: string
  subtitle?: string | null
  mediaUrl?: string | null
}

export type TimelinePage = { items: TimelineItem[]; nextCursor?: string }
export type TimelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'NETWORK' | 'UNKNOWN' } }

export type TimelineService = {
  list: (input?: { cursor?: string; limit?: number }) => Promise<TimelineResult<TimelinePage>>
}
