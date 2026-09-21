import { render, screen } from '@testing-library/react-native'


import AppLayout from '@/app/(app)/_layout'
import OnboardingLayout from '@/app/(onboarding)/_layout'
import Index from '@/app/index'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSessionStore } from '@/state/sessionStore'

/**
 * `Redirect` renders the href so a test can read WHERE it sent the user, and
 * `Stack` renders a marker so "let them through" is distinguishable from
 * "redirected somewhere". Both are navigator internals that do nothing useful
 * under Jest, and the thing under test is the decision, not the navigation.
 */
jest.mock('expo-router', () => {
  // Required INSIDE the factory: `jest.mock` is hoisted above the imports, so a
  // `Text` from module scope is not defined when this runs.
  const { Text: RNText } = require('react-native')

  return {
    Redirect: ({ href }: { href: string }) => <RNText>{`redirect:${href}`}</RNText>,
    Stack: () => <RNText>stack</RNText>,
  }
})

jest.mock('@/design-system/patterns/useStackScreenOptions', () => ({
  useStackScreenOptions: () => ({}),
}))

const VERIFIED = { userId: 'u1', email: 'a@example.com', emailVerified: true }
const UNVERIFIED = { userId: 'u1', email: 'a@example.com', emailVerified: false }

/** What the layout decided: the href it redirected to, or null if it let you in. */
function redirectedTo(): string | null {
  const hit = screen.queryByText(/^redirect:/)

  return hit ? String(hit.props.children).replace('redirect:', '') : null
}

beforeEach(() => {
  useSessionStore.getState().reset()
  useRelationshipStore.getState().reset()
})

/**
 * THE GUARDS.
 *
 * These exist because `(app)` was reachable by typing its path. This app ships
 * a web build, so "typing its path" means the address bar, and the screens
 * behind it hold a couple's memories, letters and live location.
 *
 * The guard lives on each LAYOUT rather than on each screen, so a route added
 * later is protected by existing. That is only true while these tests hold —
 * a guard nobody checks is a guard that silently stops guarding.
 */
describe('(app) requires a verified session', () => {
  it('turns away a visitor with no session at all', async () => {
    await render(<AppLayout />)

    expect(redirectedTo()).toBe('/(auth)/welcome')
    expect(screen.queryByText('stack')).toBeNull()
  })

  it('turns away a session whose email is not verified yet', async () => {
    useSessionStore.getState().signedIn(UNVERIFIED)

    await render(<AppLayout />)

    // The narrow case the two selectors exist to separate: signed in, but not
    // far enough in to reach the app.
    expect(redirectedTo()).toBe('/(auth)/welcome')
  })

  it('lets a verified session through', async () => {
    useSessionStore.getState().signedIn(VERIFIED)

    await render(<AppLayout />)

    expect(redirectedTo()).toBeNull()
    expect(screen.getByText('stack')).toBeTruthy()
  })
})

describe('(onboarding) requires only a session', () => {
  it('turns away a visitor with no session', async () => {
    await render(<OnboardingLayout />)

    expect(redirectedTo()).toBe('/(auth)/welcome')
  })

  it('lets an UNVERIFIED session through, because that is who it is for', async () => {
    useSessionStore.getState().signedIn(UNVERIFIED)

    await render(<OnboardingLayout />)

    // Requiring verification here would lock people out of the flow they were
    // just sent to on sign-up.
    expect(redirectedTo()).toBeNull()
    expect(screen.getByText('stack')).toBeTruthy()
  })
})

/**
 * THE ENTRY DECISION.
 *
 * Three questions in order, each only meaningful once the previous is answered.
 * Nothing persists today, so a cold start always answers "no" at the first one
 * — these tests are what stop the other three branches rotting in the meantime.
 */
describe('the entry route', () => {
  it('sends a stranger to Welcome', async () => {
    await render(<Index />)

    expect(redirectedTo()).toBe('/(auth)/welcome')
  })

  it('sends an unverified account to the mail step', async () => {
    useSessionStore.getState().signedIn(UNVERIFIED)

    await render(<Index />)

    expect(redirectedTo()).toBe('/(auth)/verify-email')
  })

  it('sends a verified but unpaired account back into onboarding', async () => {
    useSessionStore.getState().signedIn(VERIFIED)

    await render(<Index />)

    expect(redirectedTo()).toBe('/(onboarding)/setup')
  })

  it('treats a half-finished pairing as unpaired', async () => {
    useSessionStore.getState().signedIn(VERIFIED)
    // `inviting` and `pending` are both mid-flow. Only `connected` is a couple.
    useRelationshipStore.getState().setInvite('ABC123')

    await render(<Index />)

    expect(redirectedTo()).toBe('/(onboarding)/setup')
  })

  it('sends a verified, paired couple to Home', async () => {
    useSessionStore.getState().signedIn(VERIFIED)
    useRelationshipStore.getState().connect()

    await render(<Index />)

    expect(redirectedTo()).toBe('/(app)/home')
  })
})

describe('the session store', () => {
  it('starts empty', () => {
    expect(useSessionStore.getState().session).toBeNull()
  })

  it('marks an existing session verified in place, keeping who it belongs to', () => {
    useSessionStore.getState().signedIn(UNVERIFIED)
    useSessionStore.getState().emailVerified()

    expect(useSessionStore.getState().session).toEqual({ ...UNVERIFIED, emailVerified: true })
  })

  it('does nothing when asked to verify nobody', () => {
    // Guards against a screen calling `emailVerified()` after a sign out and
    // conjuring a session out of nothing.
    useSessionStore.getState().emailVerified()

    expect(useSessionStore.getState().session).toBeNull()
  })

  it('is cleared by reset, which is what sign out calls', () => {
    useSessionStore.getState().signedIn(VERIFIED)
    useSessionStore.getState().reset()

    expect(useSessionStore.getState().session).toBeNull()
  })
})
