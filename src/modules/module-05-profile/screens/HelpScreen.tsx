import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'

import { SETTINGS_HELP_COPY as COPY } from '@/copy/settingsHelp'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { FaqItem } from '@/modules/module-05-profile/components/FaqItem'
import { FAQ, type FaqEntry } from '@/modules/module-05-profile/data/faq'

const TOPICS = ['Getting started', 'Your space', 'Privacy', 'Trouble'] as const

/**
 * M05-S18 — Settings → Help & FAQ.
 *
 * The search matches the ANSWER as well as the question. Somebody looking for
 * "invite code" is looking for the pairing answer, and that phrase only appears
 * in the answer's body — a search that only reads titles finds nothing and
 * teaches the user the help is useless.
 */
export function HelpScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const goBack = useCallback(() => router.back(), [router])
  const goToContact = useCallback(() => router.push('/(app)/settings/feedback'), [router])

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) return FAQ

    return FAQ.filter(
      (entry) =>
        entry.question.toLowerCase().includes(needle) ||
        entry.answer.toLowerCase().includes(needle),
    )
  }, [query])

  const byTopic = useCallback(
    (topic: FaqEntry['topic']) => matches.filter((entry) => entry.topic === topic),
    [matches],
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <Input
        label={COPY.searchLabel}
        placeholder={COPY.searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {matches.length === 0 ? (
        <SectionPanel title={COPY.title}>
          <Text variant="body" tone="body">
            {`${COPY.noResultsPrefix} "${query.trim()}".`}
          </Text>

          <Text variant="footnote" tone="body">
            {COPY.noResultsHint}
          </Text>
        </SectionPanel>
      ) : (
        TOPICS.map((topic) => {
          const entries = byTopic(topic)

          if (entries.length === 0) return null

          return (
            <SectionPanel key={topic} title={topic}>
              {entries.map((entry) => (
                <FaqItem key={entry.id} question={entry.question} answer={entry.answer} />
              ))}
            </SectionPanel>
          )
        })
      )}

      <SectionPanel title={COPY.contactGroup}>
        <SettingsRow
          icon="mail"
          label={COPY.contact}
          detail={COPY.contactDetail}
          onPress={goToContact}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
