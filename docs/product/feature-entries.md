# 7. Detailed feature entries

[← Product docs index](../PRODUCT.md)

## LOV-001 — Make two-device pairing actually work

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow
- **Problem:** Two people on two devices cannot complete pairing. Partner A's
  `InvitationSentScreen` never learns B redeemed the code; there is no polling
  and no shared session. The mock issues one fixed code, `L8V7QK`.
- **Evidence:** [`docs/audit/auth-onboarding.md`](../audit/auth-onboarding.md). "Partner sync breaks" is 16% of
  the category's bad reviews ([domain research](domain-research.md) §5.2).
- **Current:** A generates a code, sees a static "sent" screen forever.
- **Proposed:** A sees live state — invited → opened → paired. B receives a deep
  link that opens straight into acceptance.
- **The pattern to copy — Marco Polo** (`competitor-ui-patterns.md`): make the
  invite **non-blocking**. Content can be created *before* the invitee joins, and
  redemption **unlocks** it rather than flipping a silent flag. This reframes the
  bug: the problem is not only that A never learns B joined, it is that A has
  nothing to do while waiting. Pair this with the strategy doc's
  invite-carries-content idea — B receives *"Chandu answered today's question.
  Answer to see it."* — and the invite becomes the product's first moment rather
  than a form.
- **Also worth copying — Cupla** names the "wrong-account problem" explicitly in
  its support docs and makes it self-diagnosable. That is the closest real
  analogue to this app's actual failure symptom.
- **Where it fits:** `InvitePartnerScreen`, `InvitationSentScreen`,
  `EnterPartnerCodeScreen`, `PartnerFoundScreen`.
- **Frontend:** polling or subscription state, live status UI, deep-link handling.
- **Backend:** real code issuance, redemption, and a pair record. **Coordinate.**
- **Success:** two real devices complete pairing without manual intervention.
- **Confidence:** High. This is not an opinion; the flow is provably incomplete.

## LOV-002 — A pairing entry point in the signed-in app

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE
- **Problem:** "Do this later" in onboarding leads to a story wizard that assumes
  a partner, then Home — and **no screen in the signed-in app offers pairing.**
  The skip button is a trapdoor.
- **Evidence:** verified by grepping the entire `(app)` route group.
- **Proposed:** a persistent, dismissible prompt on Home while unpaired, plus a
  pairing entry in Profile.
- **Complexity:** Low. Reuses `InvitePartnerScreen`.
- **Confidence:** High.

## LOV-003 — Photo picker on Add Memory

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE+
- **Problem:** `onPickPhoto = useCallback(() => {}, [])`. Every memory a real
  user creates is text-only, in an app that is photo-first on every other screen.
  The curated grid can only ever be filled by sample data.
- **Frontend:** `expo-image-picker` (**not installed — needs approval**).
- **Backend:** image upload and storage. **Coordinate.**
- **Risk:** permissions handling on both platforms; large-image resizing.
- **Confidence:** High.

## LOV-004 — Edit and delete a memory

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE+
- **Problem:** `MemoriesService` has no `update` or `delete`. A typo in a
  permanent archive is permanent. This is also half of the breakup problem
  (`LOV-010`) — you cannot remove anything.
- **Proposed:** edit on the detail screen; delete with the existing
  `ConfirmDialog`; soft-delete with a recovery window rather than hard delete.
- **Risk:** in a shared archive, whether one partner may delete a shared memory
  is a **product question, not a technical one.** Open — see [open questions](open-questions.md) §14.

## LOV-005 — Route guards

- **Status:** Proposed · **Priority:** P0 · **Category:** Security · **Dep:** FE
- **Problem:** `(app)/_layout.tsx` is a bare `<Stack>`. Every screen is reachable
  without signing in or pairing. Harmless today because nothing persists; a real
  access-control hole the moment a backend exists.
- **Proposed:** redirect in each group layout based on auth and pairing state.
- **Confidence:** High. **Tell the backend developer now**, not later.

## LOV-007 — The Daily Question with a reciprocity gate

- **Status:** Proposed · **Priority:** P1 · **Category:** Retention · **Dep:** FS
- **Problem:** Nothing gives a couple a reason to open this daily. The archive is
  retrospective; chat competes with iMessage and loses.
- **Evidence:** the only mechanic in the category with published support ([domain research](domain-research.md) §5.3).
  Paired's core loop. *Caveat: the study is cross-sectional and self-selected.*
- **Proposed:** one question a day, delivered as a `prompt` variant on the
  existing chat message union. **Partner A's answer is masked until B answers.**
- **Why the gate matters — one mechanic, three problems:** retention (A now has a
  self-interested reason to nudge B, so the app never guilts anyone), dual
  adoption (attacked without coercion), and content (the value becomes the
  partner's answer, so "content runs dry" stops applying).
- **Where it fits:** `MessageBubble`, `Composer`, `chatStore` — extends what
  exists rather than adding a surface.
- **Success:** **reciprocity completion** — share of prompts where *both*
  answered. Not opens, not DAU.
- **Confidence:** Medium-high on the mechanic; medium on the evidence quality.

## LOV-009 — Shorten onboarding

- **Status:** Proposed · **Priority:** P1 · **Category:** Activation · **Dep:** FE
- **Problem:** 21 screens, ~triple comparable apps, and nothing persists — so any
  interruption restarts it. `PartnerFoundScreen` and `ConfirmPartnerScreen` ask
  the same question back to back.
- **Proposed:** minimum viable path is account → pair → in. Story capture moves
  to a prompted, resumable activity afterwards — which also feeds `LOV-007` and
  `LOV-012`.
- **Confidence:** High on the problem. Medium on the remedy — the story data is
  what makes Home and Timeline valuable, so deferring it has a cost.

## LOV-010 — Export, pause and unpair

- **Status:** Proposed · **Priority:** P1 · **Category:** Trust and safety · **Dep:** FS
- **Problem:** None of these exist anywhere in `src/`. For an app holding a
  couple's intimate data this is both the breakup question and the safety
  question.
- **Evidence:** when Couple shut down, users had to fight to get their history
  out. Shared intimate data in a controlling relationship becomes an instrument
  of control.
- **Proposed:** *Take my copy* (export, always available, per person) · *Pause our
  space* (reversible, freezes writes, keeps reads — for the fight that is not the
  end) · *Unpair* (either side, both notified, grace window).
- **Note:** cheap now because it constrains the pairing schema; expensive later.
- **Safety requirement:** export and unpair must be reachable **without
  generating a notification the other partner sees.**

## LOV-012 — Draw the Timeline from story data already collected

- **Status:** Proposed · **Priority:** P1 · **Category:** Activation · **Dep:** FE
- **Problem:** Onboarding spends 21 screens capturing a narrative — `met`,
  `firstDate`, `becameUs`, `firstMemory`, `keyDates` — and there is no screen that
  tells it back. `module-04-timeline` has no `.tsx` files; its tab is
  `live: false`.
- **Why it is cheap:** store, types, mock service, copy and nav slot all exist.
  Mostly composition.
- **Tension, stated honestly:** this would be a *third* retrospective surface
  alongside Home and Memories, and [domain research](domain-research.md) argues the product has too many already.
  **Reconciliation:** build it as where answered prompts accumulate — so
  `LOV-007` ships first and this follows it.

## LOV-013 — Make the "Drafted note" card real

- **Status:** Proposed · **Priority:** P2 · **Category:** Differentiation · **Dep:** FE+
- **Problem/opportunity:** `src/copy/chat.ts` defines a Chat Home card reading
  *"A little something is being written for you."* It has no service behind it and
  is non-interactive.
- **Proposed:** a place for the thing you are not ready to send — the
  half-written apology, the note to be found later.
- **Why it rates:** for couples the unsent thought is often the important one,
  nothing in the category has it, and it works **asymmetrically** — valuable even
  when only one partner uses it, which matters given dual adoption.
- **Open question:** private until sent, or does the partner see *something* is
  being written? The copy implies the latter — more interesting, and more
  dangerous for an unhappy couple.

## LOV-014 — Reciprocal private notes on a memory

- **Status:** Proposed · **Priority:** P2 · **Category:** Differentiation · **Dep:** FS
- **Proposed:** each partner writes a private note on a shared memory; neither is
  revealed until both have. `Memory.note` exists today as a single shared field.
- **Why:** makes the archive active rather than retrospective, and gives an old
  photo a reason to be reopened. Applies the `LOV-007` mechanic to the asset
  competitors lack.
- **Confidence:** Speculative. Not seen in the category — either an opportunity
  or a sign it does not work. Cheap enough to find out.

## LOV-017 — A repair signal

- **Status:** Proposed · **Priority:** **P1 (raised from P2, 2026-09-01)** ·
  **Category:** Differentiation · **Dep:** FS
- **Why raised:** `couples-real-problems.md` ranks conflict repair as **the best
  mechanistic fit of any problem** for a chat-and-memory product — asynchronous,
  low-arousal, opt-in — and finds it unaddressed by LoveOS today. This idea was
  proposed from intuition before that research existed; the two arrived at the
  same conclusion independently.
- **Problem:** every app here helps couples connect when things are already fine.
  None help in the hour after an argument, when neither person knows how to
  start — which is when relationships are actually decided.
- **Evidence:** repair attempts are the part of Gottman's work that holds up
  ([domain research](domain-research.md) §5.3).
- **Proposed:** one non-verbal signal — "I'm ready when you are" — sendable
  without having to find words.
- **Risk:** highest emotional value here and the highest execution risk. Done
  badly it trivialises a real moment. In a controlling relationship, "why haven't
  you sent it yet" becomes a new pressure surface.

---
