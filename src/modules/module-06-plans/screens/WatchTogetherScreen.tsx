import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { WATCH_COPY } from '@/copy/watchTogether'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import {
  SAMPLE_WATCH_KEEPSAKE,
  SAMPLE_WATCH_ROOM,
  SAMPLE_WATCH_STREAM,
} from '@/sample/plans'
import type { Whisper } from '@/services/plans/types'
import { useRelationshipStore } from '@/state/relationshipStore'

const REACTIONS = ['❤️', '😂', '😮', '😊'] as const

/**
 * Fills its parent, as a PLAIN object.
 *
 * Not `StyleSheet.absoluteFill`: that is Unistyles' re-export, and Unistyles
 * styles do not survive into expo-image — the poster would draw 0×0. See
 * `expoImageStyles.test.ts`.
 */
const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/**
 * M06-S11 · Watch Together. Figma 3482:2738.
 *
 * A REAL PLAYER, not a mock surface. `expo-video` was installed for this screen,
 * so the frame's player chrome is an actual `VideoView` with native controls
 * rather than a styled rectangle — scrubbing, fullscreen and the volume slider
 * come from the platform and do not have to be drawn.
 *
 * The clip is a public test video; see `SAMPLE_WATCH_STREAM` for why, and for
 * what has to replace it.
 *
 * WHAT IS HONESTLY NOT HERE: the SYNC. The frame promises "frame locked (0.02s)"
 * between two devices, and that is a server with a clock in it, not a component.
 * The badge renders what the design draws and the session is local — anything
 * else would be a lie told in a tooltip. The seam is `WatchRoom.connected` and
 * `position`, which is where a real transport would arrive.
 *
 * NATIVE BUILD REQUIRED. `expo-video` is a native module, so this screen needs a
 * dev client (`expo run:android` / `run:ios`) — it will not run in Expo Go.
 */
export function WatchTogetherScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const partner = useRelationshipStore((state) => state.partner)
  const profile = useRelationshipStore((state) => state.profile)

  const partnerName = partner?.name ?? 'Sarah'
  const names = `${profile?.name ?? 'Chandu'} & ${partnerName}`

  const room = SAMPLE_WATCH_ROOM

  const [started, setStarted] = useState(false)
  const [whispers, setWhispers] = useState<Whisper[]>(room.whispers)
  const [draft, setDraft] = useState('')
  const [reaction, setReaction] = useState<string | null>(null)
  const [savedToMemories, setSavedToMemories] = useState(false)

  const player = useVideoPlayer(SAMPLE_WATCH_STREAM, (instance) => {
    // Not auto-played: the screen has a "Start watching now" button, and a video
    // that begins on its own would talk over whatever the user was listening to.
    instance.loop = false
    instance.muted = false
  })

  const onStart = () => {
    setStarted(true)
    player.play()
  }

  const onWhisper = () => {
    const text = draft.trim()

    if (!text) return

    setWhispers((current) => [
      ...current,
      { id: `wh-${current.length + 1}`, from: 'me', text, at: `at ${room.position}` },
    ])
    setDraft('')
  }

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={WATCH_COPY.eyebrow}
        chipIcon="film"
        title={WATCH_COPY.title}
        lede={WATCH_COPY.lede}
      />

      {/* TONIGHT'S PICK */}
      <View style={styles.pick}>
        <View style={styles.poster}>
          {room.tonight.posterUri ? (
            <Image
              source={{ uri: room.tonight.posterUri }}
              style={IMAGE_FILL}
              contentFit="cover"
              transition={200}
            />
          ) : null}
        </View>

        <View style={styles.pickBody}>
          <View style={styles.pickChips}>
            <Chip label={WATCH_COPY.pickedBy(partnerName)} icon="heart" tone="brand" />
            <Chip label={WATCH_COPY.match(room.matchScore)} icon="star" tone="success" />
          </View>

          <Text variant="countdown" tone="placeholder">
            {room.tonight.meta.toUpperCase()}
          </Text>

          <Text variant="h3" tone="heading">
            {room.tonight.title}
          </Text>

          <Text variant="footnote" tone="body">
            {`“${room.quote}”`}
          </Text>

          <Text variant="footnote" tone="body">
            {room.synopsis}
          </Text>
        </View>
      </View>

      {started ? null : (
        <>
          <Button label={WATCH_COPY.start} onPress={onStart} />

          <Button
            label={WATCH_COPY.invite(partnerName)}
            variant="soft"
            onPress={() => router.push('/(app)/chat')}
          />
        </>
      )}

      {/* THE SESSION */}
      {started ? (
        <>
          <View style={styles.sessionHead}>
            <View style={styles.live}>
              <View style={styles.liveDot} />

              <Text variant="caption" tone="placeholder">
                {WATCH_COPY.sessionLabel}
              </Text>
            </View>

            <Chip
              label={room.connected ? WATCH_COPY.connected(names) : WATCH_COPY.disconnected}
              tone={room.connected ? 'success' : 'neutral'}
              icon="users"
            />
          </View>

          <View style={styles.playerShell}>
            <VideoView
              player={player}
              style={styles.player}
              contentFit="contain"
              nativeControls
              accessibilityLabel={WATCH_COPY.playerLabel(room.tonight.title)}
            />

            <View style={styles.playerFoot}>
              <Text variant="countdown" tone="onPrimary">
                {WATCH_COPY.watchingTogether}
              </Text>

              <Text variant="countdown" tone="onPrimary">
                {WATCH_COPY.frameLocked('0.02s')}
              </Text>
            </View>
          </View>

          <View style={styles.reactions}>
            <Text variant="countdown" tone="placeholder">
              {WATCH_COPY.reactTo(partnerName)}
            </Text>

            {REACTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => setReaction(emoji)}
                accessibilityRole="button"
                accessibilityState={{ selected: reaction === emoji }}
                accessibilityLabel={`React ${emoji}`}
                style={[styles.reaction, reaction === emoji && styles.reactionActive]}
                hitSlop={4}
              >
                <Text variant="footnote" tone="body">
                  {emoji}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* WHISPERS */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="caption" tone="placeholder">
                {WATCH_COPY.whispersLabel}
              </Text>

              <Text variant="countdown" tone="brand">
                {WATCH_COPY.whispersCount(whispers.length)}
              </Text>
            </View>

            {whispers.length === 0 ? (
              <Text variant="footnote" tone="placeholder">
                {WATCH_COPY.empty.whispers}
              </Text>
            ) : (
              whispers.map((whisper) => (
                <View key={whisper.id} style={styles.whisper}>
                  <Text variant="countdown" tone="brand">
                    {whisper.from === 'me' ? profile?.name ?? 'Chandu' : partnerName}
                  </Text>

                  <Text variant="footnote" tone="body">
                    {`“${whisper.text}”`}
                  </Text>

                  <Text variant="countdown" tone="placeholder">
                    {whisper.at}
                  </Text>
                </View>
              ))
            )}

            <Input
              label={WATCH_COPY.whisper}
              value={draft}
              onChangeText={setDraft}
              placeholder={WATCH_COPY.whisperPlaceholder}
            />

            <Button
              label={WATCH_COPY.send}
              variant="soft"
              onPress={onWhisper}
              disabled={draft.trim().length === 0}
            />
          </View>

          {/* KEEPSAKE BRIDGE */}
          <View style={styles.keepsake}>
            <Text variant="caption" tone="placeholder">
              {SAMPLE_WATCH_KEEPSAKE.label}
            </Text>

            <Text variant="labelStrong" tone="heading">
              {SAMPLE_WATCH_KEEPSAKE.heading}
            </Text>

            <Text variant="footnote" tone="body">
              {SAMPLE_WATCH_KEEPSAKE.lede}
            </Text>

            <View style={styles.keepsakeRow}>
              <Feather name="film" size={14} color={theme.colors.brand.primary} />

              <View style={styles.keepsakeFill}>
                <Text variant="footnote" tone="heading">
                  {SAMPLE_WATCH_KEEPSAKE.title}
                </Text>

                <Text variant="countdown" tone="placeholder">
                  {SAMPLE_WATCH_KEEPSAKE.detail}
                </Text>
              </View>
            </View>

            <Button
              label={savedToMemories ? SAMPLE_WATCH_KEEPSAKE.footer : SAMPLE_WATCH_KEEPSAKE.action}
              onPress={() => setSavedToMemories(true)}
              disabled={savedToMemories}
            />
          </View>
        </>
      ) : null}

      {/* CONTINUE WATCHING */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="caption" tone="placeholder">
            {WATCH_COPY.continueLabel}
          </Text>

          <Text variant="countdown" tone="brand">
            {WATCH_COPY.viewQueue(room.queue.length)}
          </Text>
        </View>

        <View style={styles.queue}>
          {room.queue.map((title) => (
            <View key={title.id} style={styles.queueCell}>
              <View style={styles.queueCard}>
                <View style={styles.queuePoster}>
                  {title.posterUri ? (
                    <Image
                      source={{ uri: title.posterUri }}
                      style={IMAGE_FILL}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : null}
                </View>

                <Text variant="countdown" tone="brand">
                  {WATCH_COPY.finished(title.progress).toUpperCase()}
                </Text>

                <Text variant="labelStrong" tone="heading">
                  {title.title}
                </Text>

                <ProgressBar value={title.progress / 100} footnote={title.remaining ?? undefined} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* HISTORY */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="caption" tone="placeholder">
            {WATCH_COPY.historyLabel}
          </Text>

          {/*
           * Derived, not the frame's literal 14. That number sat above a list
           * of three and would have kept claiming 14 whatever the history held.
           */}
          <Text variant="countdown" tone="brand">
            {WATCH_COPY.titlesWatched(room.history.length)}
          </Text>
        </View>

        {room.history.map((entry) => (
          <View key={entry.id} style={styles.historyRow}>
            <View style={styles.historyIcon}>
              <Feather name="check" size={14} color={theme.colors.feedback.success} />
            </View>

            <View style={styles.historyFill}>
              <View style={styles.historyTop}>
                <View style={styles.historyTitleFill}>
                  <Text variant="labelStrong" tone="heading">
                    {entry.title}
                  </Text>
                </View>

                <Chip label={WATCH_COPY.completed} tone="success" />
              </View>

              <Text variant="countdown" tone="placeholder">
                {entry.detail}
              </Text>

              <Text variant="countdown" tone="body">
                {entry.reactions}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  pick: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  poster: {
    width: 96,
    height: 136,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  pickBody: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  pickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  sessionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.feedback.success,
  },
  /*
   * The shell is near-black in BOTH themes and does not use a surface token.
   * A player is a window onto someone else's picture, and a lavender letterbox
   * around a film tints it. This is the one place in the app where the ground is
   * deliberately not the theme's.
   */
  playerShell: {
    borderRadius: theme.radii.tile,
    backgroundColor: '#0B0A12',
    overflow: 'hidden',
  },
  player: {
    width: '100%',
    height: 220,
  },
  playerFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  reaction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  reactionActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.field,
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
  whisper: {
    gap: 2,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  keepsake: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.accents[2].soft,
  },
  keepsakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.card,
  },
  keepsakeFill: {
    flex: 1,
    gap: 2,
  },
  queue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  queueCell: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  queueCard: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  queuePoster: {
    height: 90,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  historyIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[1].soft,
  },
  historyFill: {
    flex: 1,
    gap: 2,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyTitleFill: {
    flex: 1,
  },
}))
