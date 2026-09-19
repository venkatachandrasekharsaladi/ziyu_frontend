import type { ComingUp } from '@/services/calendar/types'

export type HomeErrorCode = 'NETWORK' | 'UNKNOWN'
export type HomeError = { code: HomeErrorCode }
export type Result<T> = { ok: true; value: T } | { ok: false; error: HomeError }

export type HomeSpace = {
  name: string
  shortName: string
  coverStyle: string
}

export type HomeStat = {
  key: string
  icon: string
  value: string
  label: string
  unit: string
}

export type HomeRecentMemory = {
  id: string
  title: string
  date: string
  photoUri?: string
  location?: string
}

export type HomePulse = {
  label: string
  value: string
  unit: string
  caption: string
}

export type HomeDashboard = {
  coupleName: string
  greetingName: string
  space: HomeSpace
  daysTogether?: number
  stats: HomeStat[]
  comingUp: ComingUp[]
  recentMemories: HomeRecentMemory[]
  pulse: HomePulse
}

export type HomeService = {
  getDashboard: () => Promise<Result<HomeDashboard>>
}
