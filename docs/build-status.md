# Build status

[← Product docs index](PRODUCT.md)

### 1. What exists

#### 1.1 There is no backend, and never has been

This repository is the Expo frontend only. No server, no database, no API, no
hosting. Verified: a grep for `fetch(`, `axios`, `XMLHttpRequest` and
`WebSocket` across `src/` returns nothing. `src/services/api/generated/` holds
only a `.gitkeep`.

Every "service" is a typed boundary with an in-memory fake behind it. The word
means a swap point, not a server:

| Service | First added | Kind |
|---|---|---|
| `auth` | 2026-08-13 | mock |
| `pairing` | 2026-08-14 | mock |
| `story` | 2026-08-15 | mock |
| `memories` | 2026-08-23 | mock |
| `chat` | 2026-08-30 | mock |

Each `index.ts` is one line — `export const chatService = createMockChatService()`
— so a real provider replaces one line per service and nothing else.

**Nothing persists.** `src/state/relationshipStore.ts` says so deliberately:
"Nothing persists. There is no token or record to keep until a real provider
exists." No `expo-secure-store`, no MMKV, no AsyncStorage anywhere.

The only outbound network traffic is image loading: sample photos are fetched
from Unsplash's CDN by `expo-image` at render time. Read-only, and those are
placeholder assets meant to be replaced with the couple's real photographs.

#### 1.2 Modules

Built, with real screens: `module-00-auth`, `module-01-onboarding`,
`module-02-home`, `module-03-chat`, `module-03-memories`.

Empty scaffolding — directories and `.gitkeep` only: `module-04-timeline`,
`module-06-memories`, and most of `module-05-profile` beyond the Our Space
screen.

`module-03-chat` and `module-03-memories` share the number 03, and
`module-06-memories` duplicates the memories module's name. Cosmetic, but
confusing; noted rather than renamed.

#### 1.3 Test and quality state

At the time of writing: **168 suites, 1964 tests passing**, `tsc --noEmit`
clean. The suite runs twice, once per theme (`lavender`, `midnight`).

One caveat worth keeping: an intermittent single-test failure was observed once
in six full-suite runs (~17%). It did not reproduce in isolation — the chat
module passed 238/238 across six runs, and `design-system/__tests__` passed
28/28 across six. It appears only under full-suite load and has not been
identified. It is not in the newest code.

---

### 2. Work completed in the 2026-08-30 → 09-01 sessions

#### 2.1 The chat module

Five screens covering 12 of the 13 Figma frames in the `Ziyu` file's Chat
section. Most frames are *states* of one conversation screen rather than
separate destinations.

| Route | Screen |
|---|---|
| `chat/index` | Chat Home |
| `chat/conversation` | Conversation — thread, typing, replying, reactions, attachments, photo share, voice recorder |
| `chat/search` | Pinned & Search |
| `chat/moment/voice` | Voice Moment |
| `chat/moment/video` | Video Moment |

Frame `3390:4` "Media & Memories Bridge" is deliberately not built — it
duplicates the shipped Memories home. Its intent ships as the **Save Memory**
action in the message context menu.

#### 2.2 Bugs found and fixed

These were found by review or by the QA agent, not by the original
implementation:

1. **Data loss.** `chatStore.load()` replaced the message list wholesale, and a
   failed send lives only in store state — so every chat screen mount silently
   deleted the user's unsent text. Now merges.
2. **`retry()` was unreachable.** It existed and was tested, but nothing called
   it, so the spec's promise that a failed send "offers retry" shipped as dead
   code. A failed bubble now carries a retry control.
3. **Photo captions were discarded at two boundaries** — the send path dropped
   the argument, and `MessageBubble` rendered the photo *instead of* the body.
4. **Sign out was unreachable on web.** It was gated behind `Alert.alert`, which
   react-native-web does not implement, so the confirmation never appeared and
   the handler never ran. Replaced with a cross-platform `ConfirmDialog`.
5. **`isSigningOut` never reset**, leaving the button stuck.
6. **`react-hooks/set-state-in-effect`** in `PinnedAndSearchScreen` — a real
   React anti-pattern that passed eleven task reviews because every task ran
   jest and typecheck but nobody ran lint on the module.
7. **Duplicate accessibility labels** reachable in ordinary use — a bodyless
   message bubble's fallback label collided with the composer's input label,
   and read receipts, photos and voice notes each collided with their own kind.
8. **A 320pt layout overflow** in `CodeInput`: six 44pt boxes plus five 8pt gaps
   needs 304pt against 280pt available on an iPhone SE. The onboarding code
   entry was broken on the smallest supported phone.
9. **Two vacuous tests** — assertions that could never execute, one guarded
   behind an `if` that was never true.

#### 2.3 Sample photography

The root cause of mismatched images: every photo was
`picsum.photos/seed/loveos-<subject>`. The seeds read as meaningful
(`rome-coffee`, `flowers`, `candles`) but **picsum does not search — it hashes
the seed to pick an arbitrary photo.** Deterministic, and blind to the seed's
meaning. So a coffee caption sat over a landscape.

Replaced with 21 hand-curated Unsplash photos in `src/sample/photos.ts`, each
one fetched and visually inspected. Keyword services were tried and rejected:
`source.unsplash.com` is dead (503), `loremflickr` burns attribution watermarks
into the pixels, and Openverse indexes mostly amateur work.

#### 2.4 Layout — the single lever

`src/design-system/tokens/layout.ts` now holds `column` (448), `columnWide`
(480) and `columnNarrow` (384). Before this the same value was hardcoded in five
places across two layouts and one screen.

**To change the content width app-wide, edit `column` in that one file.**

40 of 43 screens compose through a shared layout (`AppScreenLayout`,
`AuthScreenLayout`, `StatusScreen`). The three that do not are `WelcomeScreen`
(a hero screen) and the two chat Moment screens (deliberately full-bleed).

`breakpoints.ts` declares `xs: 0` and `md: 768`. Note that Unistyles' inline
breakpoint syntax does not resolve under this repo's Jest mock — verified by
spike — so `useWindowDimensions()` is used where a breakpoint needs to be
testable.

#### 2.5 QA tooling

`.claude/agents/qa-tester.md` — a read-only agent that runs the suites and
checks design parity, contrast, layering and accessibility. It reports; it never
fixes. On its first run it found the lint error above that eleven prior reviews
had missed, and it critiqued its own definition, which was then sharpened.

Note: new agent definitions only register after a Claude Code restart.

---

### 3. Controls that do not work, and why

Everything here is **visibly disabled**, following the `live: false` pattern
already used in `src/copy/appNav.ts` for unbuilt nav tabs. None of them are
silently inert — a control that looks pressable and does nothing is worse than
one that looks unavailable.

| Control | Blocked on |
|---|---|
| Google / Apple sign-in (4 buttons across Sign In and Create Account) | `expo-auth-session` **plus real provider credentials** |
| Attachment sheet → Camera | `expo-image-picker` or `expo-camera` |
| Message context menu → Copy | `expo-clipboard` |
| Invitation screen → Copy Code | `expo-clipboard` |
| Reaction bar → more reactions | **No package needed** — no design yet |
| Chat header → More options | **No package needed** — no design yet |

No dependency was added without your decision. All three packages are
first-party Expo and small.

---

### 4. Design divergences from the Figma frames

Recorded in full in `docs/qa/chat-test-cases.md`. Deliberately unfixed and
awaiting triage — several are product decisions rather than defects.

1. Attachment sheet sources — the frame draws Photo / Video / Document /
   Location / Cancel; the build has Photo / Camera / Voice note / Memory and no
   Cancel. "Voice note" and "Memory" arguably suit a two-person app better than
   "Document" and "Location".
2. Chat Home's preview line lacks the frame's "Sarah:" attribution and quotes.
3. Composer placeholder matches no frame, and the frames disagree with each
   other.
4. Type ramp — message body renders 18pt against the frame's 16pt, timestamps
   11pt/600 against 10pt/400, nav 12pt title-case against 11pt caps, Chat Home
   headline 44pt against the theme's 40/34. **These are theme tokens shared with
   every module**, so changing them is a design-system change reaching far
   beyond chat, and the contrast suite is built on the current ramp.
5. Copy does not copy (see §3).
6. Three of the four attachment tiles are inert (see §3).
7. `MessageGroup` was specified in the chat design §7 for shared spacing on
   consecutive same-author messages, and never built. It vanished between spec
   and plan. Disclosed rather than built, because adding it now restructures a
   thread renderer that four tasks stabilised.

One divergence in the spec's own text was found to be wrong and corrected: §9
claimed the Chat Home frame "truncates mid-word". It does not — the text node
holds the full string and the frame visually *clips* it. Word-boundary
truncation is still the better behaviour and stayed; the stated reason was
fixed.

---

### 5. Open decisions

#### 5.1 Dependencies

Whether to add `expo-clipboard`, `expo-image-picker`, and `expo-auth-session`
(the last also needs provider credentials). Unblocks six controls in §3.

#### 5.2 The strategic one

[`docs/research/couples-app-strategy.md`](research/couples-app-strategy.md) argues the product's central hypothesis
is currently **untestable**: nothing persists and neither partner can be
notified, so "will a couple open this daily?" cannot be answered by the build
that exists.

Its recommendation, in short: a backend for one narrow slice; a reciprocal daily
prompt implemented as a variant on the existing chat message union, with the
partner's answer masked until you answer; answered prompts auto-writing into
Memories to solve cold start.

Its "do not build" list includes two items from the Figma backlog —
call/video statistics (a quarter of WebRTC work, and a coercive-control
artefact) and the marketplace/ads.

Read that document before acting on this. Its evidence is caveated where thin,
and it should be argued with rather than obeyed.

#### 5.3 No unpair, export, or delete exists

Verified absent from `src/`. For an app holding a couple's intimate data this is
both the breakup question and the safety question — shared intimate data can
become an instrument of control. Currently unaddressed anywhere in the product.

#### 5.4 Nothing is pushed

All work is local on `dev`, which tracks `origin/dev` and is shared. `dev` is 75
commits ahead of `main`. The repository does use feature branches
(`feat/m00-auth-cluster` exists), so these commits arguably belong on one —
they went to `dev` because the spec and plan commits were already there and the
Memories and Home modules landed the same way.

---
