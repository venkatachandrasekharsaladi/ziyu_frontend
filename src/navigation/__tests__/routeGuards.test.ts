import { destinationFor, redirectFor } from '@/navigation/routePolicy'
import type { SpaceStatus } from '@/services/pairing/types'

const space = (status: SpaceStatus['status']): SpaceStatus => ({
  coupleId: status === 'none' ? undefined : 'couple-id',
  coverStyle: 'dawn',
  status,
})

describe('route guards', () => {
  it('routes unauthenticated and unverified sessions to prerequisites', () => {
    expect(destinationFor({ phase: 'unauthenticated', space: null }))
      .toBe('/(auth)/welcome')
    expect(destinationFor({ phase: 'unverified', space: null }))
      .toBe('/(auth)/verify-email')
  })

  it.each([
    ['none', '/(onboarding)/setup'],
    ['inviting', '/(onboarding)/invitation-sent'],
    ['pending', '/(onboarding)/confirm-partner'],
    ['connected', '/(app)/home'],
    ['paused', '/(app)/home'],
    ['archived', '/(app)/home'],
  ] as const)('routes %s relationship state to %s', (status, destination) => {
    expect(destinationFor({ phase: 'ready', space: space(status) })).toBe(destination)
  })

  it('never chooses a route before bootstrap resolves', () => {
    expect(destinationFor({ phase: 'hydrating', space: null })).toBeNull()
    expect(destinationFor({ phase: 'offline', space: null })).toBeNull()
  })

  it('denies protected groups by default', () => {
    expect(redirectFor('app', { phase: 'unauthenticated', space: null }))
      .toBe('/(auth)/welcome')
    expect(redirectFor('app', { phase: 'unverified', space: null }))
      .toBe('/(auth)/verify-email')
    expect(redirectFor('app', { phase: 'ready', space: space('none') }))
      .toBe('/(onboarding)/setup')
    expect(redirectFor('onboarding', { phase: 'ready', space: space('connected') }))
      .toBe('/(app)/home')
    expect(redirectFor('auth', { phase: 'ready', space: space('connected') }))
      .toBe('/(app)/home')
  })

  it('allows only the correct group for resolved state', () => {
    expect(redirectFor('auth', { phase: 'unauthenticated', space: null })).toBeNull()
    expect(redirectFor('onboarding', { phase: 'ready', space: space('pending') })).toBeNull()
    expect(redirectFor('app', { phase: 'ready', space: space('paused') })).toBeNull()
  })
})
