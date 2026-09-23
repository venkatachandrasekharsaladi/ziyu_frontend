import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { YEAR_COPY } from '@/copy/yearTogether'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import type { BingoTile, BingoTileState } from '@/services/plans/types'
import { selectTilesInProgress, selectTilesStamped, usePlansStore } from '@/state/plansStore'

type Filter = 'all' | 'done' | 'in-progress'

/**
 * M06-S04 · Our Year Together. Figma 3482:1345.
 *
 * A 25-tile bingo board the couple stamps through the year.
 *
 * TILES CYCLE THROUGH THREE STATES rather than toggling between two. The board
 * draws an amber "in progress" card and spends real design attention on it, so a
 * checkbox would have left a third of the design unreachable. The cycle is in
 * the store (`NEXT_TILE_STATE`); the hint it announces is in copy.
 *
 * The grid is two columns, not the frame's three. At 390pt a third column leaves
 * each tile about 108pt wide, and the tiles carry a title AND a note — "Cook a
 * meal neither made" / "Truffle gnocchi" — which at that width wraps to five
 * lines. Two columns keeps the content the frame put in the tile.
 */
export function YearTogetherScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const board = usePlansStore((state) => state.yearBoard)
  const cycleTile = usePlansStore((state) => state.cycleTile)
  const stamped = usePlansStore(selectTilesStamped)
  const inProgress = usePlansStore(selectTilesInProgress)

  const [filter, setFilter] = useState<Filter>('all')

  const total = board.tiles.length
  const percent = total === 0 ? 0 : Math.round((stamped / total) * 100)

  const visible = useMemo(() => {
    if (filter === 'done') return board.tiles.filter((tile) => tile.state === 'done')
    if (filter === 'in-progress') return board.tiles.filter((tile) => tile.state === 'in-progress')

    return board.tiles
  }, [board.tiles, filter])

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={YEAR_COPY.eyebrow}
        chipIcon="grid"
        title={YEAR_COPY.title}
        lede={YEAR_COPY.lede}
        aside={String(board.year)}
      />

      <View style={styles.panel}>
        <ProgressBar
          value={total === 0 ? 0 : stamped / total}
          label={YEAR_COPY.progress(stamped, total)}
          trailing={YEAR_COPY.completed(percent)}
          footnote={YEAR_COPY.toGo(total - stamped)}
        />

        <View style={styles.panelFoot}>
          <Text variant="footnote" tone="body">
            {`“${board.encouragement}”`}
          </Text>

          <View style={styles.daysLeft}>
            <Text variant="countdown" tone="placeholder">
              {YEAR_COPY.daysLeft.toUpperCase()}
            </Text>

            <Text variant="labelStrong" tone="brand">
              {board.daysRemaining}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        <Chip
          label={YEAR_COPY.filters.all}
          count={total}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />

        <Chip
          label={YEAR_COPY.filters.completed}
          count={stamped}
          selected={filter === 'done'}
          onPress={() => setFilter('done')}
        />

        <Chip
          label={YEAR_COPY.filters.inProgress}
          count={inProgress}
          selected={filter === 'in-progress'}
          onPress={() => setFilter('in-progress')}
        />

        <Chip label={YEAR_COPY.addTile} icon="plus" tone="brand" />
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="footnote" tone="placeholder" align="center">
            {YEAR_COPY.empty[filter === 'done' ? 'completed' : filter]}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((tile) => (
            <TileCard key={tile.id} tile={tile} onPress={() => cycleTile(tile.id)} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Feather name="heart" size={14} color={theme.colors.brand.primary} />

        <Text variant="footnote" tone="placeholder" align="center">
          {YEAR_COPY.headerTitle}
        </Text>
      </View>
    </AppScreenLayout>
  )
}

function TileCard({ tile, onPress }: { tile: BingoTile; onPress: () => void }) {
  const { theme } = useUnistyles()

  styles.useVariants({ state: tile.state })

  const mark: Record<BingoTileState, keyof typeof Feather.glyphMap> = {
    todo: 'circle',
    'in-progress': 'clock',
    done: 'check-circle',
  }

  const markColor =
    tile.state === 'done'
      ? theme.colors.feedback.success
      : tile.state === 'in-progress'
        ? theme.colors.accents[0].ink
        : theme.colors.text.muted

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${tile.title}. ${YEAR_COPY.cycleHint[tile.state]}`}
      style={styles.tile}
    >
      <View style={styles.tileTop}>
        <Feather name={mark[tile.state]} size={16} color={markColor} />

        <Text variant="countdown" tone="placeholder">
          {String(tile.number).padStart(2, '0')}
        </Text>
      </View>

      <Text variant="footnote" tone={tile.state === 'todo' ? 'body' : 'heading'}>
        {tile.title}
      </Text>

      {tile.note ? (
        <Text variant="countdown" tone="placeholder">
          {tile.note}
        </Text>
      ) : null}

      {tile.state === 'todo' ? null : (
        <Text variant="countdown" tone={tile.state === 'done' ? 'success' : 'brand'}>
          {YEAR_COPY.badge[tile.state]}
        </Text>
      )}
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  daysLeft: {
    alignItems: 'flex-end',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    minHeight: 120,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,

    variants: {
      state: {
        todo: {
          borderColor: theme.colors.border.subtle,
          backgroundColor: theme.colors.surface.card,
        },
        // The amber card. `accents[0]` is the audited peach pair — the frame's
        // own orange is not a token and has no contrast test behind it.
        'in-progress': {
          borderColor: theme.colors.accents[0].ink,
          backgroundColor: theme.colors.accents[0].soft,
        },
        done: {
          borderColor: theme.colors.border.subtle,
          backgroundColor: theme.colors.surface.field,
        },
      },
    },
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empty: {
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.lg,
  },
}))
