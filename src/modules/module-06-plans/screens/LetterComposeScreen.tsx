import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { LETTER_COMPOSE_COPY } from '@/copy/letters'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

/** The four sealing choices. `null` days means "whenever they wish". */
const SEAL_OPTIONS = [
  { key: 'whenever', days: null },
  { key: 'month', days: 30 },
  { key: 'anniversary', days: 365 },
  { key: 'threeYears', days: 1095 },
] as const

type SealKey = (typeof SEAL_OPTIONS)[number]['key']

const SEAL_LABEL: Record<SealKey, string> = {
  whenever: 'Whenever they wish',
  month: 'In a month',
  anniversary: 'On our next anniversary',
  threeYears: 'In three years',
}

function isoInDays(days: number): string {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return date.toISOString().slice(0, 10)
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * M06-S09 · The letter composer. Figma 3483:4305, middle section.
 *
 * THE WORD COUNT IS COUNTED, not stored. The frame prints "438 words written"
 * beside the body field; that is a property of the text in the box, and there is
 * no state to keep for it.
 *
 * "WHENEVER THEY WISH" IS NOT A SEAL. Picking it produces a letter in the `ready`
 * state rather than `sealed` — see `sealLetter` in the store. The button and the
 * warning text under it both change, because sealing and sending are different
 * promises and the screen should not say "neither of you can open this" about a
 * letter that is already open.
 */
export function LetterComposeScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const sealLetter = usePlansStore((state) => state.sealLetter)
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const myName = profile?.name ?? 'Chandu'
  const partnerName = partner?.name ?? 'Sarah'

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [seal, setSeal] = useState<SealKey>('anniversary')
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})
  const [sealedAt, setSealedAt] = useState<string | null | undefined>(undefined)

  const days = SEAL_OPTIONS.find((option) => option.key === seal)?.days ?? null
  const opensAt = days === null ? null : isoInDays(days)

  const words = body.trim() ? body.trim().split(/\s+/).length : 0

  const onSeal = useCallback(() => {
    const next: { title?: string; body?: string } = {}

    if (!title.trim()) next.title = LETTER_COMPOSE_COPY.titleRequired
    if (!body.trim()) next.body = LETTER_COMPOSE_COPY.bodyRequired

    setErrors(next)

    if (next.title || next.body) return

    sealLetter({ to: 'partner', title, body, opensAt })
    setSealedAt(opensAt)
  }, [body, opensAt, sealLetter, title])

  /* ---------------- confirmation ---------------- */

  if (sealedAt !== undefined) {
    const names = `${myName} & ${partnerName}`

    return (
      <AppScreenLayout activeTab="plans">
        <View style={styles.done}>
          <View style={styles.waxLarge}>
            <Feather name="mail" size={20} color={theme.colors.text.onPrimary} />
          </View>

          <Chip label={LETTER_COMPOSE_COPY.done.badge} icon="check" tone="brand" />

          <Text variant="h2" tone="heading" align="center">
            {LETTER_COMPOSE_COPY.done.title}
          </Text>

          <Text variant="body" tone="body" align="center">
            {`“${LETTER_COMPOSE_COPY.done.lede}”`}
          </Text>

          <View style={styles.storedRow}>
            <Feather name="lock" size={12} color={theme.colors.brand.primary} />

            <Text variant="countdown" tone="brand" align="center">
              {sealedAt
                ? LETTER_COMPOSE_COPY.done.stored(names, longDate(sealedAt))
                : LETTER_COMPOSE_COPY.done.storedOpen(names)}
            </Text>
          </View>

          <Button
            label={LETTER_COMPOSE_COPY.done.back}
            variant="soft"
            onPress={() => router.replace('/(app)/plans/letters')}
          />
        </View>
      </AppScreenLayout>
    )
  }

  /* ---------------- the composer ---------------- */

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={LETTER_COMPOSE_COPY.eyebrow}
        chipIcon="edit-3"
        title={LETTER_COMPOSE_COPY.title}
        lede={LETTER_COMPOSE_COPY.lede}
      />

      <View style={styles.people}>
        <View style={styles.person}>
          <Text variant="caption" tone="placeholder">
            {LETTER_COMPOSE_COPY.toLabel}
          </Text>

          <View style={styles.personRow}>
            <Avatar name={partnerName} size={28} />

            <Text variant="labelStrong" tone="heading">
              {partnerName}
            </Text>
          </View>
        </View>

        <View style={styles.person}>
          <Text variant="caption" tone="placeholder">
            {LETTER_COMPOSE_COPY.fromLabel}
          </Text>

          <View style={styles.personRow}>
            <Avatar name={myName} size={28} />

            <Text variant="labelStrong" tone="heading">
              {myName}
            </Text>
          </View>
        </View>
      </View>

      <Input
        label={LETTER_COMPOSE_COPY.titleLabel}
        value={title}
        onChangeText={(next) => {
          setTitle(next)
          setErrors((e) => ({ ...e, title: undefined }))
        }}
        placeholder={LETTER_COMPOSE_COPY.titlePlaceholder}
        error={errors.title}
      />

      <View style={styles.bodyField}>
        <Input
          label={LETTER_COMPOSE_COPY.bodyLabel}
          value={body}
          onChangeText={(next) => {
            setBody(next)
            setErrors((e) => ({ ...e, body: undefined }))
          }}
          placeholder={LETTER_COMPOSE_COPY.bodyPlaceholder}
          error={errors.body}
          multiline
        />

        <Text variant="countdown" tone="placeholder">
          {LETTER_COMPOSE_COPY.wordCount(words)}
        </Text>
      </View>

      {/* ENCLOSURES — drawn in the frame, not wired to a picker yet. */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="caption" tone="placeholder">
            {LETTER_COMPOSE_COPY.encloseLabel}
          </Text>

          <Text variant="countdown" tone="placeholder">
            {LETTER_COMPOSE_COPY.encloseOptional.toUpperCase()}
          </Text>
        </View>

        <View style={styles.enclosures}>
          {(
            [
              ['photo', 'image'],
              ['memory', 'book-open'],
              ['note', 'edit-2'],
            ] as const
          ).map(([key, icon]) => (
            <View key={key} style={styles.enclosure}>
              <Feather name={icon} size={14} color={theme.colors.brand.primary} />

              <Text variant="footnote" tone="heading">
                {LETTER_COMPOSE_COPY.enclosures[key].label}
              </Text>

              <Text variant="countdown" tone="placeholder">
                {LETTER_COMPOSE_COPY.enclosures[key].hint}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* WHEN */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <View style={styles.sectionFill}>
            <Text variant="labelStrong" tone="heading">
              {LETTER_COMPOSE_COPY.whenLabel}
            </Text>

            <Text variant="footnote" tone="body">
              {LETTER_COMPOSE_COPY.whenLede}
            </Text>
          </View>

          <Chip label={LETTER_COMPOSE_COPY.waxSealed} icon="shield" tone="brand" />
        </View>

        <Text variant="caption" tone="placeholder">
          {LETTER_COMPOSE_COPY.sealUntil}
        </Text>

        <View style={styles.sealOptions}>
          {SEAL_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSeal(option.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: seal === option.key }}
              accessibilityLabel={SEAL_LABEL[option.key]}
              style={[styles.sealOption, seal === option.key && styles.sealOptionSelected]}
            >
              <Text variant="footnote" tone={seal === option.key ? 'onPrimary' : 'body'}>
                {SEAL_LABEL[option.key]}
              </Text>
            </Pressable>
          ))}
        </View>

        {opensAt ? (
          <View style={styles.sealedFor}>
            <Feather name="lock" size={12} color={theme.colors.brand.primary} />

            <Text variant="countdown" tone="brand">
              {LETTER_COMPOSE_COPY.sealedFor(longDate(opensAt))}
            </Text>
          </View>
        ) : null}
      </View>

      <Button
        label={opensAt ? LETTER_COMPOSE_COPY.seal : LETTER_COMPOSE_COPY.sealNow}
        onPress={onSeal}
      />

      <Text variant="footnote" tone="placeholder" align="center">
        {opensAt
          ? LETTER_COMPOSE_COPY.sealWarning(longDate(opensAt))
          : LETTER_COMPOSE_COPY.sendWarning}
      </Text>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  people: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  person: {
    flex: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bodyField: {
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  sectionFill: {
    flex: 1,
    gap: 2,
  },
  enclosures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  enclosure: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 0,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  sealOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sealOption: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  sealOptionSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primary,
  },
  sealedFor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
  },
  done: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.huge,
  },
  waxLarge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  storedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
