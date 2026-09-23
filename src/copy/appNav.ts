/**
 * The app's bottom navigation, shared by every screen inside `(app)`.
 *
 * Five destinations, all of them built. `BottomNav` still honours `live: false`
 * and renders such a tab disabled rather than hidden — see its own test — but
 * no tab needs that today, so the bar no longer carries a dead stop.
 *
 * PLANS sits third, between Memories and Chat, which is where Figma
 * `Tales of Two` / `New Features` (3482:965) draws it. That page's other frames
 * disagree with each other about the fifth slot — one draws "Timeline", one
 * "Space", one "Where", one "Watch" — because they are iterations, not one
 * design. Rather than pick a winner among four, the bar gains the one tab every
 * variant agrees on and the rest of the cluster is reached THROUGH it, from the
 * hub at `/(app)/plans`.
 *
 * Profile stays a tab. The previous attempt at this bar (9cdb245, reverted in
 * 2cec3f4) moved Profile into the header to make room, and that was explicitly
 * not wanted — so this change is additive and moves nothing.
 */
export const APP_NAV = {
  tabs: [
    { key: 'home', label: 'Home', icon: 'home', live: true, href: '/(app)/home' },
    { key: 'memories', label: 'Memories', icon: 'book-open', live: true, href: '/(app)/memories' },
    { key: 'plans', label: 'Plans', icon: 'compass', live: true, href: '/(app)/plans' },
    { key: 'chat', label: 'Chat', icon: 'message-circle', live: true, href: '/(app)/chat' },
    { key: 'profile', label: 'Profile', icon: 'user', live: true, href: '/(app)/profile' },
  ],
} as const

export type AppTabKey = (typeof APP_NAV.tabs)[number]['key']
