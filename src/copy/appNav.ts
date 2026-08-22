/**
 * The app's bottom navigation, shared by every screen inside `(app)`.
 *
 * Five destinations, as every Module 02+ design draws them. Tabs whose screens
 * do not exist yet carry `live: false` and render disabled rather than hidden,
 * so the bar does not change shape as they arrive.
 */
export const APP_NAV = {
  tabs: [
    { key: 'home', label: 'Home', icon: 'home', live: true, href: '/(app)/home' },
    { key: 'memories', label: 'Memories', icon: 'book-open', live: true, href: '/(app)/memories' },
    { key: 'chat', label: 'Chat', icon: 'message-circle', live: false, href: '' },
    { key: 'timeline', label: 'Timeline', icon: 'clock', live: false, href: '' },
    { key: 'profile', label: 'Profile', icon: 'user', live: true, href: '/(app)/profile' },
  ],
} as const

export type AppTabKey = (typeof APP_NAV.tabs)[number]['key']
