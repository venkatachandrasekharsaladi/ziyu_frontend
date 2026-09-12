import { HOME_DASHBOARD_COPY } from '@/copy/homeDashboard'

/**
 * Copy for Settings → Home Layout.
 *
 * The three cards are three of the sections `HomeDashboardScreen` renders, and
 * they are named with the dashboard's OWN section headings — taken from
 * `copy/homeDashboard.ts` rather than retyped here, which is what the earlier
 * version of this comment claimed while the names beside it ('Featured memory')
 * were words the home screen has never printed. A card offered under a name the
 * user cannot find on their home screen is a card they cannot recognise.
 *
 * These are not ALL of it: the dashboard also draws the stat rail ("Your little
 * world"), a spotlight card and an upcoming list. The three here are the three
 * the store models (`HomeCardKey`).
 *
 * HONEST LIMIT: `HomeDashboardScreen` does not read `homeCards` yet — it draws
 * every section, in its own fixed order, whatever is chosen here. So the lede
 * says so, and `allHidden` does not promise a home screen that goes blank.
 * Same disclosure rule as `settingsLanguage.ts`.
 *
 * Reordering is up/down controls rather than a drag. A drag needs a gesture
 * library this screen would be the only caller of, and a drag cannot be
 * operated by a screen reader at all.
 */
export const SETTINGS_HOME_LAYOUT_COPY = {
  title: 'Home Layout',
  lede: 'The cards on your home screen, and their order. Your home screen does not follow this yet.',

  cardsGroup: 'Cards',
  featured: HOME_DASHBOARD_COPY.featuredLabel,
  featuredDetail: 'One photograph, chosen for today.',
  comingUp: HOME_DASHBOARD_COPY.comingUpLabel,
  comingUpDetail: 'The next date that matters.',
  littleThings: HOME_DASHBOARD_COPY.littleThingsLabel,
  littleThingsDetail: 'Small notes and moments from each other.',

  /**
   * Named with the card they move, because there are three pairs of them on
   * one screen. Static labels made six controls announce as two names —
   * "Move up" three times over — on the screen that exists precisely because a
   * drag cannot be operated by a screen reader. Built here rather than
   * assembled in the screen: "Move X up" is a user-facing sentence, and this
   * file is where this screen's sentences live.
   */
  moveUp: (card: string) => `Move ${card} up`,
  moveDown: (card: string) => `Move ${card} down`,
  allHidden: 'Every card is hidden here. Your home screen still shows all of them for now.',
} as const
