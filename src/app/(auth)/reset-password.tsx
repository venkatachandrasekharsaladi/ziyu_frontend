/**
 * ROUTE  /reset-password   —   M00-S06 · Reset Password
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-00-auth/screens/ResetPasswordScreen.tsx
 *   Every word on screen  src/copy/errors.ts
 *                         src/copy/resetPassword.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? Read CODEBASE.md at the repo root — it explains this layout,
 * what an ID like M05-S10 means, and how to find any screen in seconds.
 */
export { ResetPasswordScreen as default } from '@/modules/module-00-auth/screens/ResetPasswordScreen'
