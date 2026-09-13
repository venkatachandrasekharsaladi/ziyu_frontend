/**
 * Local stand-in data for the settings cluster.
 *
 * CONSTANTS, NOT A SERVICE. Every other fake in this repo (`services/auth`,
 * `services/chat`) is a typed boundary with a one-line swap point, because each
 * one has a real provider behind it one day. These do not: a device list and a
 * storage breakdown come from whatever backend eventually exists, and writing a
 * `SettingsService` now would invent a contract nobody has designed.
 *
 * Everything here is display data. Nothing reads it to make a decision except
 * `VERIFICATION_CODE`, and that is checked in the UI so the wrong-code path is
 * a real, tested path rather than a drawn one.
 */

export type Session = {
  id: string
  device: string
  /** Coarse, as a real provider would report it — never a street address. */
  location: string
  lastActive: string
  isCurrent: boolean
}

export type StorageSlice = {
  key: 'photos' | 'voice' | 'video' | 'cache'
  label: string
  bytes: number
}

export type StorageBreakdown = {
  totalBytes: number
  slices: StorageSlice[]
}

/** This device is FIRST. A list where your own session is buried is unusable. */
export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-current',
    device: 'iPhone 15 Pro',
    location: 'Hyderabad, India',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'session-ipad',
    device: 'iPad Air',
    location: 'Hyderabad, India',
    lastActive: '2 days ago',
    isCurrent: false,
  },
  {
    id: 'session-web',
    device: 'Chrome on Windows',
    location: 'Bengaluru, India',
    lastActive: '3 weeks ago',
    isCurrent: false,
  },
]

const PHOTOS = 1_240_000_000
const VOICE = 86_000_000
const VIDEO = 410_000_000
const CACHE = 132_000_000

export const MOCK_STORAGE: StorageBreakdown = {
  totalBytes: PHOTOS + VOICE + VIDEO + CACHE,
  slices: [
    { key: 'photos', label: 'Photos', bytes: PHOTOS },
    { key: 'video', label: 'Video moments', bytes: VIDEO },
    { key: 'cache', label: 'Cache', bytes: CACHE },
    { key: 'voice', label: 'Voice notes', bytes: VOICE },
  ],
}

/**
 * The code every mock verification accepts — phone, email, both.
 *
 * Six digits because `CodeInput` defaults to six and the pairing flow already
 * uses that length. A single known value is what lets the WRONG-code path be
 * exercised: anything that is not this is rejected, so the error, resend and
 * expiry states are real behaviour rather than decoration.
 */
export const VERIFICATION_CODE = '123456'

/** Bytes to something a person can read. Used by Data & Storage. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  return `${value.toFixed(1)} ${units[unit]}`
}

export type Plan = {
  key: 'free' | 'premium'
  name: string
  /** Minor units — paise, cents. `0` for the free plan. */
  priceMinor: number
  currency: string
  period: 'month' | 'year' | 'never'
  features: string[]
  isCurrent: boolean
  /**
   * FALSE for the paid plan, and it must stay false until a real payment
   * integration exists. This is what makes every upgrade control render as
   * unavailable rather than as a button that looks like it takes money and
   * does nothing.
   */
  isAvailable: boolean
}

export type Invoice = {
  id: string
  date: string
  amountMinor: number
  currency: string
  status: 'paid' | 'refunded'
}

export const MOCK_PLAN: Plan = {
  key: 'free',
  name: 'Free',
  priceMinor: 0,
  currency: 'INR',
  period: 'never',
  features: [
    'Everything you have now',
    'Unlimited messages and voice notes',
    'Your whole shared story',
  ],
  isCurrent: true,
  isAvailable: true,
}

/**
 * A PREVIEW of a tier that does not exist yet.
 *
 * The price is illustrative and the screen says so. There is no payment SDK,
 * no product configured in either store, and no pricing decision on record —
 * see the spec's open items. `isAvailable: false` is what keeps this honest at
 * the UI level rather than only in a comment.
 */
export const MOCK_PREMIUM: Plan = {
  key: 'premium',
  name: 'Together',
  priceMinor: 29_900,
  currency: 'INR',
  period: 'year',
  features: [
    'Full-resolution photographs, kept forever',
    'Unlimited albums',
    'Printed keepsakes of your year',
  ],
  isCurrent: false,
  isAvailable: false,
}

/** Empty, and correct: nothing has ever been charged to anyone. */
export const MOCK_INVOICES: Invoice[] = []

/** Minor units to a displayable price. */
export function formatPrice(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100)
}

/**
 * The password the mock delete flow accepts.
 *
 * Same reasoning as `VERIFICATION_CODE`: a single known value is what makes the
 * WRONG-password path real. Anything else is rejected exactly as a server would
 * reject it, so the error state and the attempt limit are behaviour rather than
 * a drawing.
 *
 * This is not a credential. There is no account and nothing to protect — it is
 * a fixture, and it is in a file named `mock.ts` in the client bundle for that
 * reason.
 */
export const MOCK_PASSWORD = 'loveos-demo'
