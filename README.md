# LoveOS — frontend

A private app for a couple: exactly two paired people. Chat, a shared memory
archive, and the story of how they got here.

**This repository is the Expo frontend only.** There is no server, database or
API in it — every service is a typed boundary with an in-memory fake behind it.
See [TECH.md](TECH.md#backend-integration--start-here) if you are wiring up a
backend; that is the fastest way in.

---

## Requirements

| | |
|---|---|
| Node | 20 LTS or newer |
| npm | 10+ (repo uses `package-lock.json` — don't switch to yarn/pnpm) |
| Expo SDK | ~57 |
| Android | Android Studio + an emulator, only for `npm run android` |
| iOS | Xcode + a simulator, macOS only |

You do **not** need Android Studio or Xcode to work on this. The web target
runs everything and is the fastest loop.

## Getting started

```bash
npm install
cp .env.example .env     # see TECH.md — safe to leave defaults while on mocks
npm run web
```

That serves the app at `http://localhost:8081`. If that port is busy Expo will
ask to use another; pass one explicitly with `npx expo start --web --port 8090`.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Expo dev server, pick a target from the menu |
| `npm run web` | Web target — the fastest loop, no emulator needed |
| `npm run android` | Build and run on a connected device/emulator |
| `npm run ios` | Build and run on a simulator (macOS only) |
| `npm test` | Full Jest suite — runs **twice**, once per theme |
| `npm run test:watch` | Jest in watch mode |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `expo lint` |

## Before you push

```bash
npm run typecheck && npm test
```

Both must be clean. The suite is currently **178 suites / 2042 tests** and takes
a few minutes, because every test runs under both themes (see below).

## How this project is laid out

```
src/
  app/              expo-router routes — file-based, one file per screen
    (auth)/         sign in, sign up, reset          — no session yet
    (onboarding)/   pairing and story capture        — session, no partner yet
    (app)/          the real app                     — session + partner
  modules/          feature modules, one folder each
    module-00-auth  module-01-onboarding  module-02-home
    module-03-chat  module-03-memories    module-05-profile
  design-system/    tokens, primitives, patterns, themes
  services/         the backend seam — see TECH.md
  copy/             all user-facing strings, per module
  state/            zustand stores
  config/           the only place process.env is read
```

Screens hold no strings and no colours. Copy lives in `src/copy/`, and every
colour, size, spacing and duration is a token read off the theme.

## Two things that surprise people

**The suite runs twice.** There is a light theme (`lavender`) and a dark one
(`midnight`), and Jest runs every test under each as separate projects. A
failure reported against `midnight` is a dark-mode bug. This exists because the
Unistyles Jest mock cannot switch themes at runtime, so the only way to test
dark mode is to configure it first and run again.

**Nothing persists.** Reload and you are back to seed data. There is no storage
layer yet — deliberately, until a real backend exists.

## Deployment

`.github/workflows/deploy-web.yml` builds the web target and publishes it to
GitHub Pages on push.

## Further reading

- [TECH.md](TECH.md) — stack, and the backend integration guide
- [docs/build-status.md](docs/build-status.md) — what is built, what is mocked,
  and what does not work yet
