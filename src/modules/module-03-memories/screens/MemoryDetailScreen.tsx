import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Modal, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { MemoryVideoPlayer } from '@/design-system/patterns/MemoryVideoPlayer'
import { MemoryVoicePlayer } from '@/design-system/patterns/MemoryVoicePlayer'
import { Overlay } from '@/design-system/patterns/Overlay'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PrivateNoteSheet } from '@/modules/module-03-memories/components/PrivateNoteSheet'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { useSampleFavoriteOverrides } from '@/sample/favoriteOverrides'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { usePlansStore } from '@/state/plansStore'
import { formatDate } from '@/utils/formatStoryDate'

/**
 * M03-S02 — Memory Detail. Stitch screen b5e4bef3.
 *
 * Favourite toggles from a colourful pill; everything else that acts ON the
 * memory — edit, set as cover photo, our private note, remove — sits behind
 * the kebab so a tap on the memory opens it to LOOK AT, not straight onto a
 * row of destructive-looking buttons. "Share to Chat" stays dropped: chat
 * does not exist, and a menu row with nothing behind it is worse than no row.
 *
 * SAMPLE-MEMORY FALLBACK. Every list screen already falls back to
 * `SAMPLE_MEMORIES` when the real store is empty, but this screen only ever
 * asked the real store for ONE id — a sample memory's id was never seeded
 * into it, so opening one from any list read as "That memory could not be
 * found." `load` now checks `SAMPLE_MEMORIES` on a `NOT_FOUND`, and
 * `toggleFavorite` keeps working for that memory the same way — flipping the
 * flag locally when the real store has never heard of the id, rather than
 * silently doing nothing.
 */
export function MemoryDetailScreen() {
  const back = useBackTo('/(app)/memories')
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [memory, setMemory] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noteSheetOpen, setNoteSheetOpen] = useState(false)
  const favoriteOverrides = useSampleFavoriteOverrides((state) => state.overrides)
  const setFavoriteOverride = useSampleFavoriteOverrides((state) => state.setOverride)
  const setTripCover = usePlansStore((state) => state.setTripCover)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.get({ id: String(id) })

      if (cancelled) return

      if (result.ok) {
        setMemory(result.value)
      } else if (result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT) {
        const sample = SAMPLE_MEMORIES.find((m) => m.id === id)

        if (sample) setMemory(sample)
        else setError(COPY.detail.errors[result.error.code])
      } else {
        setError(COPY.detail.errors[result.error.code])
      }

      setLoaded(true)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id])

  // Shared with every other screen, not local-only: a sample memory has no
  // record in the store to flip, so a `NOT_FOUND` there still updates the
  // shared override map — see `sample/favoriteOverrides` for why.
  const isFavorite = memory ? favoriteOverrides[memory.id] ?? memory.favorite : false

  const toggleFavorite = useCallback(async () => {
    if (!memory) return

    const result = await memoriesService.toggleFavorite({ id: memory.id })

    if (result.ok) {
      setMemory(result.value)
      setFavoriteOverride(memory.id, result.value.favorite)
    } else if (result.error.code === 'NOT_FOUND') {
      setFavoriteOverride(memory.id, !isFavorite)
    }
  }, [memory, isFavorite, setFavoriteOverride])

  const menuToggleFavorite = useCallback(() => {
    setMenuOpen(false)
    void toggleFavorite()
  }, [toggleFavorite])

  const edit = useCallback(() => {
    if (!memory) return
    setMenuOpen(false)
    router.push(`/(app)/memories/edit/${memory.id}`)
  }, [memory, router])

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const openPrivateNote = useCallback(() => {
    setMenuOpen(false)
    setNoteSheetOpen(true)
  }, [])
  const closePrivateNote = useCallback(() => setNoteSheetOpen(false), [])

  // One trip at a time — see `plansStore`'s own header — so there is no
  // "which trip" picker: this memory's photo just becomes ITS cover, and the
  // itinerary the couple lands on next shows the change immediately.
  const setAsCoverPhoto = useCallback(() => {
    if (!memory?.photoUri) return
    setTripCover(memory.photoUri)
    setMenuOpen(false)
    router.push('/(app)/plans/trip')
  }, [memory, setTripCover, router])

  const confirmDelete = useCallback(() => {
    setMenuOpen(false)
    setConfirmingDelete(true)
  }, [])
  const cancelDelete = useCallback(() => setConfirmingDelete(false), [])

  const deleteMemory = useCallback(async () => {
    if (!memory) return

    const result = await memoriesService.delete({ id: memory.id })

    // A sample memory has no real record to delete — proceed anyway rather
    // than leaving the confirm dialog stuck open over a failure that was
    // never going to happen.
    if (!result.ok && !(result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT)) return

    setConfirmingDelete(false)
    router.replace('/(app)/memories')
  }, [memory, router])

  if (!loaded) return <AppScreenLayout activeTab="memories" onBack={back} />

  if (!memory) {
    return (
      <AppScreenLayout activeTab="memories" onBack={back}>
        <StatusScreen
          heading={error ?? COPY.detail.missing}
          actions={<Button label={COPY.detail.back} onPress={back} />}
        />
      </AppScreenLayout>
    )
  }

  // Plain object, built from theme tokens rather than `StyleSheet.create` —
  // Unistyles styles do not reach `LinearGradient`. See `CoverPreview`'s own
  // `GRADIENT_FILL` for the same rule.
  const favPillFill = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: theme.control.height,
    borderRadius: theme.radii.pill,
  } as const

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {memory.title}
        </Text>

        <Text variant="footnote" tone="body">
          {[formatDate(memory.date), memory.location].filter(Boolean).join(' · ')}
        </Text>
      </View>

      {memory.photoUri ? (
        <Image
          source={{ uri: memory.photoUri }}
          // Plain style object — Unistyles styles do not reach expo-image.
          style={{
            width: '100%',
            height: 260,
            borderRadius: theme.radii.field,
            backgroundColor: theme.colors.surface.field,
          }}
          contentFit="cover"
          transition={200}
          testID="memory-detail-photo"
        />
      ) : null}

      {memory.videoUri ? <MemoryVideoPlayer uri={memory.videoUri} testID="memory-detail-video" /> : null}

      {memory.voiceUri ? (
        <MemoryVoicePlayer uri={memory.voiceUri} fallbackDurationMs={memory.voiceDurationMs} />
      ) : null}

      {memory.caption ? (
        <Text variant="body" tone="body">
          {memory.caption}
        </Text>
      ) : null}

      {memory.note ? (
        <Card>
          <Text variant="caption" tone="body">
            {COPY.detail.noteLabel}
          </Text>
          <Text variant="footnote" tone="body">
            {memory.note}
          </Text>
        </Card>
      ) : null}

      {memory.addedBy ? (
        <Text variant="footnote" tone="body">
          {COPY.detail.addedBy(memory.addedBy)}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.favPillFlex}>
          <PressableScale
            onPress={toggleFavorite}
            accessibilityLabel={isFavorite ? COPY.detail.unfavorite : COPY.detail.favorite}
          >
            {isFavorite ? (
              <LinearGradient colors={theme.colors.cover.dawn} style={favPillFill}>
                <Feather name="heart" size={16} color={theme.colors.text.heading} />
                <Text variant="labelStrong" tone="heading">
                  {COPY.detail.unfavorite}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.favPillOff}>
                <Feather name="heart" size={16} color={theme.colors.brand.primary} />
                <Text variant="labelStrong" tone="brand">
                  {COPY.detail.favorite}
                </Text>
              </View>
            )}
          </PressableScale>
        </View>

        <PressableScale onPress={openMenu} accessibilityLabel={COPY.detail.moreOptions}>
          <View style={styles.kebabButton}>
            <Feather name="more-vertical" size={20} color={theme.colors.text.heading} />
          </View>
        </PressableScale>
      </View>

      {menuOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeMenu}>
          <Overlay onDismiss={closeMenu} dismissLabel={COPY.detail.moreOptions} align="bottom">
            <View style={styles.sheet} accessibilityRole="alert" accessibilityViewIsModal>
              <Text variant="h3" tone="heading">
                {memory.title}
              </Text>

              <SettingsRow
                icon="edit-2"
                label={COPY.detail.menu.edit}
                detail={COPY.detail.menu.editDetail}
                tint={2}
                onPress={edit}
              />

              {memory.photoUri ? (
                <SettingsRow
                  icon="image"
                  label={COPY.detail.menu.setCover}
                  detail={COPY.detail.menu.setCoverDetail}
                  tint={0}
                  onPress={setAsCoverPhoto}
                />
              ) : null}

              <SettingsRow
                icon="lock"
                label={COPY.detail.menu.privateNote}
                detail={COPY.detail.menu.privateNoteDetail}
                tint={1}
                onPress={openPrivateNote}
              />

              <SettingsRow
                icon="heart"
                label={isFavorite ? COPY.detail.unfavorite : COPY.detail.favorite}
                onPress={menuToggleFavorite}
              />

              <SettingsRow
                icon="trash-2"
                label={COPY.detail.menu.remove}
                detail={COPY.detail.menu.removeDetail}
                tone="danger"
                onPress={confirmDelete}
              />
            </View>
          </Overlay>
        </Modal>
      ) : null}

      <PrivateNoteSheet
        visible={noteSheetOpen}
        onClose={closePrivateNote}
        memory={memory}
        onUpdate={setMemory}
      />

      <ConfirmDialog
        visible={confirmingDelete}
        title={COPY.detail.deleteConfirm.title}
        body={COPY.detail.deleteConfirm.body}
        confirmLabel={COPY.detail.deleteConfirm.confirm}
        cancelLabel={COPY.detail.deleteConfirm.cancel}
        onConfirm={deleteMemory}
        onCancel={cancelDelete}
        destructive
      />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  favPillFlex: {
    flex: 1,
    height: theme.control.height,
  },
  favPillOff: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: theme.control.height,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  kebabButton: {
    width: theme.control.height,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  sheet: {
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: theme.layout.column,
    alignSelf: 'center',
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.radii.panel,
    borderTopRightRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.held,
  },
}))
