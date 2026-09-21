import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { LIFETIME_COPY } from '@/copy/lifetime'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import type { PromiseCategory, SharedPromise } from '@/services/plans/types'
import { selectPromisesLived, usePlansStore } from '@/state/plansStore'

const CATEGORIES: PromiseCategory[] = ['travel', 'adventure', 'romance', 'life', 'wild']

const CATEGORY_ICON: Record<PromiseCategory, keyof typeof Feather.glyphMap> = {
  travel: 'send',
  adventure: 'compass',
  romance: 'heart',
  life: 'home',
  wild: 'zap',
}

/**
 * M06-S05 · Once in a Lifetime. Figma 3482:1672.
 *
 * A 50-promise bucketlist, grouped by category, with a lived/waiting toggle.
 *
 * GROUPED RENDERING, NOT A FLAT LIST. The frame draws five headed sections, each
 * with its own "2 of 4 lived" count, and those counts are the only place the
 * screen says anything a total cannot. Flattening to one list with a category
 * chip on each row would have lost them.
 *
 * A LIVED PROMISE IS STRUCK THROUGH. The frame does this and it is worth keeping
 * for a reason beyond decoration: the tick, the green badge and the strike all
 * say the same thing, so the state survives if any one of them is lost — to a
 * colour-blind reader, to a screen reader, or to a greyscale screenshot.
 */
export function LifetimeScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const promises = usePlansStore((state) => state.promises)
  const target = usePlansStore((state) => state.lifetimeTarget)
  const toggle = usePlansStore((state) => state.togglePromiseLived)
  const addPromise = usePlansStore((state) => state.addPromise)
  const lived = usePlansStore(selectPromisesLived)

  const [filter, setFilter] = useState<PromiseCategory | 'all'>('all')
  const [draft, setDraft] = useState('')

  const percent = target === 0 ? 0 : Math.round((lived / target) * 100)
  const lastCompleted = useMemo(
    () => promises.filter((p) => p.lived).at(-1)?.title ?? null,
    [promises],
  )

  const sections = useMemo(
    () =>
      CATEGORIES.filter((category) => filter === 'all' || filter === category).map((category) => ({
        category,
        items: promises.filter((promise) => promise.category === category),
      })),
    [filter, promises],
  )

  const onAdd = () => {
    const title = draft.trim()

    if (!title) return

    // Filed under the category in view, or `life` when looking at everything —
    // "a thing we want to do" with no other signal belongs to the catch-all.
    addPromise({
      title,
      detail: 'Just ours.',
      category: filter === 'all' ? 'life' : filter,
    })
    setDraft('')
  }

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={LIFETIME_COPY.eyebrow}
        chipIcon="heart"
        title={LIFETIME_COPY.title}
        lede={LIFETIME_COPY.lede(target)}
      />

      <View style={styles.panel}>
        <ProgressBar
          value={target === 0 ? 0 : lived / target}
          label={LIFETIME_COPY.summary(lived, target)}
          trailing={LIFETIME_COPY.percentLived(percent)}
          footnote={LIFETIME_COPY.stillWaiting(Math.max(0, target - lived))}
        />

        <View style={styles.panelFoot}>
          {lastCompleted ? (
            <Text variant="countdown" tone="placeholder">
              {LIFETIME_COPY.lastCompleted(lastCompleted)}
            </Text>
          ) : (
            <View />
          )}

          <Text variant="countdown" tone="brand">
            {`“${LIFETIME_COPY.together}”`}
          </Text>
        </View>
      </View>

      <View style={styles.filterHead}>
        <Text variant="caption" tone="placeholder">
          {LIFETIME_COPY.filterLabel}
        </Text>

        <Text variant="countdown" tone="brand">
          {LIFETIME_COPY.viewAll(target)}
        </Text>
      </View>

      <View style={styles.filters}>
        <Chip
          label={LIFETIME_COPY.all}
          count={promises.length}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />

        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={LIFETIME_COPY.categories[category]}
            icon={CATEGORY_ICON[category]}
            count={promises.filter((p) => p.category === category).length}
            selected={filter === category}
            onPress={() => setFilter(category)}
          />
        ))}
      </View>

      {sections.map(({ category, items }) => (
        <View key={category} style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitle}>
              <Feather
                name={CATEGORY_ICON[category]}
                size={14}
                color={theme.colors.brand.primary}
              />

              <Text variant="h3" tone="heading">
                {LIFETIME_COPY.categories[category]}
              </Text>
            </View>

            <Text variant="countdown" tone="placeholder">
              {LIFETIME_COPY.categoryProgress(
                items.filter((item) => item.lived).length,
                items.length,
              )}
            </Text>
          </View>

          {items.length === 0 ? (
            <Text variant="footnote" tone="placeholder">
              {LIFETIME_COPY.empty}
            </Text>
          ) : (
            items.map((promise) => (
              <PromiseRow
                key={promise.id}
                promise={promise}
                onToggle={() => toggle(promise.id)}
              />
            ))
          )}
        </View>
      ))}

      {/* ADD YOUR OWN DREAM */}
      <View style={styles.addPanel}>
        <View style={styles.addHead}>
          <View style={styles.addDisc}>
            <Feather name="plus" size={14} color={theme.colors.text.onPrimary} />
          </View>

          <View style={styles.addFill}>
            <Text variant="labelStrong" tone="heading">
              {LIFETIME_COPY.add.title}
            </Text>

            <Text variant="footnote" tone="body">
              {LIFETIME_COPY.add.lede}
            </Text>
          </View>
        </View>

        <Input
          label={LIFETIME_COPY.add.title}
          value={draft}
          onChangeText={setDraft}
          placeholder={LIFETIME_COPY.add.placeholder}
        />

        <Button
          label={LIFETIME_COPY.add.action}
          onPress={onAdd}
          disabled={draft.trim().length === 0}
        />
      </View>
    </AppScreenLayout>
  )
}

function PromiseRow({ promise, onToggle }: { promise: SharedPromise; onToggle: () => void }) {
  const { theme } = useUnistyles()

  styles.useVariants({ lived: promise.lived })

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: promise.lived }}
      accessibilityLabel={`${promise.title}. ${
        promise.lived ? LIFETIME_COPY.toggleHint.lived : LIFETIME_COPY.toggleHint.waiting
      }`}
      style={styles.row}
    >
      <Feather
        name={promise.lived ? 'check-circle' : 'circle'}
        size={18}
        color={promise.lived ? theme.colors.feedback.success : theme.colors.border.field}
      />

      <View style={styles.rowFill}>
        <View style={styles.rowTitle}>
          <View style={styles.rowTitleFill}>
            <Text variant="labelStrong" tone="heading" strike={promise.lived}>
              {promise.title}
            </Text>
          </View>

          {promise.lived ? (
            <View style={styles.didIt}>
              <Text variant="countdown" tone="success">
                {LIFETIME_COPY.didIt.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="footnote" tone="body">
          {promise.detail}
        </Text>

        {promise.linkLabel ? (
          <View style={styles.link}>
            <Feather name="image" size={11} color={theme.colors.brand.primary} />

            <Text variant="countdown" tone="brand">
              {promise.linkLabel}
            </Text>
          </View>
        ) : null}

        {promise.tag ? (
          <View style={styles.tag}>
            <Text variant="countdown" tone="placeholder">
              {promise.tag}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  panel: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  panelFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  filterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,

    variants: {
      lived: {
        true: {
          borderColor: theme.colors.border.subtle,
          backgroundColor: theme.colors.surface.field,
        },
        false: {
          borderColor: theme.colors.border.subtle,
          backgroundColor: theme.colors.surface.card,
        },
      },
    },
  },
  rowFill: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  rowTitleFill: {
    flex: 1,
  },
  didIt: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[1].soft,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  addPanel: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  addHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  addDisc: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  addFill: {
    flex: 1,
    gap: 2,
  },
}))
