import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { LETTERS_COPY } from '@/copy/letters'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import type { Letter } from '@/services/plans/types'

type LetterCardProps = {
  letter: Letter
  /** Days until it unseals. Computed by the screen, which owns "now". */
  daysUntilOpen: number
  fromName: string
  toName: string
  onPress: () => void
}

/**
 * One envelope in the letters vault — Figma 3483:4305, the two cards under
 * "Waiting for Sarah".
 *
 * THE TEASER IS NOT THE LETTER. A sealed card shows `teaser`, which is a line
 * ABOUT the letter written for the card, never the opening words of the body —
 * `Letter.body` is null while sealed for exactly this reason. A card that
 * previewed the first sentence would have unsealed the letter a little.
 */
export function LetterCard({
  letter,
  daysUntilOpen,
  fromName,
  toName,
  onPress,
}: LetterCardProps) {
  const { theme } = useUnistyles()

  const openable = letter.state !== 'sealed'

  return (
    <PressableScale onPress={onPress} accessibilityLabel={`${letter.title}. ${LETTERS_COPY.states[letter.state]}`}>
      <View style={styles.card}>
        {/* The wax band across the top of the envelope. */}
        <View style={styles.band}>
          <Text variant="countdown" tone="placeholder">
            {`${LETTERS_COPY.number(letter.number)} · ${
              letter.state === 'ready' ? LETTERS_COPY.anniversaryVault : LETTERS_COPY.sealedKeepsake
            }`}
          </Text>

          <Chip
            label={LETTERS_COPY.states[letter.state]}
            tone={openable ? 'success' : 'neutral'}
          />
        </View>

        <View style={styles.wax}>
          <Feather
            name={letter.state === 'sealed' ? 'lock' : letter.state === 'ready' ? 'heart' : 'mail'}
            size={14}
            color={theme.colors.text.onPrimary}
          />
        </View>

        <View style={styles.people}>
          <Text variant="countdown" tone="placeholder">
            {`${LETTERS_COPY.to}: ${toName}`}
          </Text>

          <Text variant="countdown" tone="placeholder">
            {`${LETTERS_COPY.from}: ${fromName}`}
          </Text>
        </View>

        <Text variant="labelStrong" tone="heading">
          {`“${letter.title}”`}
        </Text>

        <Text variant="footnote" tone="body">
          {letter.teaser}
        </Text>

        <View style={styles.foot}>
          <View style={styles.dates}>
            <Text variant="countdown" tone="placeholder">
              {LETTERS_COPY.written.toUpperCase()}
            </Text>

            <Text variant="countdown" tone="heading">
              {letter.writtenAt}
            </Text>
          </View>

          <View style={styles.dates}>
            <Text variant="countdown" tone="placeholder">
              {(openable ? LETTERS_COPY.unlocked : LETTERS_COPY.opensOn).toUpperCase()}
            </Text>

            <Text variant="countdown" tone="heading">
              {openable ? LETTERS_COPY.today : letter.opensAt}
            </Text>
          </View>

          <Chip
            label={openable ? LETTERS_COPY.breakSeal : LETTERS_COPY.unlocksIn(daysUntilOpen)}
            icon={openable ? 'mail' : 'lock'}
            selected={openable}
          />
        </View>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  wax: {
    width: 32,
    height: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  people: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  dates: {
    gap: 2,
  },
}))
