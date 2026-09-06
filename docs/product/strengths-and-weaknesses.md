# Strengths and weaknesses

[← Product docs index](../PRODUCT.md)

## 3. Current strengths

Worth stating, because the weaknesses list is long and the codebase is genuinely
better than most at this stage.

1. **The design system is disciplined.** Tokens for colour, spacing, radii,
   typography, elevation and now layout. A test asserts no untokenised colour
   exists outside `tokens/`. Another asserts contrast ratios in both themes.
   Most products this age have neither.
2. **Two complete themes**, with a parity test that makes a missing key a
   compile error.
3. **Consistent screen composition** — 40 of 43 screens go through a shared
   layout.
4. **Service boundaries are honest.** Every service is a typed interface with a
   mock behind a one-line swap point. Replacing mocks with a real backend is a
   one-line change per service.
5. **The copy is genuinely good** — specific, warm, and not templated. This is
   rarer than good code and harder to buy.
6. **1,964 tests**, running against both themes.

---

## 4. Current weaknesses — the three patterns

Three independent audits found the same shape. This is the most useful finding
in the document, because one cause explains all of it.

### 4.1 Display is finished; creation and mutation are not

- A memory **cannot be edited or deleted**. `MemoriesService` exposes only
  `list`, `get`, `create`, `toggleFavorite`, `search`. For a permanent archive, a
  typo is permanent. (`audit/home-memories-profile.md`)
- **The Add Memory photo picker is an empty function** —
  `onPickPhoto = useCallback(() => {}, [])`. Every memory a real user creates is
  text-only, in an app that is photo-first everywhere else.
- Album screens are **hardcoded to `SAMPLE_ALBUMS`**, not gated by
  `USE_SAMPLE_CONTENT` like the rest of the app, so they can never show a real
  couple's content.

### 4.2 The happy path is built; the edges are not

- **No auth or pairing guard anywhere.** `(app)/_layout.tsx` is a bare `<Stack>`.
  Every screen is directly reachable without signing in or pairing. Invisible
  today because nothing persists; a real access-control hole the moment a
  backend lands.
- **No empty, loading, error or offline components exist.** Every screen
  improvises its own `length === 0` branch. "Loading" means rendering chrome with
  no children. There is zero offline handling.
- **Nothing persists.** Close the app at onboarding screen 19 and you restart at
  Welcome.

### 4.3 Single-user flows work; two-party flows do not

And this is a two-party product.

- **Pairing cannot actually complete between two devices.** Partner A's
  `InvitationSentScreen` never learns B redeemed the code — no polling, no shared
  session. The mock issues one fixed code (`L8V7QK`).
- **Skipping pairing is a permanent dead end.** "Do this later" leads to a story
  wizard that assumes a partner, then Home — and **no screen in the signed-in app
  offers pairing.** Verified by grepping the whole `(app)` group.
- Onboarding is **21 screens** (24 Welcome-to-Home), roughly triple comparable
  apps, and the 9-tap shortcut reaches Home having never paired.

**The common cause:** the app was built screen-first from Figma frames. Figma
draws screens. It does not draw guards, empty states, error paths, or the second
person's device.

---
