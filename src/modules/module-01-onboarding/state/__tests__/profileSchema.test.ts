import { profileSchema } from '@/modules/module-01-onboarding/state/profileSchema'

describe('profileSchema', () => {
  it('requires a name', () => {
    expect(profileSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('rejects a whitespace-only name', () => {
    expect(profileSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('accepts a name alone — everything else is optional', () => {
    expect(profileSchema.safeParse({ name: 'Chandu' }).success).toBe(true)
  })

  it('accepts the full profile including pronouns and nickname', () => {
    // Both carried across from the earlier Figma frame per D31.
    const result = profileSchema.safeParse({
      name: 'Chandu',
      nickname: 'Chan',
      pronouns: 'they/them',
      birthday: '1994-07-21',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an impossible birthday', () => {
    expect(profileSchema.safeParse({ name: 'Chandu', birthday: '1994-02-31' }).success).toBe(false)
  })

  it('rejects a malformed birthday', () => {
    expect(profileSchema.safeParse({ name: 'Chandu', birthday: '21/07/1994' }).success).toBe(false)
  })

  it('treats an empty birthday as absent rather than invalid', () => {
    expect(profileSchema.safeParse({ name: 'Chandu', birthday: '' }).success).toBe(true)
  })
})
