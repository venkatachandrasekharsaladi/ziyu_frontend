/**
 * Copy for Settings → Home Layout.
 *
 * The three cards are the three sections `HomeDashboardScreen` renders, named
 * from `copy/homeDashboard.ts`: the featured memory, what is coming up, and the
 * little things.
 *
 * Reordering is up/down controls rather than a drag. A drag needs a gesture
 * library this screen would be the only caller of, and a drag cannot be
 * operated by a screen reader at all.
 */
export const SETTINGS_HOME_LAYOUT_COPY = {
  title: 'Home Layout',
  lede: 'What you see first when you open the app.',

  cardsGroup: 'Cards',
  featured: 'Featured memory',
  featuredDetail: 'One photograph, chosen for today.',
  comingUp: 'Coming up',
  comingUpDetail: 'The next date that matters.',
  littleThings: 'Little things',
  littleThingsDetail: 'Small notes and moments from each other.',

  moveUp: 'Move up',
  moveDown: 'Move down',
  allHidden: 'Every card is hidden. Your home screen will show only your greeting.',
} as const
