# Research: shortlist

[← Product docs index](../PRODUCT.md)

## The shortlist — best ideas, ranked


The two-minute version. `couples-app-strategy.md` (729 lines, 41 sources) is the
research; this is the ranking, and the ranking is a judgement call rather than a
finding. Argue with it.

The ordering principle: **value per unit of build cost**, weighted toward things
that are cheap now and expensive later.

---

### 1. The reciprocity gate — the single best idea here

Partner A answers today's question. **A's answer stays hidden until B answers.**

One mechanic, three problems:

- **Retention.** A now has a self-interested reason to nudge B, so the app never
  has to guilt anyone into opening it. The JMIR study observed this happening
  organically — partners reminding each other.
- **Dual adoption.** The structural killer of this category, attacked without
  coercion mechanics.
- **Content.** The value becomes the partner's answer rather than the question,
  so "content runs dry" — 22% of the category's bad reviews — stops applying in
  the way it applies to everyone else.

And it is *small*. A `prompt` variant on the message union already built:
`MessageBubble`, `Composer`, `chatStore`. Everything else below is bigger and
worth less.

**How you know it worked:** reciprocity completion — the share of prompts where
*both* partners answered. Not opens.

---

### 2. The invite carries content, not an empty account

Instead of "Chandu invited you to LoveOS" → signup form, partner B receives:

> **Chandu answered today's question. Answer to see it.**

B arrives with a reason to exist in the first ten seconds instead of an
onboarding flow. This is a copy-and-routing change, not an engineering project —
the cheapest high-leverage item on the list, and it only works if (1) exists.

---

### 3. Answered prompts write themselves into Memories

Memories opens **empty** for a real couple. The populated grid only looks good
because `src/sample/` fills it. This makes the couple's own answers the archive,
so it accretes without anyone curating it.

Cold start solved, and the archive compounds — which is the one asset the
competition does not have.

---

### 4. Design the exit — nobody wants to build this, build it anyway

Export, pause, unpair. Verified absent from `src/` today.

Cheap now because it constrains the pairing schema; brutally expensive to
retrofit. When Couple shut down, its users had to fight to get their shared
history out, and that is the failure the category still remembers.

It is also the safety answer, which matters more than it sounds: shared intimate
data inside a controlling relationship becomes a weapon. A quiet exit — export
and unpair reachable without notifying the partner — is a safety feature, not a
settings screen.

---

### 5. Long-distance positioning — costs nothing

Not a build. A store-listing change.

It is the only framing under which the 5,164 lines of chat and the two Moment
screens read as a strategic asset rather than a sunk cost, and long-distance
couples have the highest daily-contact motive of any segment.

The cheapest experiment available. *Speculative — worth an ASO test, not a
roadmap commitment.*

---

### 6. One price per couple — also costs nothing

Paired charges roughly $75–80/year **per person** and gets named for it in
reviews repeatedly. Cupla prices per couple.

This is free differentiation on a decision not yet made. Do not set the price
until W4 dual-active retention is known — pricing an unproven product is
guessing — but decide the *shape* now.

---

### Good idea, wrong quarter

**The photo widget / "mini Snap"** from the founder's backlog is genuinely good.
Locket proved the format. But it is a **distribution** play, not a retention
play, and a widget on an app nobody opens daily is a widget nobody installs.

Two preconditions: a real backend with background refresh, and a proven daily
habit. Right idea, later.

---

### The one to cut outright, not defer

**Call and video statistics** — "you have called each other n times… 22 hours
totally."

A quarter of WebRTC work, and it is a surveillance artefact. In a controlling
relationship, cumulative call time becomes evidence to be held against someone.
This is not a scheduling problem; it should not be built.

---

### The one-sentence version

Stop building a messenger. Build a **ritual** — one question a day, hidden until
you both answer, that quietly becomes your shared archive.

---

### What this ranking assumes

Worth stating, because if any of these is wrong the order changes:

1. **That the daily-prompt evidence transfers.** The JMIR study is
   cross-sectional and self-selected; reverse causation is not ruled out. It is
   the best evidence in the category, which is not the same as strong evidence.
2. **That the archive is the defensible asset.** If couples do not value
   retrospection as much as the sample content assumes, (3) and the whole
   Memories investment weaken together.
3. **That chat is not the product.** Well-supported by the graveyard, but note
   the tension: the top recommendation lives *inside* the chat surface. The
   argument is against messenger *features*, not against the surface itself.
