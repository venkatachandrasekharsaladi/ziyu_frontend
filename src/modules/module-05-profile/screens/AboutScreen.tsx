import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_ABOUT_COPY as COPY } from '@/copy/settingsAbout'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'

/**
 * M05-S23 — Settings → About.
 *
 * Version and build come from `expo-constants`, which reads `app.json` — not
 * from a constant somebody has to remember to bump. Both fall back to a dash
 * rather than rendering `undefined`, because under Jest and in some web builds
 * the manifest is not populated.
 *
 * THE ONLY LINKS OUT ARE INWARD. The design asks this screen to link out, and
 * the credits row does — to Licenses, which is the real, complete answer to
 * "what is this built on". The website row carries no `onPress` because there
 * is no website: inventing a URL to make a row pressable would be the one lie
 * this cluster has refused everywhere else, and a dead link is worse than an
 * honest line. Give `BRAND` a real address and this row becomes an
 * `openBrowserAsync` call and nothing else changes.
 */
export function AboutScreen() {
  const router = useRouter()
  const goBack = useCallback(() => router.back(), [router])
  const go = useCallback((href: string) => () => router.push(href as '/(app)/home'), [router])

  const version = Constants.expoConfig?.version ?? '—'
  const build = String(
    Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '—',
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.appGroup}>
        <SettingsRow icon="info" label={COPY.version} value={version} />
        <SettingsRow icon="package" label={COPY.build} value={build} />
        <SettingsRow icon="heart" label={COPY.madeFor} detail={COPY.madeForDetail} />
      </SectionPanel>

      <SectionPanel title={COPY.creditsGroup}>
        <SettingsRow
          icon="code"
          label={COPY.builtWith}
          detail={COPY.builtWithDetail}
          onPress={go('/(app)/settings/legal/licenses')}
        />
        <SettingsRow
          icon="mail"
          label={COPY.contact}
          detail={COPY.contactDetail}
          onPress={go('/(app)/settings/feedback')}
        />
        <SettingsRow icon="globe" label={COPY.website} detail={COPY.websiteDetail} />
      </SectionPanel>

      <SectionPanel title={COPY.legalGroup}>
        <SettingsRow
          icon="file-text"
          label={COPY.terms}
          onPress={go('/(app)/settings/legal/terms')}
        />
        <SettingsRow
          icon="shield"
          label={COPY.privacy}
          onPress={go('/(app)/settings/legal/privacy')}
        />
        <SettingsRow
          icon="code"
          label={COPY.licenses}
          onPress={go('/(app)/settings/legal/licenses')}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
