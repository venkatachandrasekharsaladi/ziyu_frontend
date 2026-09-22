import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CAPSULE_CREATE_COPY } from '@/copy/capsules'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { SAMPLE_CAPSULE_KINDS } from '@/sample/plans'
import type { Capsule, CapsuleItemKind } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'

const STEPS = 3

/** The four offered unseal dates, as offsets from today. */
const WHEN_OPTIONS = [
  { key: 'year', years: 1 },
  { key: 'threeYears', years: 3 },
  { key: 'fiveYears', years: 5 },
  { key: 'tenYears', years: 10 },
] as const

type WhenKey = (typeof WHEN_OPTIONS)[number]['key']

function isoYearsFromNow(years: number): string {
  const date = new Date()

  date.setFullYear(date.getFullYear() + years)

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
 * M06-S07 · Sealing a time capsule. Figma 3482:2146, lower half.
 *
 * Three steps and then a confirmation, as the frame draws them.
 *
 * ONE SCREEN, NOT FOUR ROUTES. The steps share a single draft and none of them
 * is independently reachable or worth linking to — a URL for "step 2 of a
 * capsule you have not started" would resolve to nothing. The wizard is local
 * state; only the finished capsule reaches the store.
 *
 * THE CONFIRMATION IS A STATE OF THIS SCREEN, not a redirect back to the vault.
 * "It's sealed" is the payoff for the whole flow, and bouncing straight to a
 * list would have thrown it away. `sealed` holding the returned capsule is also
 * what lets the confirmation print that capsule's real vault code rather than a
 * fixture.
 */
export function CapsuleCreateScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const sealCapsule = usePlansStore((state) => state.sealCapsule)

  const [step, setStep] = useState(1)
  const [kinds, setKinds] = useState<CapsuleItemKind[]>(['photos', 'letter', 'prediction'])
  const [when, setWhen] = useState<WhenKey>('fiveYears')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [sealed, setSealed] = useState<Capsule | null>(null)

  const opensAt = isoYearsFromNow(WHEN_OPTIONS.find((o) => o.key === when)?.years ?? 1)

  const toggleKind = useCallback((kind: CapsuleItemKind) => {
    setError(undefined)
    setKinds((current) =>
      current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind],
    )
  }, [])

  const onNext = useCallback(() => {
    if (step === 1 && kinds.length === 0) {
      setError(CAPSULE_CREATE_COPY.kindsRequired)

      return
    }

    setStep((s) => Math.min(STEPS, s + 1))
  }, [kinds.length, step])

  const onSeal = useCallback(() => {
    setSealed(sealCapsule({ kinds, opensAt, sealNote: note }))
  }, [kinds, note, opensAt, sealCapsule])

  /* ---------------- the confirmation ---------------- */

  if (sealed) {
    /*
     * Measured from when the capsule was CREATED, not from now.
     *
     * "Time locked: 365 days" is a property of the capsule — how long it was
     * sealed for — so it should read the same whenever this screen is looked
     * at. Reading `Date.now()` here also made the render impure, which
     * `react-hooks/purity` flags: the same component would render different
     * text on two renders with identical props.
     *
     * The vault screen's "478 days remaining" is the opposite and correctly
     * uses now — that one is a countdown, and a countdown that ignores today
     * is the lie the Figma frame told.
     */
    const lockedDays = Math.max(
      0,
      Math.round(
        (new Date(`${sealed.opensAt}T00:00:00`).getTime() -
          new Date(`${sealed.createdAt}T00:00:00`).getTime()) /
          86_400_000,
      ),
    )

    return (
      <AppScreenLayout activeTab="plans">
        <View style={styles.done}>
          <View style={styles.seal}>
            <Feather name="lock" size={20} color={theme.colors.text.onPrimary} />
          </View>

          <Chip label={CAPSULE_CREATE_COPY.done.badge} icon="shield" tone="brand" />

          <Text variant="h2" tone="heading" align="center">
            {CAPSULE_CREATE_COPY.done.title}
          </Text>

          <Text variant="body" tone="body" align="center">
            {CAPSULE_CREATE_COPY.done.lede}
          </Text>

          <View style={styles.receipt}>
            <Receipt label={CAPSULE_CREATE_COPY.done.vaultCode} value={sealed.vaultCode} />
            <Receipt
              label={CAPSULE_CREATE_COPY.done.timeLocked}
              value={`${lockedDays} days`}
            />
            <Receipt
              label={CAPSULE_CREATE_COPY.done.sealedBy}
              value={CAPSULE_CREATE_COPY.done.both}
            />
          </View>

          <Button
            label={CAPSULE_CREATE_COPY.done.home}
            variant="soft"
            onPress={() => router.replace('/(app)/plans')}
          />
        </View>
      </AppScreenLayout>
    )
  }

  /* ---------------- the wizard ---------------- */

  return (
    <AppScreenLayout
      activeTab="plans"
      onBack={step === 1 ? () => router.back() : () => setStep((s) => s - 1)}
    >
      <ScreenIntro
        chip={CAPSULE_CREATE_COPY.eyebrow}
        chipIcon="edit-3"
        title={
          step === 1
            ? CAPSULE_CREATE_COPY.kindsTitle
            : step === 2
              ? CAPSULE_CREATE_COPY.whenTitle
              : CAPSULE_CREATE_COPY.noteLabel
        }
        lede={
          step === 1
            ? CAPSULE_CREATE_COPY.kindsLede
            : step === 2
              ? CAPSULE_CREATE_COPY.whenLede
              : undefined
        }
        aside={CAPSULE_CREATE_COPY.newKeepsake}
      />

      <ProgressBar
        value={step / STEPS}
        label={CAPSULE_CREATE_COPY.step(step, STEPS)}
      />

      {step === 1 ? (
        <View style={styles.grid}>
          {SAMPLE_CAPSULE_KINDS.map((option) => {
            const selected = kinds.includes(option.kind)

            return (
              <Pressable
                key={option.kind}
                onPress={() => toggleKind(option.kind)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.label}. ${option.hint}`}
                style={[styles.kind, selected && styles.kindSelected]}
              >
                <View style={styles.kindTop}>
                  <Feather
                    name={option.icon}
                    size={16}
                    color={selected ? theme.colors.brand.primary : theme.colors.text.placeholder}
                  />

                  {selected ? (
                    <Feather name="check-circle" size={14} color={theme.colors.brand.primary} />
                  ) : null}
                </View>

                <Text variant="labelStrong" tone={selected ? 'heading' : 'body'}>
                  {option.label}
                </Text>

                <Text variant="countdown" tone="placeholder">
                  {option.hint}
                </Text>
              </Pressable>
            )
          })}
        </View>
      ) : null}

      {error ? (
        <Text variant="footnote" tone="error">
          {error}
        </Text>
      ) : null}

      {step === 2 ? (
        <View style={styles.whenList}>
          {WHEN_OPTIONS.map((option) => {
            const selected = when === option.key
            const date = isoYearsFromNow(option.years)

            return (
              <Pressable
                key={option.key}
                onPress={() => setWhen(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${CAPSULE_CREATE_COPY.options[option.key]}, ${longDate(date)}`}
                style={[styles.whenRow, selected && styles.whenRowSelected]}
              >
                <Feather
                  name={selected ? 'check-circle' : 'circle'}
                  size={18}
                  color={selected ? theme.colors.brand.primary : theme.colors.border.field}
                />

                <View style={styles.whenFill}>
                  <Text variant="labelStrong" tone="heading">
                    {CAPSULE_CREATE_COPY.options[option.key]}
                  </Text>

                  <Text variant="countdown" tone="placeholder">
                    {longDate(date)}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      ) : null}

      {step === 3 ? (
        <>
          <View style={styles.summary}>
            <Text variant="caption" tone="placeholder">
              {CAPSULE_CREATE_COPY.unsealsOn}
            </Text>

            <Text variant="h3" tone="brand">
              {longDate(opensAt)}
            </Text>

            <View style={styles.summaryChips}>
              {kinds.map((kind) => (
                <Chip
                  key={kind}
                  label={SAMPLE_CAPSULE_KINDS.find((k) => k.kind === kind)?.label ?? kind}
                />
              ))}
            </View>
          </View>

          <Input
            label={`${CAPSULE_CREATE_COPY.noteLabel} · ${CAPSULE_CREATE_COPY.noteOptional}`}
            value={note}
            onChangeText={setNote}
            placeholder={CAPSULE_CREATE_COPY.notePlaceholder}
            multiline
          />
        </>
      ) : null}

      {step === STEPS ? (
        <>
          <Button label={CAPSULE_CREATE_COPY.seal} onPress={onSeal} />

          <Text variant="footnote" tone="placeholder" align="center">
            {CAPSULE_CREATE_COPY.sealWarning}
          </Text>
        </>
      ) : (
        <Button label={CAPSULE_CREATE_COPY.next} onPress={onNext} />
      )}
    </AppScreenLayout>
  )
}

function Receipt({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.receiptCell}>
      <Text variant="countdown" tone="placeholder" align="center">
        {label.toUpperCase()}
      </Text>

      <Text variant="labelStrong" tone="brand" align="center">
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  kind: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  kindSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.field,
  },
  kindTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whenList: {
    gap: theme.spacing.md,
  },
  whenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  whenRowSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.field,
  },
  whenFill: {
    flex: 1,
    gap: 2,
  },
  summary: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  summaryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  done: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.huge,
  },
  seal: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  receipt: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  receiptCell: {
    flex: 1,
    gap: 2,
  },
}))
