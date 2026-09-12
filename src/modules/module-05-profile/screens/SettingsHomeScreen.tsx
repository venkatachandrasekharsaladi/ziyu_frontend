import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_HOME_COPY as COPY } from '@/copy/settingsHome'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { DangerRow } from '@/design-system/patterns/DangerRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { useThemeMode } from '@/design-system/themes/useThemeMode'
import { Text } from '@/design-system/primitives/Text'
import { CoupleHeader } from '@/modules/module-05-profile/components/CoupleHeader'
import { authService } from '@/services/auth'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'
import { usePreferencesStore } from '@/state/preferencesStore'

const LANGUAGE_LABEL: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
}

const THEME_LABEL = { light: 'Light', dark: 'Dark', auto: 'Auto' } as const

/**
 * M05-S01 — the Profile tab, which IS the settings list.
 *
 * Replaces the `OurSpaceScreen` stub, whose own comment said the rest of the
 * hub would grow into it and that the sign-out would stay where it was. Both
 * happened: the heading and lede are the design's and are kept verbatim, and
 * sign-out is now a `DangerRow` instead of a lone outline button.
 *
 * SIGN-OUT ORDER IS LOAD-BEARING and is carried over unchanged. `reset()` runs
 * before `router.replace`, unconditionally, whichever way the service call
 * went — the welcome screen must never be able to read a previous couple's
 * partner. The rejection is swallowed on purpose: there is nothing to tell
 * someone whose logout call failed, because they are signed out locally
 * either way, and a message here would imply they are not.
 */
export function SettingsHomeScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const reset = useRelationshipStore((state) => state.reset)
  const spaceName = useSpaceStore((state) => state.name)
  const language = usePreferencesStore((state) => state.language)
  const { choice } = useThemeMode()

  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  const signOut = useCallback(async () => {
    try {
      await authService.signOut()
    } catch {
      // Swallowed on purpose — see the header comment.
    }

    reset()
    router.replace('/(auth)/welcome')
  }, [reset, router])

  const confirmSignOut = useCallback(() => {
    void signOut()
  }, [signOut])

  return (
    <AppScreenLayout activeTab="profile">
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.lede}
        </Text>
      </View>

      <CoupleHeader
        name={profile?.name ?? 'You'}
        partnerName={partner?.name}
        photoUri={profile?.photoUri}
        partnerPhotoUri={partner?.photoUri}
        spaceName={spaceName}
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
          value={LANGUAGE_LABEL[language]}
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
    </AppScreenLayout>
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
