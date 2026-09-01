# Team discussion guide

**For:** the three of you, before deciding what to build next.
**Read time:** 10 minutes. The detail is in `PRODUCT.md`; this is the agenda.

The point of this document is to make the argument efficient. It names the
decisions that actually need making, and — more usefully — the places where the
evidence genuinely conflicts, so you spend the meeting on real disagreements
rather than re-deriving the same facts three times.

---

## Before the meeting — 10 minutes each

Everyone reads this file. Then one document each, so all three perspectives are
in the room:

| Person | Reads | Comes ready to argue |
|---|---|---|
| Whoever owns product | `docs/PRODUCT.md` §4, §12 | What is broken and what we are not thinking about |
| Whoever owns frontend | `docs/audit/` (three files) | What is cheap to fix now versus what needs the backend |
| Whoever owns strategy | `docs/research/shortlist.md` + `couples-real-problems.md` §1 | Which problems are worth solving at all |

---

## The one fact everything else depends on

**Two people on two devices cannot currently pair.** Partner A generates a code
and never learns whether B redeemed it. The mock issues one fixed code
(`L8V7QK`). And if a user taps "Do this later", **no screen anywhere in the
signed-in app offers pairing** — the skip button is a trapdoor.

So today, this two-person app cannot be used by two people together.

Everything below is downstream of that. If the meeting only produces one
decision, make it this one.

---

## Decision 1 — What is the next thing built?

The two candidates are both defensible and they pull in different directions.

**Option A — fix the plumbing.** Pairing, persistence, route guards, photo
picker, edit/delete. Unglamorous. But without it there is no product to test and
no way to answer any other question.

**Option B — build the Daily Question.** One question a day, partner's answer
masked until you answer. The only mechanic in this category with published
evidence, and small in code — a variant on the chat message type you already
have.

**The honest tension:** B is the more interesting bet and the research's top
recommendation, but B *requires* A. A prompt neither partner can be notified
about, in an app where nothing persists, cannot be evaluated. You can build B's
UI now against mocks — but you cannot learn anything from it.

**A suggested resolution to argue with:** do the narrow slice of A that unblocks
B specifically — accounts, pairing, one shared object, push — rather than a
complete backend. Then B.

---

## Decision 2 — Three dependencies, yes or no

`expo-clipboard`, `expo-image-picker`, `expo-auth-session` (the last also needs
Google/Apple credentials). All first-party Expo, all small.

They unblock six controls that are currently visibly disabled, including
**adding a photo to a memory** — which today is an empty function, meaning every
memory a real user creates is text-only in a photo-first app.

I did not add them without your call. This one should take thirty seconds.

---

## Decision 3 — Who is this for?

The research recommends **cohabiting unmarried couples, 1–5 years**, because the
archive's value scales with history already accumulated, and your onboarding
(`days-that-matter`, `first-date`, `first-memory`) already targets exactly them.

The alternative worth arguing: **long-distance**. It is a store-listing change
rather than a build, has the highest daily-contact motive of any segment, and is
**the only framing in which your 2,778 lines of chat are a strategic asset rather
than a sunk cost.**

You do not have to pick permanently. But the answer changes whether the Moment
screens are worth finishing.

---

## Decision 4 — Onboarding is 21 screens

24 from Welcome to Home. Roughly triple comparable apps. Nothing persists, so any
interruption restarts it. Two screens ask the same question back to back.

**But** the story it collects is what makes Home, Calendar and Occasions
worthwhile, and would make Timeline worthwhile.

Cutting it is obviously right and not obviously free. Decide what the minimum
path to a paired couple is, and what moves to afterwards.

---

## Decision 5 — Pricing shape (not the number)

Paired charges roughly **$75–80/year per person** and is criticised for it
repeatedly in reviews. Cupla charges per couple.

Do not set a number before you know retention. Do decide the shape — per-couple
is free differentiation on a decision you have not yet made.

---

## The four real disagreements

Where the evidence genuinely conflicts. These deserve the argument.

**1. Is the chat module an asset or a mistake?**
The graveyard is unambiguous: Couple and Tuned both built a private two-person
messenger, both reached real scale, both died — killed by iMessage, not by
rivals. The research says stop investing.
*But* its own top recommendation, the Daily Question, lives **inside** that chat
surface. The argument is against messenger *features*, not the surface. Someone
should push on whether that distinction is real or a rationalisation.

**2. Should Timeline be built?**
It is the cheapest real feature available — the data exists, the store exists,
the tab is stubbed. *But* it would be a **third** retrospective surface, and the
research argues you already have too many. Proposed reconciliation: build it as
where answered prompts accumulate, so it follows the Daily Question rather than
preceding it.

**3. The repair signal — highest value or highest risk?**
Two independent routes reached it: intuition from reading your code, and the
problems research ranking conflict repair as the best mechanistic fit for a
chat-and-memory product. That convergence is the strongest signal in the whole
exercise.
*But* it is also the easiest to get wrong. Done badly, a button trivialises a
real moment. And in a controlling relationship, "why haven't you sent it yet"
becomes a new pressure surface.

**4. How much can software actually do here?**
Uncomfortable, and worth facing together: most of the highest-prevalence couple
problems rank **low** on software tractability. Communication breakdown is
physiological, not informational. The mental load is not a list problem — the
cognitive *noticing* is the labour, which is why years of shared-task apps have
not moved it.
If that is right, the honest product is narrower than the ambition. Better to
agree on that now than discover it in reviews.

---

## The question nobody has answered

**What does this app do when a couple is not happy?**

Every screen assumes affection. There is no design for a couple mid-fight, for
one partner who has checked out, or for a relationship that is ending. Those are
not edge cases — at any moment they are a large share of any real user base.

Related, and currently absent from the code entirely: **no unpair, no export, no
delete.** That is both the breakup question and the safety question, since shared
intimate data in a controlling relationship becomes a weapon.

The category's own posture is telling. Lasting's reviewers concede it *"is
unlikely to save a marriage where one partner is disengaged."* You can decide
that is fine and out of scope — but decide it deliberately, and say so in the
product rather than implying otherwise.

---

## What can start immediately, whatever you decide

None of these need the backend or a dependency:

1. A pairing entry point in the signed-in app — closes the trapdoor
2. Route guards on `(app)` and `(onboarding)` — nothing currently checks anything
3. Empty / loading / error components — none exist; every screen improvises
4. Gate the album screens behind `USE_SAMPLE_CONTENT` — they can never show real data today
5. Merge the two duplicate confirmation screens
6. Delete the empty `module-06-memories`

---

## A note on the state of the code

Worth saying, because the problem lists above are long: the codebase is in good
shape. Tokenised design system with tests that enforce it, two complete themes,
consistent screen composition, honest service boundaries, 1,964 tests, and copy
that is genuinely well written.

The gaps are not sloppiness. They follow from having built screen-first from
Figma frames — and Figma does not draw guards, empty states, error paths, or the
second person's device. That is a normal place to be, and it is fixable in a
known order.
