Tech Stack
==========

Platform / Frameworks
- Expo (SDK ~57)
- React Native 0.86.2
- React 19.2.3

Routing
- expo-router

Language & Tooling
- TypeScript (~6.0.3)
- Babel (`babel-preset-expo`)
- Prettier

State & Data
- zustand
- @tanstack/react-query

UI & Styling
- react-native-unistyles
- project design-system in `src/design-system`

Animation & Gestures
- react-native-reanimated
- react-native-worklets
- react-native-gesture-handler
- react-native-edge-to-edge

Expo Modules / Native APIs (selected)
- expo, expo-constants, expo-device, expo-font, expo-image
- expo-linear-gradient, expo-splash-screen, expo-linking, expo-web-browser, expo-dev-client

Web
- react-dom, react-native-web

Build / Native
- Android Gradle under `android/`
- Expo dev tooling (`expo start`, `expo run:android`)

Linting / QA
- `expo lint` (ESLint)
- Prettier

Notable dependency versions
- `expo` ~57.x
- `react` 19.2.3
- `react-native` 0.86.2
- `react-native-reanimated` 4.5.1
- `zustand` ^5.x
- `@tanstack/react-query` ^5.x

Where to look
- Main manifest: `package.json`
- Expo config: `app.json`
- TypeScript config: `tsconfig.json`
- Babel config: `babel.config.js`


Backend integration — start here
================================

**This repository is the Expo frontend only.** There is no server, database or
API in it. Every service is a typed boundary with an in-memory fake behind it:
`fetch`, `axios` and `WebSocket` appear nowhere in `src/`. The only outbound
traffic today is Unsplash image loading.

That is deliberate — it means there is no half-wired networking to unpick.

The seam
--------

Five services live under `src/services/`, each with the same three files:

    src/services/<name>/types.ts   the contract — the interface your client must satisfy
    src/services/<name>/mock.ts    the in-memory fake that ships today
    src/services/<name>/index.ts   the swap point — one line

    auth · chat · memories · pairing · story

Every screen imports from `index.ts`, never from `mock.ts`. So replacing a mock
is a one-line change in one file:

```ts
// src/services/chat/index.ts  — before
export const chatService = createMockChatService()

// after
export const chatService = createHttpChatService(requireApiUrl())
```

Write `createHttpChatService` to satisfy `ChatService` in `types.ts` and every
screen, store and test keeps working unchanged. Start by reading that file — it
is the specification, and it is short.

Configuration
-------------

    cp .env.example .env

`src/config/env.ts` is the only place the app reads `process.env`. Variables
**must** carry the `EXPO_PUBLIC_` prefix or Expo will not inline them and they
resolve to `undefined` with no build error. Everything so prefixed ships inside
the app bundle and is therefore public — never put a secret in it.

Expo reads `.env` at startup only; restart the dev server after editing it.

Android emulators cannot reach the host's `localhost` — use `10.0.2.2`.

What to expect while wiring up
------------------------------

- `src/services/api/generated/` is reserved for a generated API client.
- Mock services resolve with artificial delays (`ChatTimings`) so loading states
  are real. Tests pass zeroes; the app uses the defaults.
- Nothing persists across a reload yet — there is no storage layer.
- **Two-device pairing does not work yet**, and it is the one thing the whole
  product depends on. See `docs/build-status.md` and `docs/product/backlog.md`
  (`LOV-001`) before planning the pairing endpoints.

Verifying a change
------------------

    npm run typecheck     # tsc --noEmit
    npm test              # 178 suites, runs in both themes
    npm run web           # expo start --web
