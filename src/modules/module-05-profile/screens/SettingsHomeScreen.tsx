import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_APPEARANCE_COPY } from '@/copy/settingsAppearance'
import { SETTINGS_HOME_COPY as COPY } from '@/copy/settingsHome'
import { LANGUAGE_NAMES } from '@/copy/settingsLanguage'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { DangerRow } from '@/design-system/patterns/DangerRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import type { ThemeChoice } from '@/design-system/themes/themeChoiceStore'
import { useThemeMode } from '@/design-system/themes/useThemeMode'
import { Text } from '@/design-system/primitives/Text'
import { CoupleHeader } from '@/modules/module-05-profile/components/CoupleHeader'
import { authService } from '@/services/auth'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { usePreferencesStore } from '@/state/preferencesStore'
import { daysSince } from '@/utils/daysUntil'

/**
 * The three theme names come from Appearance's own copy rather than being
 * retyped here. The hub's value and the screen it opens are showing the user the
 * same choice, and two copies of the same three words are two things that can
 * drift — the row would keep saying "Dark" after the screen started saying
 * something else. The five language names follow the same rule, read from
 * `LANGUAGE_NAMES` in Language & Region's own copy (they were briefly retyped
 * here, which is exactly the drift this comment was written to forbid), and
 * both maps are `Record<union, string>` so a new member of either union fails
 * to compile rather than rendering an empty value.
 */
const THEME_LABEL: Record<ThemeChoice, string> = {
  light: SETTINGS_APPEARANCE_COPY.light,
  dark: SETTINGS_APPEARANCE_COPY.dark,
  auto: SETTINGS_APPEARANCE_COPY.auto,
}

/**
 * M05-S01 — the Profile tab, which IS the settings list.
 *
 * Replaces the `OurSpaceScreen` stub, whose own comment said the rest of the
 * hub would grow into it and that the sign-out would stay where it was. Both
 * happened: the heading and lede are the design's and are kept verbatim, and
 * sign-out is now a `DangerRow` instead of a lone outline button.
 *
 * SIGN-OUT ORDER IS LOAD-BEARING. EVERY reset runs before `router.replace`,
 * unconditionally, whichever way the service call went — the welcome screen
 * must never be able to read a previous couple's partner. The rejection is
 * swallowed on purpose: there is nothing to tell someone whose logout call
 * failed, because they are signed out locally either way, and a message here
 * would imply they are not.
 *
 * WHAT gets reset is load-bearing too, and this is the whole device's state,
 * not one store's. The relationship was cleared from the first day; the
 * preferences and the theme were not, so the next person to sign in on this
 * phone inherited the last person's app lock, notification previews,
 * screenshot alerts, quiet hours and dark mode. Anything a signed-in account
 * writes has to be cleared here, and a new store is not finished until its
 * `reset` is on this list.
 *
 * A PUSHED PAGE, not a tab. Profile lost its seat in the bottom bar to Space
 * and moved to the header's top-right control, so this list is something you
 * open and back out of. `SettingsScreenLayout` is the chrome for exactly that
 * — no bottom bar, a back arrow, and the screen's own title in the bar — and
 * it is what the other twenty settings pages already use.
 */
export function SettingsHomeScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const resetRelationship = useRelationshipStore((state) => state.reset)
  const resetPreferences = usePreferencesStore((state) => state.reset)
  const spaceName = useSpaceStore((state) => state.name)
  const met = useStoryStore((state) => state.met)
  const language = usePreferencesStore((state) => state.language)
  const { choice, resetChoice } = useThemeMode()

  // The same figure the dashboard counts, from the same source — the day the
  // couple recorded as the day they met. `daysSince` returns null when that day
  // is missing or unparseable, and `CoupleHeader` draws no counter for null, so
  // a pair who skipped the question see their names and nothing under them.
  const daysTogether = daysSince(met?.value)

  const go = useCallback((href: string) => () => router.push(href as Href), [router])
  const back = useCallback(() => router.back(), [router])

  const signOut = useCallback(async () => {
    try {
      await authService.signOut()
    } catch {
      // Swallowed on purpose — see the header comment.
    }

    resetRelationship()
    resetPreferences()
    resetChoice()
    router.replace('/(auth)/welcome')
  }, [resetRelationship, resetPreferences, resetChoice, router])

  const confirmSignOut = useCallback(() => {
    void signOut()
  }, [signOut])

  return (
    <SettingsScreenLayout title={COPY.heading} lede={COPY.lede} onBack={back}>
      <CoupleHeader
        name={profile?.name ?? 'You'}
        partnerName={partner?.name}
        photoUri={profile?.photoUri}
        partnerPhotoUri={partner?.photoUri}
        spaceName={spaceName}
        daysTogether={daysTogether}
        daysLabel={COPY.daysTogether}
      />

      <SectionPanel title={COPY.accountGroup}>
        <SettingsRow
          icon="user"
          label={COPY.personalDetails}
          onPress={go('/(app)/settings/personal-details')}
        />
        <SettingsRow icon="heart" label={COPY.partner} onPress={go('/(app)/settings/partner')} />
        <SettingsRow icon="home" label={COPY.ourSpace} onPress={go('/(app)/settings/our-space')} />
      </SectionPanel>

      <SectionPanel title={COPY.privacyGroup}>
        <SettingsRow icon="lock" label={COPY.privacy} onPress={go('/(app)/settings/privacy')} />
        <SettingsRow icon="database" label={COPY.data} onPress={go('/(app)/settings/data')} />
      </SectionPanel>

      <SectionPanel title={COPY.preferencesGroup}>
        <SettingsRow
          icon="moon"
          label={COPY.appearance}
          value={THEME_LABEL[choice]}
          onPress={go('/(app)/settings/appearance')}
        />
        <SettingsRow
          icon="eye"
          label={COPY.accessibility}
          onPress={go('/(app)/settings/accessibility')}
        />
        <SettingsRow
          icon="bell"
          label={COPY.notifications}
          onPress={go('/(app)/settings/notifications')}
        />
        <SettingsRow icon="message-circle" label={COPY.chat} onPress={go('/(app)/settings/chat')} />
        <SettingsRow
          icon="book-open"
          label={COPY.memories}
          onPress={go('/(app)/settings/memories')}
        />
        <SettingsRow icon="calendar" label={COPY.dates} onPress={go('/(app)/settings/dates')} />
        <SettingsRow
          icon="grid"
          label={COPY.homeLayout}
          onPress={go('/(app)/settings/home-layout')}
        />
        <SettingsRow
          icon="globe"
          label={COPY.language}
          value={LANGUAGE_NAMES[language]}
          onPress={go('/(app)/settings/language')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.planGroup}>
        <SettingsRow
          icon="credit-card"
          label={COPY.billing}
          onPress={go('/(app)/settings/billing')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.supportGroup}>
        <SettingsRow icon="help-circle" label={COPY.help} onPress={go('/(app)/settings/help')} />
        <SettingsRow icon="mail" label={COPY.feedback} onPress={go('/(app)/settings/feedback')} />
      </SectionPanel>

      <SectionPanel title={COPY.aboutGroup}>
        <SettingsRow icon="info" label={COPY.about} onPress={go('/(app)/settings/about')} />
        <SettingsRow icon="file-text" label={COPY.terms} onPress={go('/(app)/settings/legal/terms')} />
        <SettingsRow
          icon="shield"
          label={COPY.privacyPolicy}
          onPress={go('/(app)/settings/legal/privacy')}
        />
        <SettingsRow
          icon="code"
          label={COPY.licenses}
          onPress={go('/(app)/settings/legal/licenses')}
        />
      </SectionPanel>

      <View style={styles.danger}>
        <DangerRow
          icon="log-out"
          label={COPY.signOut}
          confirmTitle={COPY.confirmTitle}
          confirmBody={COPY.confirmBody}
          cancelLabel={COPY.confirmKeep}
          confirmLabel={COPY.confirmSignOut}
          onConfirm={confirmSignOut}
        />

        {/*
          Delete does NOT confirm here. It opens a screen that asks three times
          with three different proofs, and a dialog in front of that would be a
          fourth question that proves nothing.
        */}
        <SettingsRow
          icon="trash-2"
          label={COPY.deleteAccount}
          detail={COPY.deleteDetail}
          tone="danger"
          onPress={go('/(app)/settings/delete-account')}
        />
      </View>
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
  danger: {
    gap: theme.spacing.md,
  },
}))
