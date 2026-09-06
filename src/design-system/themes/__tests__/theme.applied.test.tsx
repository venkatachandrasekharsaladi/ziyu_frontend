import { Text as RNText } from 'react-native'

import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { BottomNav, type NavTab } from '@/design-system/patterns/BottomNav'
import { EventRow } from '@/design-system/patterns/EventRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { ThemeToggle } from '@/design-system/patterns/ThemeToggle'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Divider } from '@/design-system/primitives/Divider'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { EnvelopeIllustration } from '@/modules/module-00-auth/components/EnvelopeIllustration'
import { PasswordStrength } from '@/modules/module-00-auth/components/PasswordStrength'
import { StatTile } from '@/modules/module-02-home/components/StatTile'
import { activeTheme, activeThemeName, inactiveTheme } from '@/test/activeTheme'
import { auditColours } from '@/test/colours'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}))

const TABS: readonly NavTab[] = [
  { key: 'home', label: 'Home', icon: 'home', live: true },
  { key: 'memories', label: 'Memories', icon: 'book-open', live: true },
  { key: 'chat', label: 'Chat', icon: 'message-circle', live: false },
]

/**
 * Everything with a colour in it, one entry per surface worth checking.
 *
 * These are the pieces every screen is assembled from, so covering them covers
 * the corners the screens inherit. `AppScreenLayout` and `AuthScreenLayout` pull
 * in the page ground, the header, the gradient and the bottom bar with them.
 */
const SURFACES: [string, () => React.JSX.Element][] = [
  ['app chrome', () => <AppScreenLayout activeTab="home"><Card><RNText>x</RNText></Card></AppScreenLayout>],
  ['auth chrome', () => <AuthScreenLayout><RNText>x</RNText></AuthScreenLayout>],
  ['bottom nav', () => <BottomNav tabs={TABS} activeKey="home" />],
  ['button, primary', () => <Button label="Go" onPress={() => {}} />],
  ['button, soft', () => <Button label="Go" onPress={() => {}} variant="soft" />],
  ['button, outline', () => <Button label="Go" onPress={() => {}} variant="outline" />],
  ['button, link', () => <Button label="Go" onPress={() => {}} variant="link" />],
  ['button, disabled', () => <Button label="Go" onPress={() => {}} disabled />],
  ['card', () => <Card><RNText>x</RNText></Card>],
  ['divider', () => <Divider />],
  ['envelope illustration', () => <EnvelopeIllustration />],
  ['input', () => <Input label="Email" value="" onChangeText={() => {}} />],
  ['input, with error', () => <Input label="Email" value="" onChangeText={() => {}} error="Nope" />],
  ['password strength', () => <PasswordStrength value="Abcdef1!" />],
  ['password strength, weak', () => <PasswordStrength value="a" />],
  ['section panel with rows', () => (
    <SectionPanel title="Upcoming">
      <EventRow icon="film" label="Movie Night" detail="Friday, 8 PM" index={0} />
      <EventRow icon="coffee" label="Dinner" detail="Sunday, 7 PM" index={1} trailing="2 days" />
      <EventRow icon="heart" label="Anniversary" index={2} onPress={() => {}} />
    </SectionPanel>
  )],
  ['stat tile', () => <StatTile icon="heart" value="1,395" label="Together" unit="days" />],
  ['text, every tone', () => (
    <>
      <Text tone="heading">a</Text>
      <Text tone="body">b</Text>
      <Text tone="placeholder">c</Text>
      <Text tone="muted">d</Text>
      <Text tone="brand">e</Text>
      <Text tone="link">f</Text>
      <Text tone="error">g</Text>
      <Text tone="success">h</Text>
      <Text tone="onPrimary">i</Text>
    </>
  )],
  ['theme toggle', () => <ThemeToggle />],
]

/**
 * DARK MODE, PROVEN PER SURFACE.
 *
 * This file runs in BOTH Jest projects — lavender and midnight — and asserts
 * against whichever theme is active, so one set of expectations covers both.
 * That is the whole trick, and it exists because the Unistyles mock cannot flip
 * a theme mid-test (see `src/test/unistyles.midnight.ts`).
 *
 * The assertion is not "some colour changed". It is: every colour in the
 * rendered tree belongs to the ACTIVE theme, and none belongs only to the other
 * one. A hardcoded hex passes in the theme it was copied from and fails in the
 * other, which is precisely the bug this is for.
 */
describe(`every surface wears the ${activeThemeName()} theme`, () => {
  it.each(SURFACES)('%s uses no colour from another theme', async (_name, render) => {
    const tree = (await renderScreen(render())).toJSON()

    expect(auditColours(tree, activeThemeName()).fromOtherTheme).toEqual([])
  })

  it.each(SURFACES)('%s takes every colour from a token', async (_name, render) => {
    const tree = (await renderScreen(render())).toJSON()

    // An untokenised colour is one nothing can repaint. It would survive both
    // themes unchanged, so the check above cannot see it — only this one can.
    expect(auditColours(tree, activeThemeName()).untokenised).toEqual([])
  })

  it('paints the page ground with the active theme, not the other one', async () => {
    const tree = (await renderScreen(<AppScreenLayout activeTab="home" />)).toJSON()
    const found = auditColours(tree, activeThemeName()).found

    expect(found).toContain(activeTheme().colors.surface.page.toLowerCase())
    expect(found).not.toContain(inactiveTheme().colors.surface.page.toLowerCase())
  })

  it('tints a row icon from the active theme accents, in order', async () => {
    const tree = (
      await renderScreen(
        <SectionPanel title="Upcoming">
          <EventRow icon="film" label="First" index={0} />
          <EventRow icon="coffee" label="Second" index={1} />
        </SectionPanel>,
      )
    ).toJSON()
    const found = auditColours(tree, activeThemeName()).found
    const accents = activeTheme().colors.accents

    // Both halves of each pair reach the tree: `soft` as the tile fill, `ink` as
    // the glyph colour. Getting one and not the other means half a repaint.
    for (const i of [0, 1]) {
      expect(found).toContain(accents[i].soft.toLowerCase())
      expect(found).toContain(accents[i].ink.toLowerCase())
    }
  })

  it('gives the status bar the glyphs the ground needs', async () => {
    // Light glyphs on a dark page, dark glyphs on a light one. Getting this
    // backwards leaves the clock invisible, and it is the one theme-dependent
    // value that is not a colour at all.
    expect(activeTheme().scheme).toBe(activeThemeName() === 'midnight' ? 'dark' : 'light')
  })
})
