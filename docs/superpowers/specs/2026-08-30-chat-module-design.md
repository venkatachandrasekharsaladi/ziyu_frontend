# Chat module — design

**Date:** 2026-08-30
**Status:** Approved, ready for implementation planning
**Figma:** `Ziyu` — file `BDMFuyYb2I2ZMmaEz5gBAZ`, page `0:1`, section **Chat** `3390:3`
**Module:** `src/modules/module-03-chat/`

---

## 1. Purpose

LoveOS pairs exactly two people. Chat is the conversation between them: text,
photos, voice notes, reactions, and live voice/video "Moments". It is the third
tab in the bottom bar and, by volume, the screen the couple will open most.

The design draws 13 frames. They are not 13 screens — most are *states* of a
single conversation view. This document maps frames to code, fixes the defects
the designer flagged, and defines the contract the mock service must satisfy.

## 2. Decisions taken

Three scoping decisions were made before design, and they bound everything
below:

| Decision | Choice | Consequence |
|---|---|---|
| Data layer | Mock service, same pattern as `memories`/`auth` | No backend, no new dependency; real-time swaps in at one line later |
| Palette | Chat-scoped, contrast-safe | Fuschia/Iris enter `tokens/colors.ts` but only Chat consumes them; no other module changes |
| Scope | The 13 drawn frames only | Call stats, notes, calendar booking, and the photo widget are backlogged |

## 3. Architecture

Layered exactly as `module-03-memories`:

```
services/chat/          types + mock + one-line swap point
  ↓
module-03-chat/state/   zustand store (thread, draft, overlays)
  ↓
module-03-chat/components/   presentational, no service imports
  ↓
module-03-chat/screens/      composition only
  ↓
app/(app)/chat/*.tsx    one-line re-export shims
```

The rule that makes this testable: **components never import the service.** They
receive data and callbacks. Screens wire the store to the components. This is
what lets the QA agent render any state deterministically.

## 4. Route map

Routes are one-line re-export shims, matching `app/(app)/memories/index.tsx`.

| Route | Screen | Figma frames covered |
|---|---|---|
| `chat/index.tsx` | `ChatHomeScreen` | Chat Home `3390:764` |
| `chat/conversation.tsx` | `ConversationScreen` | Normal `3390:665`, Typing `3390:521`, Replying `3390:585`, Multimedia `3390:224`, Attachment Menu `3390:384`, Reaction Picker `3390:439`, Recording Voice Note `3390:164`, Photo Sharing `3390:326` |
| `chat/search.tsx` | `PinnedAndSearchScreen` | Pinned & Search `3390:60` |
| `chat/moment/voice.tsx` | `VoiceMomentScreen` | Active Voice Moment (Refined) `3391:884` |
| `chat/moment/video.tsx` | `VideoMomentScreen` | Active Video Moment (Refined) `3391:842` |

### 4.1 The frame that is deliberately not built

**Media & Memories Bridge `3390:4`** is a Memories grid — "Our memories" header,
Photos/Videos/Documents tabs — that duplicates the shipped `MemoriesHomeScreen`.
Its hamburger header also contradicts the `AppHeader` pattern used everywhere
else in `(app)`.

Its *intent* — moving a chat moment into Memories — ships instead as the
**Save Memory** action in the message context menu, which writes through
`memoriesService`. That is the actual bridge. Building the frame literally would
create a second, divergent Memories screen.

## 5. Data layer — `src/services/chat/`

Four files, mirroring `src/services/memories/`:

- `types.ts` — the contract
- `mock.ts` — `createMockChatService()`
- `index.ts` — `export const chatService = createMockChatService()` (the swap point)
- `__tests__/mock.test.ts`

### 5.1 Types

```ts
type MessageKind = 'text' | 'photo' | 'voice' | 'video'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read'

type Reaction = { emoji: string; authorId: string }

type Message = {
  id: string
  authorId: string          // 'me' | partner id
  kind: MessageKind
  body?: string             // text content, or voice transcript
  mediaUri?: string         // photo/voice/video payload
  durationMs?: number       // voice + video only
  replyToId?: string
  reactions: Reaction[]
  pinned: boolean
  sentAt: string            // ISO
  status: MessageStatus
}
```

### 5.2 Service surface

```ts
listMessages(): Promise<Message[]>
sendMessage(input: { kind; body?; mediaUri?; durationMs?; replyToId? }): Promise<Message>
react(messageId: string, emoji: string): Promise<Message>
togglePin(messageId: string): Promise<Message>
search(query: string): Promise<Message[]>
subscribe(listener: (event: ChatEvent) => void): () => void
```

`ChatEvent` is `{ type: 'typing'; isTyping: boolean }` or
`{ type: 'message'; message: Message }` or
`{ type: 'status'; messageId: string; status: MessageStatus }`.

### 5.3 Mock behaviour

The mock makes the thread feel alive without a backend:

- Seeds the conversation from `Conversation — Normal` verbatim, so the built
  screen matches the frame on first run
- On send: emits `sending` immediately, then `sent` → `delivered` → `read` on
  short timers
- After an outgoing text message reaches `read`, emits `typing: true`, then a
  canned partner reply, then `typing: false`. Media sends do not trigger a
  reply, so a photo or voice send can be asserted in isolation.
- Every timer is injectable, so tests run without waiting on wall-clock

All timing constants live in one exported object so tests can zero them.

## 6. State — `module-03-chat/state/chatStore.ts`

Zustand, following `src/state/relationshipStore.ts`:

```
messages, isPartnerTyping
draft, replyTarget
selectedMessageId      // drives the reaction overlay
isRecording, recordingStartedAt
attachmentSheetOpen
pendingPhotoUri        // drives Photo Sharing confirm state
```

Sends are optimistic: the bubble appears at `sending` before the service
resolves. A failed send marks the message and offers retry rather than silently
dropping it.

## 7. Components — `module-03-chat/components/`

| Component | Responsibility |
|---|---|
| `MessageBubble` | One message; incoming/outgoing, all four kinds |
| `MessageGroup` | Consecutive same-author messages, shared avatar/spacing |
| `DayDivider` | "TODAY, 5:42 PM" pill |
| `ReadReceipt` | Single/double tick, read state tinted |
| `TypingIndicator` | Animated three-dot bubble |
| `ReplyPreview` | Quoted message above the composer, and inside a reply bubble |
| `Composer` | Input, `+`, emoji, mic; grows to a cap then scrolls |
| `AttachmentSheet` | Bottom sheet, 342pt |
| `ReactionBar` | Long-press emoji row + overflow `+` |
| `MessageContextMenu` | Reply / Copy / Save Memory |
| `VoiceNoteRecorder` | Recording overlay, elapsed time, cancel/send |
| `VoiceNotePlayer` | Waveform, play/pause, duration |
| `PhotoMessage` | Photo bubble with aspect-preserving thumbnail |
| `PhotoSharePreview` | Pre-send confirm with caption field |
| `PinnedBanner` | Pinned message strip at thread top |
| `CallControls` | Mute / camera / end, shared by both Moment screens |

## 8. Palette

Add to `tokens/colors.ts` (raw values, per that file's existing rule that
nothing outside `themes/` imports it):

```
fuschia100 #EF5DA8   fuschia80 #F178B6   fuschia60 #FCDDEC
iris100    #5D5FEF   iris80    #7879F1   iris60    #A5A6F6
```

Exposed on the theme as chat-scoped semantic names only:
`chatBubbleOutgoing`, `chatBubbleIncoming`, `chatAccent`, `chatAccentSoft`.

### 8.1 Measured contrast — binding constraints

| Pair | Ratio | Verdict |
|---|---|---|
| Fuschia/100 text on white | 3.09:1 | large text only |
| Fuschia/100 on app background | 2.93:1 | **fails** |
| White label on Fuschia/100 fill | 3.09:1 | large text only |
| Iris/100 text on white | 4.83:1 | passes AA |
| Iris/100 on app background | 4.58:1 | passes AA |
| White label on Iris/100 fill | 4.83:1 | passes AA |
| ink900 on Fuschia/60 bubble | 11.00:1 | passes AA |
| ink900 on Iris/60 bubble | 6.19:1 | passes AA |

**Rules this imposes:**

1. Fuschia/100 never carries body text and never hosts a white label at body size
2. Interactive accents and any small coloured text use Iris/100
3. Bubble fills use the `/60` tints under existing `ink900`

These are asserted as unit tests, not left to review.

## 9. Corrections to the design

The designer's own note on the Home section says components are misaligned. Three
defects are corrected rather than reproduced:

1. **Bubble leading-edge band** — incoming bubbles render a darker vertical strip
   on the leading edge. It is a misaligned overlay, not a design element. Dropped.
2. **Mid-word truncation** — Chat Home preview cuts at "going for c…". Truncates
   at a word boundary instead.
3. **Unlabelled icon controls** — video, call, overflow, `+`, emoji, and mic are
   icon-only. Every one gets an `accessibilityLabel`.

## 10. Testing

### 10.1 Per layer

Using the existing `src/test/renderScreen.tsx` and `contrast.ts`:

- **Service** — `mock.test.ts`: send lifecycle, reactions, pin toggle, search,
  subscribe/unsubscribe, timer injection
- **Store** — optimistic send, failed-send retry, reply target lifecycle,
  overlay mutual exclusion (reaction overlay and attachment sheet never co-open)
- **Components** — one test per component covering both themes; contrast
  assertions for every bubble/label pair in §8.1
- **Screens** — a flow test per screen mirroring `MemoriesFlow.test.tsx`:
  every frame state must be reachable by user action

### 10.2 A-Z journey test

One end-to-end test, `screens/__tests__/ChatJourney.test.tsx`, walking the whole
module in a single session the way a couple would use it — no remounting between
steps, so state leaks between screens are caught:

1. Land on Chat Home, see the conversation row and its preview
2. Open the conversation; the seeded thread renders in order with day dividers
3. Type and send text; assert `sending → sent → delivered → read`
4. Partner typing indicator appears, then the reply lands
5. Long-press a message; the reaction bar and context menu open
6. React; the emoji attaches and persists in the thread
7. Reply to a message; the quote shows in the composer and in the sent bubble
8. Open the attachment sheet; assert the reaction overlay closed first
9. Send a photo; the preview confirms, then the photo bubble renders
10. Record and send a voice note; the player renders with a duration
11. Save Memory from the context menu; assert it reaches `memoriesService`
12. Pin a message; the pinned banner appears at thread top
13. Open Pinned & Search; find the pinned message and a text match
14. Start a Voice Moment, then end it; return to the thread
15. Start a Video Moment, then end it; return to the thread
16. Back out to Chat Home; the preview reflects the newest message

Step 16 is the one that catches the most bugs — it proves the list and the
thread read the same source.

### 10.3 Test-case catalogue

`docs/qa/chat-test-cases.md` — a written catalogue, IDs `CHAT-001` upward, each
row carrying: id, screen, Figma node, precondition, steps, expected result,
automated (yes/no), and the test file asserting it. Grouped by screen, with a
final group for cross-screen journeys.

Manual-only cases are marked as such rather than omitted — gesture-dependent
behaviour (long-press duration, swipe-to-reply feel, haptics) and live media
capture cannot be asserted in jest, and pretending otherwise hides real gaps.
The catalogue is the checklist a human runs before release; the automated
subset is what CI enforces.

## 11. Design parity — Figma vs built UI

Two halves, split along what each method can actually establish.

### 11.1 Structural parity (automated)

A script, `scripts/sync-figma-chat.mjs`, reads the Chat frames through the Figma
REST API and writes `src/modules/module-03-chat/__fixtures__/figma-chat.json` —
per frame: node id, name, frame size, and for every text and container node its
characters, colour, font size, font weight, line height, corner radius, padding,
and gap.

`__tests__/DesignParity.test.tsx` asserts the built screens against that fixture:

- Every string drawn in Figma appears in the built screen. The one documented
  exception is the mid-word truncation (§9, item 2), which is asserted as the
  corrected behaviour — the fixture records the frame's string, the test asserts
  the word-boundary version.
- Bubble fills, accents, and ink resolve to the same values the frame uses
- Font sizes and weights match the frame's text nodes
- Corner radii and the 4pt spacing steps match

The fixture is committed. Re-running the script produces a diff, so a design
change becomes a reviewable commit rather than a silent divergence. The script
takes a Figma token from the environment and never hardcodes one.

**What this cannot establish:** that the arrangement is right. Correct values in
a wrong flex direction pass. §10.1's ordering assertions and §11.2 cover it.

### 11.2 Visual review (agent-judged)

The QA agent renders each built screen, opens the corresponding Figma PNG
(`scripts/` writes them alongside the fixture), and reports differences in
layout, hierarchy, and proportion that structural parity cannot see. Findings
are reported with the frame's node id and a description, ranked by severity.

This is deliberately a report, not a gate — a human decides whether a difference
is a defect or an intentional correction from §9.

## 12. QA agent

`.claude/agents/qa-tester.md` — the repo's first subagent. Read-only plus test
execution; it reports, it does not fix.

Checks:

1. `npm run typecheck`, `npm test`, `npm run lint`
2. The A-Z journey test (§10.2) passes end to end
3. Structural design parity (§11.1) passes against the committed fixture
4. Contrast assertions via `src/test/contrast.ts` across both themes
5. No hardcoded hex outside `design-system/tokens/`
6. Every interactive element carries an `accessibilityLabel`
7. Every frame state in §4 is reachable by user action in a flow test
8. No component imports a service directly (the §3 rule)
9. Every catalogue case (§10.3) marked automated names a test that exists and
   actually asserts it — the check that stops the catalogue rotting
10. Visual review (§11.2): built screen against Figma PNG, differences reported
    with node ids

Output: pass/fail per check with `file:line` evidence, ranked by severity. No
"looks good" without a command and its output. A check that could not be run
is reported as blocked, never as passed.

## 13. Out of scope

Backlogged from the Chat section's requirements note (`3391:926`) — none are
drawn, each needs its own design pass:

- Call stats — times called, video called, cumulative duration
- Note taking in chat and calls
- Calendar booking
- Photo sharing widget, "mini version of snap"

## 14. Known repo inconsistencies (flagged, not fixed here)

- `module-03-chat/` and `module-03-memories/` share the number 03; memories
  claims `M03-Sxx` in its screen doc comments. Chat screens therefore document
  themselves by Figma frame name and node id rather than an `Mxx-Sxx` code.
- `module-06-memories/` is empty scaffolding duplicating `module-03-memories/`.
  Candidate for deletion, out of scope for this work.
