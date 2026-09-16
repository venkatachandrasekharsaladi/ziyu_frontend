/**
 * ROUTE  /welcome   —   M00-S01 · Welcome to Tales of Two
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. This file is the reference example
 * every other route in the app follows.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-00-auth/screens/WelcomeScreen.tsx
 *   Every word on screen  src/copy/welcome.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M05-S10 = module 05, screen 10) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
import { WelcomeScreen } from '@/modules/module-00-auth/screens/WelcomeScreen'

export default WelcomeScreen
