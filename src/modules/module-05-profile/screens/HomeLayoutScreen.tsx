import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_HOME_LAYOUT_COPY as COPY } from '@/copy/settingsHomeLayout'
import { IconButton } from '@/design-system/patterns/IconButton'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { Text } from '@/design-system/primitives/Text'
import { usePreferencesStore, type HomeCardKey } from '@/state/preferencesStore'

/** Canonical order. A card that is switched back on returns to its place here. */
const ALL_CARDS: HomeCardKey[] = ['featured', 'comingUp', 'littleThings']

const CARD_COPY: Record<HomeCardKey, { label: string; detail: string; icon: 'image' | 'calendar' | 'heart' }> = {
  featured: { label: COPY.featured, detail: COPY.featuredDetail, icon: 'image' },
  comingUp: { label: COPY.comingUp, detail: COPY.comingUpDetail, icon: 'calendar' },
  littleThings: { label: COPY.littleThings, detail: COPY.littleThingsDetail, icon: 'heart' },
}

/**
 * M05-S14 — Settings → Home Layout.
 *
 * `homeCards` is an ORDERED list of what is shown. Hiding removes a key,
 * showing re-inserts it at its position in `ALL_CARDS` rather than appending —
 * otherwise switching a card off and straight back on silently reorders the
 * home screen, which is a change nobody asked for.
 */
export function HomeLayoutScreen() {
  const router = useRouter()
  const homeCards = usePreferencesStore((s) => s.homeCards)
  const setPreference = usePreferencesStore((s) => s.setPreference)

  const goBack = useCallback(() => router.back(), [router])

  const toggleCard = useCallback(
    (key: HomeCardKey) => () => {
      if (homeCards.includes(key)) {
        setPreference(
          'homeCards',
          homeCards.filter((card) => card !== key),
        )
        return
      }

      // Re-inserted at its canonical index, not appended.
      const next = ALL_CARDS.filter((card) => card === key || homeCards.includes(card))
      setPreference('homeCards', next)
    },
    [homeCards, setPreference],
  )

  const move = useCallback(
    (key: HomeCardKey, direction: -1 | 1) => () => {
      const from = homeCards.indexOf(key)
      const to = from + direction

      if (from === -1 || to < 0 || to >= homeCards.length) return

      const next = [...homeCards]
      next.splice(from, 1)
      next.splice(to, 0, key)
      setPreference('homeCards', next)
    },
    [homeCards, setPreference],
  )

  // Visible cards first, in their chosen order, then the hidden ones.
  const ordered: HomeCardKey[] = [
    ...homeCards,
    ...ALL_CARDS.filter((card) => !homeCards.includes(card)),
  ]

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.cardsGroup}>
        {ordered.map((key) => {
          const index = homeCards.indexOf(key)
          const isVisible = index !== -1

          return (
            <View key={key} style={styles.card} testID={`card-${key}`}>
              <SettingsToggleRow
                icon={CARD_COPY[key].icon}
                label={CARD_COPY[key].label}
                detail={CARD_COPY[key].detail}
                value={isVisible}
                onValueChange={toggleCard(key)}
              />

              <View style={styles.controls}>
                <IconButton
                  icon="arrow-up"
                  label={COPY.moveUp}
                  size="sm"
                  tone="quiet"
                  onPress={isVisible && index > 0 ? move(key, -1) : undefined}
                />
                <IconButton
                  icon="arrow-down"
                  label={COPY.moveDown}
                  size="sm"
                  tone="quiet"
                  onPress={
                    isVisible && index < homeCards.length - 1 ? move(key, 1) : undefined
                  }
                />
              </View>
            </View>
          )
        })}

        {homeCards.length === 0 ? (
          <Text variant="footnote" tone="body">
            {COPY.allHidden}
          </Text>
        ) : null}
      </SectionPanel>
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
}))
