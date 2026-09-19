import type { Session } from '@/services/auth/types'

let current: Session | null = null

type Listener = (session: Session | null) => void
const listeners = new Set<Listener>()

export function getCachedSession(): Session | null {
  return current
}

export function setCachedSession(session: Session | null): void {
  if (
    current?.userId === session?.userId
    && current?.email === session?.email
    && current?.emailVerified === session?.emailVerified
  ) return
  current = session
  for (const listener of listeners) listener(current)
}

export function subscribeToSession(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function markCachedSessionVerified(): void {
  if (current) setCachedSession({ ...current, emailVerified: true })
}

export function __resetSessionForTests(): void {
  current = null
  listeners.clear()
}
