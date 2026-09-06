# LoveOS — Product docs index

**Start here.** Product understanding, research, audits, feature ideas,
priorities, decisions and build status live in this folder, one topic per file.
This page is the map — it holds no content of its own, so nothing here needs
updating when a document changes.

Content last updated: 2026-09-01 · Split into topic files: 2026-09-06

---

## Conventions

Every idea has a **stable ID** (`LOV-nnn`). Update an entry's status rather than
creating a new one. Rejected and deferred ideas stay documented **with the
reason**, so the same idea is not relitigated from scratch every quarter.

Status values: `Proposed` · `Approved` · `In progress` · `Implemented` ·
`Deferred` · `Rejected`

Section numbers (`§5`, `§7.2`) are kept from when this was one file — they are
still the addressing scheme inside each document, and cross-document references
name the file as well as the section.

## Where to start, depending on why you are here

| You want to… | Go to |
|---|---|
| Run a team discussion | [discussion-guide.md](discussion-guide.md) — 10 minutes, five decisions, four real disagreements |
| Decide what to build next | [product/backlog.md](product/backlog.md), then [product/feature-entries.md](product/feature-entries.md) |
| Know what is broken | [product/strengths-and-weaknesses.md](product/strengths-and-weaknesses.md), or [audit/](audit/) for screen-by-screen |
| Know what is built and what is mocked | [build-status.md](build-status.md) |
| Know who approved what | [decision-log.md](decision-log.md) |
| Check the evidence behind a claim | [research/](research/) |

## The one thing to know before reading anything else

**Two people on two devices cannot currently pair.** Partner A generates a code
and never learns whether B redeemed it; the mock issues one fixed code. And if a
user taps "Do this later", no screen anywhere in the signed-in app offers
pairing.

A two-person app that two people cannot use together. Everything else is
downstream of that.

---

## Product — decisions and roadmap

| File | What is in it |
|---|---|
| [product/what-this-product-is.md](product/what-this-product-is.md) | §1 what the product is, who it is for, what it is not · §2 the current product map |
| [product/strengths-and-weaknesses.md](product/strengths-and-weaknesses.md) | §3 what is genuinely good · §4 the three patterns behind everything that is weak |
| [product/domain-research.md](product/domain-research.md) | §5 what the market, the studies and the category's reviews actually say |
| [product/backlog.md](product/backlog.md) | §6 the prioritised backlog, `LOV-001`–`LOV-020`, with status and priority |
| [product/feature-entries.md](product/feature-entries.md) | §7 the long-form entry for each backlog item — problem, evidence, shape, cost |
| [product/frontend-and-backend-work.md](product/frontend-and-backend-work.md) | §8 what can start today with no backend · §9 what needs backend coordination first |
| [product/ai-and-automation.md](product/ai-and-automation.md) | §10 where AI helps and where it is the wrong answer · §11 automation opportunities |
| [product/blind-spots.md](product/blind-spots.md) | §12 what we are not thinking about |
| [product/roadmap.md](product/roadmap.md) | §13 the sequence, and why it is in that order |
| [product/open-questions.md](product/open-questions.md) | §14 open product questions · §17 research still needed |
| [product/deferred-and-rejected.md](product/deferred-and-rejected.md) | §15 deferred · §16 rejected — both with the reason, so they are not relitigated |
| [product/change-log.md](product/change-log.md) | §18 what changed in these documents, and when |

## Team and status

| File | What is in it |
|---|---|
| [discussion-guide.md](discussion-guide.md) | A three-person conversation: five decisions, the four real disagreements, and the question nobody has answered |
| [build-status.md](build-status.md) | What exists, what is mocked, what the tests cover |
| [decision-log.md](decision-log.md) | Approvals with quotes, and rulings made unasked — each with what it costs if wrong |

## Screen audits

38 screens plus the design system, audited against the code.

| File | What is in it |
|---|---|
| [audit/auth-onboarding.md](audit/auth-onboarding.md) | Sign-in, sign-up, and the 21-screen onboarding flow — including the pairing dead end |
| [audit/home-memories-profile.md](audit/home-memories-profile.md) | The signed-in app: home dashboard, memories, profile |
| [audit/design-system.md](audit/design-system.md) | Tokens, primitives and patterns — what is shared, what is duplicated, what is missing |

## Research

The evidence the rest of these documents rest on.

| File | What is in it |
|---|---|
| [research/couples-app-strategy.md](research/couples-app-strategy.md) | The market and the competitors, 41 sources — the long one |
| [research/couples-real-problems.md](research/couples-real-problems.md) | What couples actually struggle with, and which of it software can touch |
| [research/competitor-ui-patterns.md](research/competitor-ui-patterns.md) | Patterns worth stealing, and patterns that backfire |
| [research/shortlist.md](research/shortlist.md) | The ranked shortlist of what to build |
| [research/codebase-ideas.md](research/codebase-ideas.md) | Ideas drawn from the codebase itself |
