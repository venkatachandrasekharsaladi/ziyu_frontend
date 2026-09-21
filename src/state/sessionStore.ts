import { create } from 'zustand'

import type { Session } from '@/services/auth/types'

type SessionState = {
  /** The signed-in user, or `null` when nobody is. */
  session: Session | null

  signedIn: (session: Session) => void
  /** Marks the current session's email as verified, in place. */
  emailVerified: () => void
  /** Clears everything. Called on sign out and on account deletion. */
  reset: () => void
}

/**
 * WHO IS SIGNED IN.
 *
 * This did not exist, and its absence is why the app had no route guards: the
 * auth screens called `authService.signIn`, got a `Session` back, and threw it
 * away. There was nothing for a guard to read, so `/(app)/home` was reachable
 * by anyone who typed it — on web that is a URL bar, and this app ships a web
 * build.
 *
 * NOTHING PERSISTS, exactly like `relationshipStore` — and for the same stated
 * reason: there is no token worth keeping until a real provider issues one, so
 * `expo-secure-store` is still not installed. A reload signs you out. That is
 * the honest behaviour for a client with no backend, and it is the one thing
 * that has to change first when a real session arrives: persist here, and the
 * guards keep working unchanged.
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,

  signedIn: (session) => set({ session }),

  emailVerified: () =>
    set((state) =>
      state.session ? { session: { ...state.session, emailVerified: true } } : state,
    ),

  reset: () => set({ session: null }),
}))

/** True once someone is signed in, whether or not they have verified email. */
export const selectIsSignedIn = (state: SessionState) => state.session !== null

/**
 * True only once the email is verified too.
 *
 * Kept apart from `selectIsSignedIn` because the two gate different things: the
 * onboarding group needs a session, the app group needs a verified one. Folding
 * them into one flag would have let an unverified account walk into `(app)`.
 */
export const selectIsVerified = (state: SessionState) =>
  state.session?.emailVerified === true
