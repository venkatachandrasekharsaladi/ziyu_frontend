import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMockPersistStorage } from '@/state/mockPersistStorage'
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

type PersistedSessionState = Pick<SessionState, 'session'>

/**
 * WHO IS SIGNED IN.
 *
 * This did not exist, and its absence is why the app had no route guards: the
 * auth screens called `authService.signIn`, got a `Session` back, and threw it
 * away. There was nothing for a guard to read, so `/(app)/home` was reachable
 * by anyone who typed it — on web that is a URL bar, and this app ships a web
 * build.
 *
 * PERSISTS IN MOCK MODE ONLY, via `createMockPersistStorage` — see that
 * file's header for why. Against a real backend this stays exactly what the
 * comment above used to say: nothing persists here, because the thing worth
 * keeping is a refresh token, and that lives in `services/http/tokens.ts`
 * once a real provider issues one.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,

      signedIn: (session) => set({ session }),

      emailVerified: () =>
        set((state) =>
          state.session ? { session: { ...state.session, emailVerified: true } } : state,
        ),

      reset: () => set({ session: null }),
    }),
    {
      name: 'tales-of-two:session',
      storage: createMockPersistStorage<PersistedSessionState>(),
      partialize: (state): PersistedSessionState => ({ session: state.session }),
    },
  ),
)

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
