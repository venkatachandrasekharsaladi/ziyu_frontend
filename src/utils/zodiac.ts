export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water'

/** Western tropical zodiac, ordered by the day each one STARTS (month, day). */
const CUTOFFS: { start: [number, number]; sign: ZodiacSign }[] = [
  { start: [1, 20], sign: 'aquarius' },
  { start: [2, 19], sign: 'pisces' },
  { start: [3, 21], sign: 'aries' },
  { start: [4, 20], sign: 'taurus' },
  { start: [5, 21], sign: 'gemini' },
  { start: [6, 21], sign: 'cancer' },
  { start: [7, 23], sign: 'leo' },
  { start: [8, 23], sign: 'virgo' },
  { start: [9, 23], sign: 'libra' },
  { start: [10, 23], sign: 'scorpio' },
  { start: [11, 22], sign: 'sagittarius' },
  { start: [12, 22], sign: 'capricorn' },
]

/** `YYYY-MM-DD` -> the sign whose range that day falls in. `null` if unparseable. */
export function zodiacSignFor(iso: string): ZodiacSign | null {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const month = Number(match[1])
  const day = Number(match[2])

  // Walk the year backwards from December: the first cutoff at or before this
  // date is its sign. Nothing is before January's cutoff, so that case falls
  // through to `capricorn`, which is exactly right — Jan 1–19 is still it.
  for (let i = CUTOFFS.length - 1; i >= 0; i -= 1) {
    const [cutoffMonth, cutoffDay] = CUTOFFS[i]!.start
    if (month > cutoffMonth || (month === cutoffMonth && day >= cutoffDay)) {
      return CUTOFFS[i]!.sign
    }
  }

  return 'capricorn'
}

export const ZODIAC_ELEMENT: Record<ZodiacSign, ZodiacElement> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water',
}

/** One flattering trait per sign — the app only ever shows positive facts. */
export const ZODIAC_TRAIT: Record<ZodiacSign, string> = {
  aries: 'bold and spontaneous',
  taurus: 'steady and devoted',
  gemini: 'curious and easy to talk to',
  cancer: 'warm and deeply caring',
  leo: 'generous and full of warmth',
  virgo: 'thoughtful and dependable',
  libra: 'charming and fair-minded',
  scorpio: 'passionate and fiercely loyal',
  sagittarius: 'adventurous and optimistic',
  capricorn: 'ambitious and steady',
  aquarius: 'original and open-minded',
  pisces: 'gentle and intuitive',
}

export const ZODIAC_LABEL: Record<ZodiacSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
}

const ELEMENT_LABEL: Record<ZodiacElement, string> = {
  fire: 'fire',
  earth: 'earth',
  air: 'air',
  water: 'water',
}

/**
 * A positive one-liner for how two elements sit together. There is no
 * unflattering pairing here on purpose — see `CompatibilityScreen`'s header
 * comment for why.
 */
export function elementSynergy(a: ZodiacElement, b: ZodiacElement): string {
  if (a === b) {
    return `You move at the same rhythm — ${ELEMENT_LABEL[a]} meets ${ELEMENT_LABEL[b]}.`
  }

  const pair = new Set([a, b])

  if (pair.has('fire') && pair.has('air')) return 'Fire and air — one sparks, the other fans it.'
  if (pair.has('earth') && pair.has('water')) return 'Earth and water — one holds, the other nourishes.'
  if (pair.has('fire') && pair.has('earth')) return 'Fire and earth — one leads, the other steadies it.'
  if (pair.has('air') && pair.has('water')) return 'Air and water — one lifts, the other deepens it.'
  if (pair.has('fire') && pair.has('water')) return 'Fire and water — passion meeting feeling, in balance.'

  return 'Earth and air — the practical and the imaginative, evenly matched.'
}
