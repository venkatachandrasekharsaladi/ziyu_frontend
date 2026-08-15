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

If you want this as a badge in the README or a shorter one-line summary, tell me which format you prefer.
