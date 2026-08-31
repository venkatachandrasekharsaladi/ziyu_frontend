# Decision log

Every decision that changed this product: what changed, **who decided it**, when,
how it was expressed, and what it actually does in the code.

Two kinds of entry, and the distinction is the point of the file:

- **Approved by Praveen** — he was asked and answered. His words are quoted.
- **Ruled by Claude** — nobody was asked. A judgement call was made mid-build
  because stopping would have cost more than being wrong. Each carries what it
  costs if it turns out wrong, so it can be found and reversed.

**Record starts 2026-08-30.** Earlier work (auth 08-13, pairing 08-14, story
08-15, api contract 08-16, memories 08-23) predates this log; its reasoning lives
in `docs/superpowers/specs/` and in commit messages.

---

## 2026-08-30 — Chat module

### Approved by Praveen

| # | Decision | How it was asked | His answer | What it does in the code |
|---|---|---|---|---|
| A1 | **Data layer: mock, not a real backend** | Offered mock / mock+persistence / real backend | "Mock service, same pattern (Recommended)" | `src/services/chat/` — in-memory, one-line swap point in `index.ts`. Nothing persists. |
| A2 | **Palette: chat-scoped, contrast-safe** | Offered chat-scoped / re-palette whole app / ignore new styles | "Chat-scoped, contrast-safe (Recommended)" | Fuschia + Iris added to `tokens/colors.ts`; only chat consumes them. Fuschia barred from body text (measured 3.09:1). |
| A3 | **Scope: the 13 drawn frames only** | Offered drawn frames / + call stats / everything in the backlog | "Build the 13 drawn frames only (Recommended)" | Call stats, in-chat notes, calendar booking and the photo widget were backlogged, not built. |
| A4 | **Design parity: structural + agent review** | He asked "Which one do you think is best?" rather than choosing | Deferred to Claude's recommendation | Claude recommended structural parity with a committed fixture; pixel-diff and Playwright were rejected with reasons. See R12. |
| A5 | **Spec approved** | Spec written, review requested | "yes go ahead" | `docs/superpowers/specs/2026-08-30-chat-module-design.md` became the binding contract. |
| A6 | **Execution: subagent-driven** | Offered subagent-driven / inline | "1" | 16 tasks, each with a fresh implementer, a review, and its own commit. |
| A7 | **Run all remaining tasks** | Asked whether to continue or pause after task 9 | "please continue and complete all the tasks" | Tasks 10–16 ran without further check-ins. |
| A8 | **Integration: keep local** | Offered keep local / push to origin/dev / feature branch + PR | "Keep local, I'll handle it" | Nothing pushed. All commits remain on local `dev`. |

### Ruled by Claude — no approval sought

These were decided during the build. Each says what it costs if wrong.

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R1 | `load()` must guard against double-subscription | Two screens mounting in one session would subscribe twice and duplicate every partner message | A reset that stops listening; visible immediately in tests |
| R2 | AttachmentSheet's photo tile gets label "Choose photo" | Two elements labelled "Photo" make an accessibility query ambiguous | A screen-reader label slightly more verbose than its visible text |
| R3 | The plan's `memoriesService.create({note, mediaUri})` was wrong on three counts | The real API requires `title`, `date`, `tags`, uses `photoUri`, and returns a `Result` union | One task's test rewritten |
| R4 | Stop instructing implementers to run prettier | **An implementer refused and was right** — the repo has no prettier config, so bare prettier rewrites against house style | None; formatting stays hand-matched |
| R5 | Implement the spec's failed-send retry rather than cut it | `'failed'` was declared but never emitted anywhere; the spec promised retry | One extra fix round on two files |
| R6 | **Task 6 must build the conversation header** — the plan never did | Found by grepping all 16 briefs: without it, the Moment screens would be unreachable dead routes and the journey test would have no trigger | A larger diff than the brief specified |
| R7 | Park the Save-Memory failure UX | No toast primitive existed anywhere; building one is a design-system task, not a chat task | A user whose save fails sees nothing — later fixed, see A11 |
| R8 | **Overruled by the review, and accepted** | Claude proposed hiding the Pinned section during search; the reviewer showed that was an invented mode-switch discarding what the user came for | n/a — the reviewer's fix shipped |
| R9 | Document, don't fix, the Figma parity divergences | Several are product decisions, and the type-ramp values are theme tokens shared with every module | The build differs from the frames in listed, visible ways |
| R10 | Disclose rather than build `MessageGroup` | Cosmetic spacing; building it would restructure a thread renderer four tasks had stabilised | Consecutive messages keep uniform spacing |
| R11 | Fix the `set-state-in-effect` lint error | Real React anti-pattern in shipped code, found by the QA agent because **no task ever ran lint** | A re-render change on one screen |
| R12 | Reject pixel-diff and Playwright for design parity | Font rasterisation varies per machine; `react-native-web` renders shadows and blur unlike native, so both would report unreal differences | Parity checks values, not arrangement |
| R13 | Park the same-minute duplicate accessibility label | The cross-component collision was fixed; what remains is two same-kind captionless messages in one minute | A screen reader hears the same description twice |

---

## 2026-08-31 — Images, transient states, error surface

### Approved by Praveen

| # | Decision | His words | What it does |
|---|---|---|---|
| A9 | **Fix the mismatched images** | "I found something unrelated like showing 'Coffee' but the image is unrelated… please use all related images to it" | Root cause: `picsum.photos` **hashes** seeds rather than searching them. Replaced with 21 hand-verified Unsplash photos in `src/sample/photos.ts`. |
| A10 | **Fix the two flagged gaps** | "Fix it" | The Save-Memory error surface (closing R7) and the three transient states Figma drew. |
| A11 | **Replace weak icons and emoji** | "also replace the best icons/emojis with existed" | Reaction set `🖤❤️😂🥺😍👍` → `❤️😂🥹😍👍✨`. |

### Ruled by Claude

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R14 | Curated Unsplash IDs over keyword services | `source.unsplash.com` is dead (503); `loremflickr` burns watermarks into pixels; Openverse indexes amateur work. **Every photo was opened and looked at** — a first pass at recalled IDs produced a bearded-man portrait for "couple laughing", the exact reported bug | A photo that reads as wrong to Praveen but not to Claude |
| R15 | Keep `❤️` throughout the onboarding copy | Coherent brand voice across 13 screens; not the reported problem | none |
| R16 | Do **not** change the send icon from `arrow-up` to `send` | Both are conventional — iMessage uses an up arrow. Taste, not a defect | none; reversible in one line |
| R17 | Do not add a composer emoji button, though the frame draws one | It would open nothing — another inert control | The composer differs from the frame |

---

## 2026-09-01 — Responsiveness, broken controls, research

### Approved by Praveen

| # | Decision | His words | What it does |
|---|---|---|---|
| A12 | **Every page must work on all mobile screens, with one lever** | "use a best components so that i can easily handle the entire website with one chnage" | `src/design-system/tokens/layout.ts` — `column` is now the single lever. Previously the same value was hardcoded in five places. |
| A13 | **Find and fix what isn't working** | "Check some are not working for example Sign out etc" | Sign out was gated behind `Alert.alert`, **unimplemented in react-native-web** — the dialog never appeared, so the handler never ran. |
| A14 | **Research and suggest** | "use another agent for go through the entire app and analyse all the resources, researchs, use real cases and suggest me" | `docs/research/couples-app-strategy.md`, 729 lines with sources. |
| A15 | **Numbered progress updates** | "everytime i use claude then please add the points that are working or what we work through 1, 2, 3, 4" | Saved to Claude's persistent memory; applies to all future sessions. |
| A16 | **Write it all down** | "have you added these all points in md file?" | `docs/STATUS.md` and this file. The prior build's ledger had been deleted by process, taking the reasoning with it. |

### Ruled by Claude

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R18 | **Add no dependencies without asking** | Six controls need `expo-clipboard`, `expo-image-picker`, or `expo-auth-session` + credentials. Installing changes `package.json` and risked the running dev server | Six controls stay disabled until Praveen decides |
| R19 | Make unfixable controls **visibly disabled**, not silently inert | Follows the `live: false` pattern already in `appNav.ts`. A control that looks pressable and does nothing is worse than one that looks unavailable | Four buttons look unavailable rather than absent |
| R20 | Prioritise phones (320–430pt), not tablets | He said "all mobile screens" | Tablet layout stays a centred column |
| R21 | Commit to `dev` rather than a feature branch | The spec and plan commits were already there, and Memories and Home landed the same way | 39 commits on a shared branch; still unpushed, so cleanly movable |

---

## Outstanding — nobody has decided these yet

| # | Question | Blocked on |
|---|---|---|
| O1 | Add `expo-clipboard`, `expo-image-picker`, `expo-auth-session`? | Praveen's call. Unblocks six controls. |
| O2 | What should the reaction overflow and header overflow open? | Needs no package — needs a design decision. |
| O3 | Build persistence and the Daily Question? | The research argues the core hypothesis is untestable without it. |
| O4 | Add unpair / export / delete? | Verified absent from `src/`. Both the breakup and the safety question. |
| O5 | Triage the seven Figma divergences | Listed in `docs/qa/chat-test-cases.md`. |
| O6 | Push, or move to a feature branch? | 39 commits local on `dev`. |

---

## How to keep this file honest

Add an entry when a decision changes what the product does or defers something.
Quote the approval rather than paraphrasing it — "he was fine with it" is not a
record. For a ruling made without asking, always write the cost of being wrong;
that sentence is what makes it reversible later.
