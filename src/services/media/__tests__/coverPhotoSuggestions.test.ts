import { curatedCoverChoices } from '@/services/media/coverPhotoSuggestions'

describe('curatedCoverChoices', () => {
  it('returns a fixed, non-empty set of choices', () => {
    const choices = curatedCoverChoices()

    expect(choices.length).toBeGreaterThan(3)
    expect(new Set(choices.map((c) => c.key)).size).toBe(choices.length)
  })

  it('sizes every uri for the requested dimensions', () => {
    const choices = curatedCoverChoices(400, 300)

    for (const choice of choices) {
      expect(choice.uri).toContain('w=400')
      expect(choice.uri).toContain('h=300')
    }
  })
})
