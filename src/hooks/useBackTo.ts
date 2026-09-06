import { type Href, useRouter } from 'expo-router'
import { useCallback } from 'react'

/**
 * A Back control that always goes somewhere.
 *
 * `router.back()` alone only works when this screen was pushed onto a stack
 * that already had something in it. Open a route directly — a shared link, a
 * browser reload on `/chat/conversation`, a notification deep link — and the
 * stack has exactly one entry, so Back is a dead control and expo-router logs
 * "The action 'GO_BACK' was not handled by any navigator".
 *
 * This hook keeps the ordinary case (pop the stack) and gives the deep-link
 * case a real destination: `replace`, not `push`, so the parent screen takes
 * this screen's place in history instead of stacking on top of it and leaving
 * a Back button that returns to where the user just left.
 *
 * `fallback` is the screen this one belongs UNDER, not a home button — from a
 * conversation that is the chat list, not the dashboard.
 */
export function useBackTo(fallback: Href) {
  const router = useRouter()

  return useCallback(() => {
    if (router.canGoBack()) router.back()
    else router.replace(fallback)
  }, [router, fallback])
}
