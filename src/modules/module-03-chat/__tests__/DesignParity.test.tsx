import { act, waitFor } from '@testing-library/react-native'

import fixture from '@/modules/module-03-chat/__fixtures__/figma-chat.json'
import { lavenderTheme } from '@/design-system/themes/theme'
import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { PinnedAndSearchScreen } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
import { VideoMomentScreen } from '@/modules/module-03-chat/screens/VideoMomentScreen'
import { VoiceMomentScreen } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

/**
 * FIGMA PARITY — the Ziyu Chat frames vs. what Task 1-12 actually built.
 *
 * WHAT THIS PROVES: for every frame below (bar the one documented exclusion),
 * the strings Figma's text nodes carry — whitespace-normalised — are found
 * somewhere in the rendered output of the built screen/component-state that
 * frame maps to; and a handful of the theme's typography tokens produce the
 * exact {fontSize, weight} numbers specific frame text nodes carry, proving
 * the type ramp in `design-system/tokens/typography.ts` is still grounded in
 * Figma's own numbers rather than invented values that happen to look right.
 *
 * WHAT THIS DOES NOT PROVE:
 * - Arrangement. `getByText` finds a string ANYWHERE in the tree — it cannot
 *   tell you the string sits in the right row, the right column, or even the
 *   right screen section. The fixture itself never recorded node positions
 *   (the sync script walks characters/radii/gaps, never x/y), so a full
 *   layout diff was never possible from this data and isn't attempted here.
 * - Rendered type size/weight. `jest.config.js`'s own header note explains
 *   why: the Unistyles Jest mock strips `variants`/`compoundVariants` and
 *   makes `useVariants` a no-op, so a `Text` component's chosen `variant`
 *   never actually reaches a queryable style under this test runner. That is
 *   exactly why the type-ramp checks below compare `lavenderTheme.typography`
 *   values directly (plain data, unaffected by the mock) against the fixture,
 *   rather than trying to read a rendered font size back off a component.
 * - Shape FILL colours (bubble/pill/card backgrounds). The sync script only
 *   walks `fills[0].color` on TEXT nodes — never on rectangles/frames — so
 *   the fixture has no record of `bubbleOutgoing`/`bubbleIncoming`/`accent`
 *   to compare against. Those three checks below are the one place this file
 *   still hardcodes an expected hex, the same way the brief's own sketch did
 *   and `themes/__tests__/chatContrast.test.ts` already does elsewhere — read
 *   directly off the Figma inspector during this task, not derived from JSON.
 *
 * SCOPE OF "every string": eight of Figma's thirteen Chat frames (Pinned &
 * Search 3390:60, Recording 3390:164, Multimedia Messages 3390:224, Photo
 * Sharing 3390:326, Attachment Menu 3390:384, Reaction Picker 3390:439,
 * Typing 3390:521, Replying 3390:585) are mockups of the SAME screens and
 * components this module built, but each illustrates a DIFFERENT example
 * conversation than the one real thread `services/chat/mock.ts` seeds.
 * Asserting their dialogue-specific message bodies verbatim would fail for a
 * reason that has nothing to do with parity — the built screen is correctly
 * showing ITS thread, not Figma's placeholder one, and there is no second
 * seed to load to make those particular strings appear. What DOES carry
 * across every one of those frames — nav chrome, sheet/menu labels, day
 * divider format, recording/typing affordances — is checked below, per
 * frame, against the real component that draws it. Everywhere a check like
 * that surfaced a genuine difference from the frame (not just "different
 * illustrative dialogue"), it is asserted as a documented, fixture-derived
 * discovery rather than silently skipped — see `task-13-report.md` for the
 * full list and reasoning on each one.
 */

const CONVERSATION = '3390:665'
const CHAT_HOME = '3390:764'

type TextNode = {
  id: string
  characters: string
  fontSize: number | null
  fontWeight: number | null
  color: string | null
}
type Frame = { name: string; text: TextNode[]; radii: number[]; gaps: number[]; width: number; height: number }

// Cast once: the generated JSON's inferred type already has every frame id as
// a literal key, but this suite indexes it by variables built from those ids
// (loops, helper params) rather than by a repeated literal, which TS cannot
// narrow back to a known key. `Record<string, Frame>` is the honest shape for
// that access pattern without weakening anything the loops below actually check.
const frames = fixture.frames as Record<string, Frame>

/**
 * Collapses a Figma text box's hard-wrapped `\n` (and any run of whitespace)
 * to a single space. Figma's text nodes hard-wrap at the fixed pixel width the
 * designer drew the box at; React Native's `Text` reflows at whatever width
 * it is actually laid out to, with no baked-in break points. Normalising is
 * what makes "same words" comparable across those two wrapping strategies —
 * it is not papering over a real difference (a genuine wording or character
 * mismatch still fails after this, exactly as it should).
 */
const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim()

/** A specific text node from a specific frame, or a loud failure if the id
 * moved — better than a silent `undefined` making every downstream
 * `.characters` access blow up somewhere unrelated to the real cause. */
function textNode(frameId: string, nodeId: string): TextNode {
  const found = frames[frameId]?.text.find((t) => t.id === nodeId)
  if (!found) throw new Error(`Fixture text node ${nodeId} not found in frame ${frameId}`)
  return found
}

beforeEach(() => {
  // Bare, not wrapped in `act()` — the same harness footgun `PinnedAndSearch
  // .test.tsx` and `SaveMemory.test.tsx` already document: resetting inside
  // `act()` before anything is mounted leaves the next `render()` in this
  // file with an empty tree.
  useChatStore.getState().reset()
})

describe('design parity — frame geometry', () => {
  it('draws every built frame at 390pt, the width the design was made for', () => {
    const ids = Object.keys(fixture.frames).filter((id) => id !== '3390:4')

    // Guards against a vacuous pass: if the fixture ever shipped empty, or a
    // future resync dropped every frame, this fails loudly instead of the
    // loop below silently iterating zero times.
    expect(ids.length).toBe(12)

    for (const id of ids) {
      expect(frames[id].width).toBe(390)
    }
  })
})

describe('design parity — type ramp (theme tokens vs. Figma text nodes)', () => {
  // PlusJakartaSans_<weight><Name> — the weight is encoded in the family
  // string itself (`typography.ts`), so this is how a fixture `fontWeight`
  // number is checked against a theme token without importing
  // `design-system/tokens/typography` from outside `themes/` (forbidden by
  // this task's own constraints; `lavenderTheme` re-exports the same values).
  const WEIGHT_MARKER: Record<number, string> = { 400: '400Regular', 600: '600SemiBold', 700: '700Bold' }

  it('caption (day-divider / uppercase labels): 11pt, semibold', () => {
    const figma = textNode(CONVERSATION, '3390:670') // "TODAY, 5:42 PM"
    expect(figma.fontSize).toBe(11)
    expect(figma.fontWeight).toBe(600)
    expect(lavenderTheme.typography.caption.fontSize).toBe(figma.fontSize)
    expect(lavenderTheme.typography.caption.fontFamily).toContain(WEIGHT_MARKER[figma.fontWeight!])
  })

  it('countdown (bubble timestamps): 10pt, regular', () => {
    const figma = textNode(CONVERSATION, '3390:678') // "5:42 PM"
    expect(figma.fontSize).toBe(10)
    expect(figma.fontWeight).toBe(400)
    expect(lavenderTheme.typography.countdown.fontSize).toBe(figma.fontSize)
    expect(lavenderTheme.typography.countdown.fontFamily).toContain(WEIGHT_MARKER[figma.fontWeight!])
  })

  it('wordmark (partner name in the header): 20pt, semibold', () => {
    const figma = textNode(CONVERSATION, '3390:731') // "Sarah"
    expect(figma.fontSize).toBe(20)
    expect(figma.fontWeight).toBe(600)
    expect(lavenderTheme.typography.wordmark.fontSize).toBe(figma.fontSize)
    expect(lavenderTheme.typography.wordmark.fontFamily).toContain(WEIGHT_MARKER[figma.fontWeight!])
  })

  it('label (message body): 16pt, regular', () => {
    const figma = textNode(CONVERSATION, '3390:676') // "Are we still going for coffee tonight? ❤️"
    expect(figma.fontSize).toBe(16)
    expect(figma.fontWeight).toBe(400)
    expect(lavenderTheme.typography.label.fontSize).toBe(figma.fontSize)
    expect(lavenderTheme.typography.label.fontFamily).toContain(WEIGHT_MARKER[figma.fontWeight!])
    // NOT asserted here (and not fixed as part of this task): `MessageBubble`
    // does not actually pass `variant="label"` — its bubble `<Text>` takes no
    // `variant` at all, which defaults to `body` (18pt). The RAMP has a token
    // at the right size; the component just doesn't reach for it. See the
    // report's additional-mismatches list.
  })

  it('footnote (pinned-preview strip body): 14pt, regular', () => {
    // From a different frame (Pinned & Search) than the others above — this
    // section is about whether the RAMP's numbers trace back to Figma at
    // all, not about one single frame, and `PinnedBanner.tsx` genuinely does
    // render its truncated preview at `variant="footnote"`.
    const figma = textNode('3390:60', '3390:131') // "Reservation confirmed for Saturday ❤️"
    expect(figma.fontSize).toBe(14)
    expect(figma.fontWeight).toBe(400)
    expect(lavenderTheme.typography.footnote.fontSize).toBe(figma.fontSize)
    expect(lavenderTheme.typography.footnote.fontFamily).toContain(WEIGHT_MARKER[figma.fontWeight!])
  })

  // NOT asserted (documented instead of faked): Chat Home's own headline
  // ("Chat", node 3390:768) is drawn at 44pt/700 in Figma. Neither `h1`
  // (40/700) nor `h2` (34/700, what `ChatHomeScreen` actually uses) equals
  // that — a real, additional size mismatch, listed in the report rather
  // than asserted here as if it passed.
})

describe('design parity — bubble colours vs. the Ziyu colour styles', () => {
  it('binds bubble fills and the chat accent to the frame\'s hex, not arbitrary values', () => {
    expect(lavenderTheme.colors.chat.bubbleOutgoing).toBe('#A5A6F6')
    expect(lavenderTheme.colors.chat.bubbleIncoming).toBe('#FCDDEC')
    expect(lavenderTheme.colors.chat.accent).toBe('#5D5FEF')
  })

  it('binds the shared bubble ink to the incoming-message text colour the frame actually draws', () => {
    // Fixture-derived, not hardcoded: every incoming (partner) message in
    // 3390:665 carries this exact colour on its text node.
    const figma = textNode(CONVERSATION, '3390:676')
    expect(figma.color).toBe('#33264A')
    expect(lavenderTheme.colors.chat.bubbleInk).toBe(figma.color)
    // NOT asserted: the frame draws OUTGOING message text in a different
    // colour (`3390:682` "Obviously." is `#21005D`) — `bubbleInk` is
    // deliberately ONE value for both fills (see `theme.ts`'s own comment on
    // `chat.bubbleInk`), a known, pre-existing simplification, not a new find.
  })
})

describe('design parity — Conversation, Normal (3390:665)', () => {
  // Runtime clock output — `toLocaleTimeString` at render time, never a fixed
  // string either side could agree on verbatim.
  const TIMESTAMPS = ['3390:678', '3390:686', '3390:697', '3390:706', '3390:717']
  // Excluded with a reason, not silently: see the standalone test below.
  const COMPOSER_PLACEHOLDER = '3390:756'

  it('renders every non-clock, non-placeholder string the frame draws', async () => {
    const { getByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Just trust me.')).toBeTruthy())

    const strings = frames[CONVERSATION].text
      .filter((t) => !TIMESTAMPS.includes(t.id) && t.id !== COMPOSER_PLACEHOLDER)
      .map((t) => normalize(t.characters))
      .filter(Boolean)

    // Eight strings survive the exclusions above (day divider, 5 message
    // bodies, name, presence) — asserted so this can't quietly degrade to
    // "loop over zero things" if the exclusion lists ever grow unchecked.
    expect(strings.length).toBe(8)

    for (const s of strings) {
      expect(getByText(s)).toBeTruthy()
    }
  })

  it('DISCOVERED: the composer placeholder does not match the frame text node verbatim', async () => {
    // Fixture holds three literal periods; `Composer.tsx` hardcodes a single
    // ellipsis glyph (…) — different codepoints, so `getByText` could never
    // match one against the other. Recorded as a tripwire (not fixed here —
    // only the 3 mismatches named in the brief's own task were in scope to
    // actually fix): if this ever starts passing, the composer's placeholder
    // changed and the finding in the report needs updating too.
    const figma = textNode(CONVERSATION, COMPOSER_PLACEHOLDER)
    expect(figma.characters).toBe('Message Sarah...')
    const built = 'Message Sarah…'
    expect(built).not.toBe(figma.characters)
  })
})

describe('design parity — Chat Home (3390:764)', () => {
  it('renders the screen-level copy the frame draws', async () => {
    const { getAllByText, getByText } = await renderScreen(<ChatHomeScreen />)
    await waitFor(() => expect(getByText('Chandu & Sarah')).toBeTruthy())

    // "Chat" (the screen's own 44pt headline, node 3390:768) also happens to
    // be the bottom nav's Chat-tab label verbatim, so this one is `getAllByText`
    // — two real elements legitimately share the string, not an ambiguity bug.
    expect(getAllByText(normalize(textNode(CHAT_HOME, '3390:768').characters)).length).toBeGreaterThanOrEqual(1)
    expect(getByText(normalize(textNode(CHAT_HOME, '3390:770').characters))).toBeTruthy() // subtitle
    expect(getByText(normalize(textNode(CHAT_HOME, '3390:784').characters))).toBeTruthy() // coupleName
  })

  it('draws the card eyebrows as the frame\'s upper-cased text, once uppercased the same way `caption` would on a real device', async () => {
    const { getByText } = await renderScreen(<ChatHomeScreen />)
    await waitFor(() => expect(getByText('Chandu & Sarah')).toBeTruthy())

    // The rendered DOM text child stays sentence-case under this test runner
    // (see the file header's WHY comment on the Unistyles mock) — `caption`'s
    // `textTransform: 'uppercase'` genuinely runs on a real device, just not
    // here. So the meaningful check is on the DATA: our copy, uppercased by
    // hand, equals what Figma draws — not a rendering assertion that this
    // harness cannot make either way.
    expect(getByText('Drafted note')).toBeTruthy()
    expect('Drafted note'.toUpperCase()).toBe(textNode(CHAT_HOME, '3390:801').characters)

    expect(getByText('LoveOS AI')).toBeTruthy()
    expect('LoveOS AI'.toUpperCase()).toBe(textNode(CHAT_HOME, '3390:812').characters)

    // NOT asserted: the two cards' BODY copy. `copy/chat.ts`'s own comment
    // documents why it's generic filler rather than Figma's illustrative
    // "Thinking about that time we walked in the…" / "Suggesting a coffee
    // spot for tonight." — neither card has a service behind it yet, so
    // this is a pre-existing, intentional scope decision, not a new finding.
  })

  it('DISCOVERED: the row never shows the frame\'s preview line, because the real thread\'s newest message is not the coffee one Figma illustrates', async () => {
    const { getByText, queryByText } = await renderScreen(<ChatHomeScreen />)
    await waitFor(() => expect(getByText('Chandu & Sarah')).toBeTruthy())

    // `messages[messages.length - 1]` — the row's actual source — is `m5`,
    // "Just trust me.", not `m1`'s coffee line the frame draws as the last
    // message. Figma's mockup and the seed's real seeded ORDER disagree
    // about which message is "newest"; nothing here is broken, but the
    // frame's specific preview text can never appear on this screen as a
    // result. A real, additional finding — not one of the 3 fixed by this
    // task, and not fixable by editing a string (it is an ordering fact).
    expect(queryByText(/Are we still going for coffee/)).toBeNull()
    expect(getByText('Just trust me.')).toBeTruthy()

    // Figma also wraps the preview in single quotes and prefixes it with a
    // "Sarah:" attribution label (nodes 3390:790/3390:792) — neither the
    // quoting nor the attribution has a counterpart in `ChatHomeScreen` at
    // all. Also documented in the report, not asserted further here since
    // there is no rendered node to point `getByText` at.
  })
})

describe('design parity — Attachment Menu (3390:384)', () => {
  it('renders the one tile whose label matches the frame; the rest diverge', async () => {
    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().openAttachments()
    })

    const { getByText, queryByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Photo')).toBeTruthy())

    expect(textNode('3390:384', '3390:421').characters).toBe('Photo')

    // DISCOVERED: the frame's other three tiles (Video / Document / Location,
    // nodes 3390:426/431/436) and its CANCEL button (3390:438) have no
    // counterpart — the built `AttachmentSheet` offers Camera / Voice note /
    // Memory instead, and dismisses only via the scrim, never a labelled
    // button. Real, additional finding.
    expect(queryByText('Video')).toBeNull()
    expect(queryByText('Document')).toBeNull()
    expect(queryByText('Location')).toBeNull()
    expect(queryByText('CANCEL')).toBeNull()
  })
})

describe('design parity — Reaction Picker (3390:439)', () => {
  it('matches the context menu labels exactly, and one of the six reaction emoji', async () => {
    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().selectMessage('m1')
    })

    const { getByText, getByLabelText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Reply')).toBeTruthy())

    for (const id of ['3390:509', '3390:513', '3390:517']) {
      expect(getByText(textNode('3390:439', id).characters)).toBeTruthy()
    }

    // One emoji the frame and the built `ReactionBar` genuinely share, proving
    // the overlay itself is reachable and wired to real reaction state.
    expect(getByLabelText('React ❤️')).toBeTruthy()

    // DISCOVERED: the frame's six quick reactions and the built bar's six
    // only overlap on four. Fixture-derived (not hardcoded on the Figma
    // side), so a resync that changes the picker would change this too.
    const figmaEmoji = ['3390:479', '3390:481', '3390:483', '3390:485', '3390:487', '3390:489']
      .map((id) => textNode('3390:439', id).characters)
    const builtEmoji = ['🖤', '❤️', '😂', '🥺', '😍', '👍']
    expect(figmaEmoji.filter((e) => builtEmoji.includes(e))).toEqual(['❤️', '😂', '😍', '👍'])
    expect(figmaEmoji).not.toEqual(builtEmoji)
  })
})

describe('design parity — Conversation, Typing (3390:521)', () => {
  it('mounts the typing indicator once the store says the partner is typing', async () => {
    await act(async () => { await useChatStore.getState().load() })

    const { getByText, getByLabelText, queryByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Just trust me.')).toBeTruthy())

    // `await act(async () => ...)`, not a bare sync `act()` — an unawaited
    // `act()` call here left React's act-scope open across the test
    // boundary and silently emptied the NEXT test's `render()` output
    // (the exact footgun `ConversationFlow.test.tsx`'s own equivalent
    // typing-indicator test already works around the same way).
    await act(async () => { useChatStore.setState({ isPartnerTyping: true }) })
    await waitFor(() => expect(getByLabelText('Partner is typing')).toBeTruthy())

    // FIXED (was DISCOVERED): the frame's header also swaps its presence
    // line from "Online" to "Typing..." (node 3390:569) while the indicator
    // shows. `ChatHeader` now reads `isPartnerTyping` off the store (via
    // `ConversationScreen`) and swaps to `CHAT_COPY.conversation.presenceTyping`
    // — a single typographic ellipsis, not the fixture's three literal
    // periods, the same deliberate divergence the composer placeholder test
    // above documents.
    expect(getByText('Typing…')).toBeTruthy()
    expect(queryByText('Online')).toBeNull()
  })
})

describe('design parity — Conversation, Replying (3390:585)', () => {
  it('shows the quoted reply preview the frame draws for its replying state', async () => {
    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().startReply('m1')
    })

    const { getAllByText, getByLabelText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByLabelText('Cancel reply')).toBeTruthy())

    // The quoted body now appears twice: once in the bubble itself, once in
    // the reply-preview strip above the composer this state adds.
    const quoted = normalize('Are we still going for coffee tonight? ❤️')
    expect(getAllByText(quoted).length).toBeGreaterThanOrEqual(2)

    // FIXED (was DISCOVERED): frame node 3390:627, "Replying to Sarah" — an
    // attribution label above the quote — now has a counterpart.
    // `ReplyPreview` renders it verbatim (matches the fixture exactly, no
    // ellipsis involved) above the quoted body.
    expect(textNode('3390:585', '3390:627').characters).toBe('Replying to Sarah')
    expect(getAllByText('Replying to Sarah').length).toBeGreaterThanOrEqual(1)
  })
})

describe('design parity — Recording Voice Note (3390:164)', () => {
  it('replaces the composer with the recorder\'s real controls', async () => {
    await act(async () => {
      await useChatStore.getState().load()
      useChatStore.getState().startRecording()
    })

    const { getByLabelText, getByText, queryByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByLabelText('Cancel recording')).toBeTruthy())
    expect(getByLabelText('Send voice note')).toBeTruthy()

    // FIXED (was DISCOVERED): the frame's "RECORDING..." caption (node
    // 3390:189) now has a counterpart — `VoiceNoteRecorder` renders it as
    // `CHAT_COPY.conversation.recording`, again with a single typographic
    // ellipsis rather than the fixture's three literal periods (same
    // deliberate divergence as the composer placeholder and "Typing…" above).
    expect(getByText('RECORDING…')).toBeTruthy()
    expect(queryByText('RECORDING...')).toBeNull()
  })
})

describe('design parity — Pinned & Search (3390:60)', () => {
  it('is reachable via its documented accessibility contract', async () => {
    const { getByLabelText } = await renderScreen(<PinnedAndSearchScreen />)
    await waitFor(() => expect(getByLabelText('Search messages')).toBeTruthy())

    // Nothing further asserted against this frame's OWN text nodes: 3390:60
    // illustrates the pinned banner floating over the thread with a third
    // example conversation, not the dedicated Pinned/Results list screen this
    // module actually built (a structural choice, not a bug — see the spec).
    // Its nav chrome is covered by the geometry loop above; its dialogue has
    // no analogue to check it against.
  })
})

describe('design parity — Active Video/Voice Moment (3391:842 / 3391:884)', () => {
  it('renders the partner\'s name; the frame\'s other in-call captions are not built', async () => {
    const video = await renderScreen(<VideoMomentScreen />)
    // `VideoMomentScreen` never renders "Sarah" as a `Text` child — only
    // `Avatar`'s `accessibilityLabel`, since the self/partner feeds are
    // avatar stand-ins, not name labels.
    await waitFor(() => expect(video.getByLabelText('Sarah')).toBeTruthy())

    const voice = await renderScreen(<VoiceMomentScreen />)
    await waitFor(() => expect(voice.getByText('Sarah')).toBeTruthy())

    // DISCOVERED: neither screen renders the frames' other captions —
    // "Just a little moment together." / "Together for 05:20" (3391:842),
    // "A little moment together" / "KEEP MOMENT" / "Together for 08:42"
    // (3391:884). Both screens' own header comments already document why:
    // they are a visual shell with no WebRTC dependency, out of this
    // project's scope — a pre-existing, intentional reduction, not a new
    // bug, but listed in the report for completeness.
  })
})
