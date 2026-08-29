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

Per-layer, using the existing `src/test/renderScreen.tsx` and `contrast.ts`:

- **Service** — `mock.test.ts`: send lifecycle, reactions, pin toggle, search,
  subscribe/unsubscribe, timer injection
- **Store** — optimistic send, failed-send retry, reply target lifecycle,
  overlay mutual exclusion (reaction overlay and attachment sheet never co-open)
- **Components** — one test per component covering both themes; contrast
  assertions for every bubble/label pair in §8.1
- **Screens** — a flow test per screen mirroring `MemoriesFlow.test.tsx`:
  every frame state must be reachable by user action

## 11. QA agent

`.claude/agents/qa-tester.md` — the repo's first subagent. Read-only plus test
execution; it reports, it does not fix.

Checks:

1. `npm run typecheck`, `npm test`, `npm run lint`
2. Contrast assertions via `src/test/contrast.ts` across both themes
3. No hardcoded hex outside `design-system/tokens/`
4. Every interactive element carries an `accessibilityLabel`
5. Every frame state in §4 is reachable by user action in a flow test
6. No component imports a service directly (the §3 rule)

Output: pass/fail per check with `file:line` evidence, ranked by severity. No
"looks good" without a command and its output.

## 12. Out of scope

Backlogged from the Chat section's requirements note (`3391:926`) — none are
drawn, each needs its own design pass:

- Call stats — times called, video called, cumulative duration
- Note taking in chat and calls
- Calendar booking
- Photo sharing widget, "mini version of snap"

## 13. Known repo inconsistencies (flagged, not fixed here)

- `module-03-chat/` and `module-03-memories/` share the number 03; memories
  claims `M03-Sxx` in its screen doc comments. Chat screens therefore document
  themselves by Figma frame name and node id rather than an `Mxx-Sxx` code.
- `module-06-memories/` is empty scaffolding duplicating `module-03-memories/`.
  Candidate for deletion, out of scope for this work.
