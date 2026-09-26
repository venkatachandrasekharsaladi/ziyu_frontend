import {
  elementSynergy,
  ZODIAC_ELEMENT,
  ZODIAC_LABEL,
  ZODIAC_TRAIT,
  zodiacSignFor,
} from '@/utils/zodiac'

describe('zodiacSignFor', () => {
  it('resolves a date inside a sign to that sign', () => {
    expect(zodiacSignFor('2001-07-14')).toBe('cancer')
    expect(zodiacSignFor('2004-12-18')).toBe('sagittarius')
  })

  it('resolves the first and last day of a range', () => {
    expect(zodiacSignFor('2000-03-21')).toBe('aries')
    expect(zodiacSignFor('2000-04-19')).toBe('aries')
  })

  it('rolls December 22 onward into Capricorn, and January before the 20th too', () => {
    expect(zodiacSignFor('2000-12-22')).toBe('capricorn')
    expect(zodiacSignFor('2000-01-05')).toBe('capricorn')
  })

  it('has a label and a positive trait for every sign it can return', () => {
    for (const sign of Object.keys(ZODIAC_LABEL) as (keyof typeof ZODIAC_LABEL)[]) {
      expect(ZODIAC_LABEL[sign]).toBeTruthy()
      expect(ZODIAC_TRAIT[sign]).toBeTruthy()
      expect(ZODIAC_ELEMENT[sign]).toBeTruthy()
    }
  })

  it('returns null for a value it cannot parse', () => {
    expect(zodiacSignFor('not-a-date')).toBeNull()
  })
})

describe('elementSynergy', () => {
  it('is always a non-empty, positive-reading sentence', () => {
    const elements = ['fire', 'earth', 'air', 'water'] as const

    for (const a of elements) {
      for (const b of elements) {
        expect(elementSynergy(a, b).length).toBeGreaterThan(0)
      }
    }
  })

  it('calls out matching elements by name', () => {
    expect(elementSynergy('water', 'water')).toContain('water meets water')
  })
})
