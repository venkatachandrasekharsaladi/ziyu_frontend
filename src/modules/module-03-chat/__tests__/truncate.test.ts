import { truncateWords } from '@/modules/module-03-chat/truncate'

describe('truncateWords', () => {
  it('leaves short text alone', () => {
    expect(truncateWords('Just trust me.', 40)).toBe('Just trust me.')
  })

  it('cuts at a word boundary', () => {
    expect(truncateWords('Are we still going for coffee tonight?', 25))
      .toBe('Are we still going for…')
  })

  it('cuts cleanly when max lands exactly on a space', () => {
    // text[5] is the space between "Hello" and "world" — the cut itself
    // ("Hello") is already a whole word, so the walk-back finds no earlier
    // space to disturb it.
    expect(truncateWords('Hello world', 5)).toBe('Hello…')
  })

  it('still returns something when a single word is longer than max', () => {
    expect(truncateWords('Supercalifragilisticexpialidocious', 10)).toBe('Supercalif…')
  })
})
