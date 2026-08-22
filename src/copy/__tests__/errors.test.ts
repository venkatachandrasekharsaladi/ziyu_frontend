import { AUTH_ERROR_COPY, authErrorMessage } from '@/copy/errors'
import { AUTH_ERROR_CODES } from '@/services/auth/types'

describe('AUTH_ERROR_COPY', () => {
  it.each(AUTH_ERROR_CODES.map((code) => [code] as const))(
    'has a non-empty message for %s',
    (code) => {
      expect(AUTH_ERROR_COPY[code].length).toBeGreaterThan(0)
    },
  )

  it('covers every code and invents none', () => {
    // The whole point of one shared map: exhaustiveness is checked in exactly
    // one place instead of in six copy files.
    expect(Object.keys(AUTH_ERROR_COPY).sort()).toEqual([...AUTH_ERROR_CODES].sort())
  })

  it('never leaks a raw code to a user', () => {
    for (const code of AUTH_ERROR_CODES) {
      expect(AUTH_ERROR_COPY[code]).not.toContain(code)
      expect(AUTH_ERROR_COPY[code]).not.toMatch(/^[A-Z_]+$/)
    }
  })
})

describe('authErrorMessage', () => {
  it('falls back to the shared message when a screen has no opinion', () => {
    expect(authErrorMessage('NETWORK')).toBe(AUTH_ERROR_COPY.NETWORK)
  })

  it('prefers a screen override', () => {
    const message = authErrorMessage('EMAIL_ALREADY_EXISTS', {
      EMAIL_ALREADY_EXISTS: 'That email already has an account. Sign in instead.',
    })

    expect(message).toBe('That email already has an account. Sign in instead.')
  })

  it('uses the shared message for codes a screen does not override', () => {
    const message = authErrorMessage('RATE_LIMITED', {
      EMAIL_ALREADY_EXISTS: 'irrelevant to this code',
    })

    expect(message).toBe(AUTH_ERROR_COPY.RATE_LIMITED)
  })
})
