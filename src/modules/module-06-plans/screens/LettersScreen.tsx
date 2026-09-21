import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { LETTERS_COPY } from '@/copy/letters'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { LetterCard } from '@/modules/module-06-plans/components/LetterCard'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import type { Letter } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

type Tab = 'waiting' | 'fromMe' | 'opened'

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(`${iso}T00:00:00`).getTime() - Date.now()) / 86_400_000))
}

/**
 * M06-S08 · Letters — the vault. Figma 3483:4305, the top section.
 *
 * THREE TABS, NOT THE FRAME'S FOUR. The frame draws "Waiting for you", "From
 * you", "From me" and "Opened" — but "From you" and "From me" are the same
 * filter written from two points of view, and on a two-person app they return
 * the same set. Keeping both would have shipped a tab that could never differ
 * from its neighbour.
 */
export function LettersScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const letters = usePlansStore((state) => state.letters)
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const myName = profile?.name ?? 'Chandu'
  const partnerName = partner?.name ?? 'Sarah'
  const names = `${myName} & ${partnerName}`

  const [tab, setTab] = useState<Tab>('waiting')

  const counts = useMemo(
    () => ({
      waiting: letters.filter((l) => l.to === 'me' && l.state !== 'opened').length,
      fromMe: letters.filter((l) => l.from === 'me').length,
      opened: letters.filter((l) => l.state === 'opened').length,
    }),
    [letters],
  )

  const visible = useMemo(() => {
    if (tab === 'waiting') return letters.filter((l) => l.to === 'me' && l.state !== 'opened')
    if (tab === 'fromMe') return letters.filter((l) => l.from === 'me')

    return letters.filter((l) => l.state === 'opened')
  }, [letters, tab])

  const archives = letters.filter((letter) => letter.state === 'opened')

  const nameFor = (who: Letter['from']) => (who === 'me' ? myName : partnerName)

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={LETTERS_COPY.eyebrow}
        chipIcon="mail"
        title={LETTERS_COPY.title}
        lede={LETTERS_COPY.lede}
      />

      <View style={styles.tabs}>
        <Chip
          label={LETTERS_COPY.tabs.waiting}
          count={counts.waiting}
          selected={tab === 'waiting'}
          onPress={() => setTab('waiting')}
        />

        <Chip
          label={LETTERS_COPY.tabs.fromMe}
          count={counts.fromMe}
          selected={tab === 'fromMe'}
          onPress={() => setTab('fromMe')}
        />

        <Chip
          label={LETTERS_COPY.tabs.opened}
          count={counts.opened}
          selected={tab === 'opened'}
          onPress={() => setTab('opened')}
        />
      </View>

      <View style={styles.sectionHead}>
        <Text variant="caption" tone="placeholder">
          {LETTERS_COPY.sectionWaiting(partnerName)}
        </Text>

        <Text variant="countdown" tone="brand">
          {LETTERS_COPY.privateTo(names)}
        </Text>
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="inbox" size={20} color={theme.colors.brand.primary} />

          <Text variant="footnote" tone="placeholder" align="center">
            {LETTERS_COPY.empty[tab === 'fromMe' ? 'fromYou' : tab]}
          </Text>
        </View>
      ) : (
        visible.map((letter) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            daysUntilOpen={daysUntil(letter.opensAt)}
            fromName={nameFor(letter.from)}
            toName={nameFor(letter.to)}
            onPress={() => router.push(`/(app)/plans/letters/${letter.id}`)}
          />
        ))
      )}

      <Button
        label={LETTERS_COPY.write}
        onPress={() => router.push('/(app)/plans/letters/new')}
      />

      {archives.length === 0 ? null : (
        <>
          <View style={styles.sectionHead}>
            <Text variant="caption" tone="placeholder">
              {LETTERS_COPY.archivesLabel}
            </Text>

            <Text variant="countdown" tone="brand">
              {LETTERS_COPY.viewAll(archives.length)}
            </Text>
          </View>

          <View style={styles.archiveRow}>
            {archives.map((letter) => (
              <View key={letter.id} style={styles.archiveCell}>
                <PressableScale
                  onPress={() => router.push(`/(app)/plans/letters/${letter.id}`)}
                  accessibilityLabel={`${letter.title}. ${LETTERS_COPY.readLetter}`}
                >
                  <View style={styles.archive}>
                    <Text variant="countdown" tone="placeholder">
                      {letter.writtenAt.toUpperCase()}
                    </Text>

                    <Text variant="labelStrong" tone="heading">
                      {`“${letter.title}”`}
                    </Text>

                    <Text variant="countdown" tone="placeholder">
                      {`${LETTERS_COPY.from} ${nameFor(letter.from)} to ${nameFor(letter.to)}`}
                    </Text>

                    <Text variant="countdown" tone="brand">
                      {LETTERS_COPY.readLetter}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            ))}
          </View>
        </>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  archiveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  archiveCell: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  archive: {
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
}))
