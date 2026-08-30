import { contrast } from '@/test/contrast'
import { lavenderTheme, midnightTheme } from '@/design-system/themes/theme'

const THEMES = [
  ['lavender', lavenderTheme],
  ['midnight', midnightTheme],
] as const

describe.each(THEMES)('chat colours — %s', (_name, theme) => {
  const chat = theme.colors.chat

  it('puts readable ink on both bubbles', () => {
    expect(contrast(chat.bubbleInk, chat.bubbleOutgoing)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(chat.bubbleInk, chat.bubbleIncoming)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the accent legible on the page', () => {
    expect(contrast(chat.accent, theme.colors.surface.page)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps a label legible on the accent', () => {
    expect(contrast(chat.onAccent, chat.accent)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('fuschia is never used as an accent', () => {
  it.each(THEMES)('%s', (_name, theme) => {
    expect(theme.colors.chat.accent.toUpperCase()).not.toBe('#EF5DA8')
  })
})
