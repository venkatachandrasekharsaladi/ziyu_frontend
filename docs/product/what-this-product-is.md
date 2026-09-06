# What this product is

[← Product docs index](../PRODUCT.md)

## 1. What this product is

**Inferred from the frontend**, which is the only source of truth available — the
backend is being built separately and does not exist in this workspace.

LoveOS (branded **Ziyu** in the Figma file) is a **mobile app for a couple** —
exactly two paired people. It is not a social network, not a dating app, and has
no admin, no roles beyond "me" and "partner", and no multi-tenancy.

Three things it currently does:

1. **Onboards a couple and captures their story** — how they met, first date,
   when they became "us", key dates, a first memory.
2. **Gives them a private conversation** — chat with reactions, photos, voice
   notes, and voice/video "Moments".
3. **Keeps a shared archive** — memories with photos, captions, notes, albums,
   search, and an "on this day" resurfacing route.

**Inference, flagged as such:** the copy (`src/copy/`) is warm, second-person and
unmistakably aimed at an established couple rather than a new one — "Your
memories are waiting", "Now, let's begin your story", "Welcome Home". The sample
content describes a couple with years of history (Rome, Paris, a first date in
2022). The product assumes a relationship that already has a past worth
archiving.

### 1.1 Users

One user type, two instances: **partner A** (who signs up) and **partner B** (who
is invited). There is no third party anywhere in the UI.

The audit found an important asymmetry: **partner A's flow is built; partner B's
is not.** See `LOV-001`.

### 1.2 A note on the audit template

This audit was requested with a template built for B2B SaaS — tables, bulk
actions, saved views, exports, role permissions, admin dashboards, command
palettes. Those sections are answered where they translate and marked **not
applicable** where they do not. A two-person consumer app has no records to
bulk-edit and no roles to permission. Force-fitting them would produce
recommendations that make the product worse.

---

## 2. Current product map

| Module | Lines | State |
|---|---|---|
| `module-03-chat` | 2,778 | Built — 5 screens, 16 components |
| `module-01-onboarding` | 1,905 | Built — 21 screens |
| `module-00-auth` | 1,616 | Built — 6 screens |
| `module-03-memories` | 1,318 | Built — 7 screens |
| `module-02-home` | 999 | Built — 3 screens |
| `module-05-profile` | 124 | **Barely started** — 1 screen |
| `module-04-timeline` | 0 | **Empty scaffolding**, tab stubbed `live: false` |
| `module-06-memories` | 0 | **Empty**, duplicates `module-03-memories` |

Shared: 11 primitives, 14 patterns, 4 components, 48 routes, 2 themes.

**Everything is mock.** No backend, no persistence, no network calls of any kind
(`fetch`, `axios`, `WebSocket` all absent from `src/`). The only outbound traffic
is Unsplash image loading.

---
