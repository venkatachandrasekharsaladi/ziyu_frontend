import { act } from '@testing-library/react-native'

import { lavenderTheme } from '@/design-system/themes/theme'
import { PhotoMessage } from '@/modules/module-03-chat/components/PhotoMessage'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

/**
 * RESPONSIVE PARITY — the same screens at the narrow and wide ends of the
 * phone range, not just the 390pt width every frame was drawn at.
 *
 * WHY THIS FILE EXISTS: the chat module carried several numbers copied
 * straight off the 390pt Figma frames — `PhotoMessage`'s `width: 220`,
 * `AttachmentSheet`'s `height: 342` (the literal height of frame 3390:384).
 * A measurement of a design is not a rule a design follows, and each of those
 * was wrong on any device that was not 390pt wide. Nothing caught it, because
 * every other test in this module renders at the default 390 where they all
 * happen to be correct.
 *
 * WIDTHS: 320 (iPhone SE, and the small Android end of the target market),
 * 390 (the frame baseline), 430 (Pro Max). `renderScreen`'s own `width`
 * option drives BOTH `useWindowDimensions` and the safe-area frame — see its
 * header comment for why both have to move together.
 *
 * WHAT THIS CANNOT TEST, stated rather than silently missed: Unistyles is
 * fully mocked under Jest and its mock resolves a breakpoint ONCE, to
 * `undefined` — `renderScreen` documents this. So `xs`/`md` breakpoint-keyed
 * style values are not exercised here by anything. Only values computed in
 * component code from `useWindowDimensions` (which the mock does not
 * intercept) genuinely react to these widths, which is precisely why the
 * fixes under test are written that way rather than as breakpoint variants.
 */

/** The phone range this app targets, narrow to wide. */
const WIDTHS = [320, 390, 430] as const

/**
 * The room a photo actually has inside its own bubble, from the two numbers
 * `MessageBubble` uses: the row's `maxWidth: '76%'` and the bubble's
 * `paddingHorizontal: spacing.lg` on each side.
 *
 * Recomputed here from the theme rather than hardcoded, so if either of those
 * moves this test moves with it instead of quietly asserting a stale budget.
 */
function bubbleInnerWidth(deviceWidth: number): number {
  const contentWidth = Math.min(deviceWidth, lavenderTheme.layout.column)

  return contentWidth * 0.76 - lavenderTheme.spacing.lg * 2
}

describe('PhotoMessage sizing', () => {
  it.each(WIDTHS)('never overflows its own bubble at %ipt', async (width) => {
    const { getByLabelText } = await renderScreen(<PhotoMessage uri="https://example.com/a.jpg" />, {
      width,
    })

    const style = getByLabelText('Photo').props.style
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style

    expect(typeof flat.width).toBe('number')
    // The actual regression: at 320pt the old fixed 220 exceeded a ~211pt
    // budget. `toBeLessThanOrEqual`, not a magic number — the budget is
    // derived above from the bubble's own two constants.
    expect(flat.width).toBeLessThanOrEqual(bubbleInnerWidth(width) + 0.001)
    // And it must still be a usable size, not collapsed to zero by a
    // percentage that had no parent width to resolve against.
    expect(flat.width).toBeGreaterThan(120)
  })

  it('grows with the device instead of staying pinned to the frame width', async () => {
    /*
     * UNMOUNTS between renders, deliberately.
     *
     * `renderScreen` sets the global `Dimensions` to drive
     * `useWindowDimensions`. Leaving the previous tree mounted means that
     * `Dimensions.set` emits into a component from the LAST render, which
     * schedules a state update outside `act()` — a warning here, and under
     * full-suite CPU contention a genuine cross-test failure. Measuring one
     * tree at a time is what makes this deterministic.
     */
    const widthAt = async (width: number) => {
      const { getByLabelText, unmount } = await renderScreen(
        <PhotoMessage uri="https://example.com/a.jpg" />,
        { width },
      )
      const style = getByLabelText('Photo').props.style
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style
      const measured = flat.width as number

      await unmount()

      return measured
    }

    // Sequential, not inlined into one `expect` — the two renders must not
    // overlap, for the reason above.
    const narrow = await widthAt(320)
    const baseline = await widthAt(390)

    // Strictly increasing from small to baseline — this is what a hardcoded
    // 220 could never do, and it is the whole point of the change.
    expect(narrow).toBeLessThan(baseline)
  })

  it('stops growing once the thread hits the tablet content column', async () => {
    const style = (
      await renderScreen(<PhotoMessage uri="https://example.com/a.jpg" />, { width: 1024 })
    ).getByLabelText('Photo').props.style
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style

    // On a tablet `AppScreenLayout` centres the thread inside `layout.column`,
    // so the window width is NOT the width the photo lives in. Clamping to the
    // column is what keeps a photo bubble from becoming a gallery tile.
    expect(flat.width).toBeLessThanOrEqual(bubbleInnerWidth(1024) + 0.001)
  })
})

describe('AttachmentSheet sizing', () => {
  // Bare, not inside `act()` — resetting within `act()` before anything is
  // mounted leaves the next `render()` with an empty tree, the harness footgun
  // `DesignParity.test.tsx` and `PinnedAndSearch.test.tsx` both document.
  beforeEach(() => {
    useChatStore.getState().reset()
  })

  it.each(WIDTHS)('hugs its content rather than the frame height at %ipt', async (width) => {
    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().openAttachments()
    })

    const { getByText, unmount } = await renderScreen(<ConversationScreen />, { width })

    // The sheet renders at every width. The substantive claim is the negative
    // one below: no ancestor of these tiles pins a 342pt height any more.
    expect(getByText('Photo')).toBeTruthy()
    expect(getByText('Voice note')).toBeTruthy()

    // Same reason as `widthAt` above — this screen reads
    // `useWindowDimensions`, so it must not survive into the next width.
    await unmount()
  })

  it('no longer carries the frame-copied fixed height anywhere in its styles', () => {
    // Source-level, deliberately: the Unistyles Jest mock does not surface a
    // resolved `height` off a rendered node, so a rendering assertion here
    // would pass whether or not the value was still there. Reading the module
    // is the honest check available under this harness.
    const fs = require('fs')
    const src = fs.readFileSync(
      'src/modules/module-03-chat/components/AttachmentSheet.tsx',
      'utf8',
    )
    const styleBlock = src
      .slice(src.indexOf('StyleSheet.create'))
      // Comments stripped FIRST: the removal is documented in a comment that
      // quotes the old `height: 342`, and matching that would fail forever
      // while the code was correct. The claim is about the CODE.
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    expect(styleBlock).not.toMatch(/height:\s*342/)
    // Belt and braces: the sheet must declare no fixed height at all, not
    // merely a different one.
    const sheetBlock = styleBlock.slice(styleBlock.indexOf('sheet:'), styleBlock.indexOf('grid:'))
    expect(sheetBlock).not.toMatch(/\bheight:/)
  })
})
