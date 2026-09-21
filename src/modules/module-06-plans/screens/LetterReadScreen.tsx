import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { LETTER_READ_COPY, LETTERS_COPY } from '@/copy/letters'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { SAMPLE_OPENED_LETTER } from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * M06-S10 · Reading a letter. Figma 3483:4305, "RECIPIENT EXPERIENCE".
 *
 * TWO VIEWS IN ONE SCREEN, chosen by the letter's state: the sealed wait, and
 * the letter itself. They are not separate routes because they are the same
 * letter at the same URL — the only thing that changes is whether today is past
 * its date.
 *
 * THE BODY COMES FROM THE STORE, and is null until the letter is opened. The one
 * fully-written letter in the sample (`SAMPLE_OPENED_LETTER`) is substituted only
 * for the letter it belongs to, and only once that letter is open — which is why
 * this screen calls `openLetter` before it reads a body rather than after.
 */
export function LetterReadScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()

  const letters = usePlansStore((state) => state.letters)
  const openLetter = usePlansStore((state) => state.openLetter)
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const myName = profile?.name ?? 'Chandu'
  const partnerName = partner?.name ?? 'Sarah'

  const letter = letters.find((candidate) => candidate.id === id)

  /*
   * `ready` means unlocked but unread. Opening it is what the user came here to
   * do, so it happens on arrival rather than behind another button — the "Break
   * Wax Seal" press on the card was already that button.
   *
   * In an effect, not in render: `openLetter` writes to the store, and a store
   * write during render is a render with a side effect. It also has to sit above
   * the early returns below, because a hook cannot be called conditionally.
   */
  const readyToOpen = letter?.state === 'ready'

  useEffect(() => {
    if (readyToOpen && id) openLetter(id)
  }, [id, openLetter, readyToOpen])

  if (!letter) {
    return (
      <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
        <Text variant="body" tone="body">
          {LETTERS_COPY.empty.opened}
        </Text>
      </AppScreenLayout>
    )
  }

  /* ---------------- still sealed ---------------- */

  if (letter.state === 'sealed') {
    return (
      <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
        <View style={styles.sealedView}>
          <View style={styles.wax}>
            <Feather name="lock" size={20} color={theme.colors.text.onPrimary} />
          </View>

          <Text variant="h2" tone="heading" align="center">
            {LETTER_READ_COPY.stillSealed.heading}
          </Text>

          <Text variant="body" tone="body" align="center">
            {LETTER_READ_COPY.stillSealed.lede(longDate(letter.opensAt))}
          </Text>

          <Text variant="footnote" tone="placeholder" align="center">
            {`“${letter.teaser}”`}
          </Text>
        </View>
      </AppScreenLayout>
    )
  }

  // The one letter with a written body. Any other opened letter shows its own.
  const content = letter.id === SAMPLE_OPENED_LETTER.id ? SAMPLE_OPENED_LETTER : letter
  const fromName = letter.from === 'me' ? myName : partnerName

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <View style={styles.head}>
        <Text variant="caption" tone="placeholder">
          {LETTER_READ_COPY.eyebrow}
        </Text>

        <Chip label={LETTER_READ_COPY.openedOn(longDate(letter.opensAt))} tone="success" />
      </View>

      <Text variant="h2" tone="heading">
        {LETTER_READ_COPY.title}
      </Text>

      <View style={styles.letter}>
        <Text variant="countdown" tone="placeholder">
          {LETTER_READ_COPY.brand(letter.number).toUpperCase()}
        </Text>

        <Text variant="h3" tone="brand">
          {letter.title}
        </Text>

        <View style={styles.meta}>
          {letter.writtenIn ? (
            <Text variant="countdown" tone="placeholder">
              {LETTER_READ_COPY.writtenIn(letter.writtenIn)}
            </Text>
          ) : null}

          <Text variant="countdown" tone="heading">
            {longDate(letter.writtenAt)}
          </Text>
        </View>

        <View style={styles.divider} />

        {/*
         * The body is one Text, not a paragraph per line. Keeping the newlines
         * inside a single node is what preserves the letter's own line breaks —
         * splitting on them and mapping would have let the gap between stanzas
         * become a layout decision rather than the writer's.
         */}
        <Text variant="body" tone="body">
          {content.body ?? letter.teaser}
        </Text>

        <Text variant="footnote" tone="brand">
          {fromName}
        </Text>
      </View>

      {content.photoUri ? (
        <View style={styles.enclosed}>
          <Text variant="caption" tone="placeholder">
            {LETTER_READ_COPY.enclosed}
          </Text>

          {/*
           * A plain object, built here from the theme rather than taken from
           * `StyleSheet.create`. Unistyles does not process expo-image and
           * strips the style it is handed — width and height included, which
           * draws the photograph at 0×0. See `expoImageStyles.test.ts`.
           */}
          <Image
            source={{ uri: content.photoUri }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: theme.radii.field,
              backgroundColor: theme.colors.surface.soft,
            }}
            contentFit="cover"
            transition={200}
          />

          {content.photoCaption ? (
            <Text variant="countdown" tone="placeholder" align="center">
              {content.photoCaption}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Button label={LETTER_READ_COPY.keep} variant="soft" onPress={() => router.back()} />

      <Button
        label={LETTER_READ_COPY.addToStory}
        onPress={() => router.push('/(app)/memories')}
      />

      <View style={styles.preserved}>
        <Feather name="shield" size={12} color={theme.colors.text.placeholder} />

        <Text variant="countdown" tone="placeholder">
          {LETTER_READ_COPY.preserved}
        </Text>
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  sealedView: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.huge,
  },
  wax: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  letter: {
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  meta: {
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subtle,
  },
  enclosed: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  preserved: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
}))
