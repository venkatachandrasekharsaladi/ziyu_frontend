import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_MEMORIES_COPY as COPY } from '@/copy/settingsMemories'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { Text } from '@/design-system/primitives/Text'
import { usePreferencesStore } from '@/state/preferencesStore'

// `defaultAlbumKey` is typed `string` on the store, not the literal union
// `COPY.albums`'s keys form — this alias is what lets it index the `as const`
// object without a type error, while the actual labels stay in copy.
const ALBUM_LABEL: Record<string, string> = COPY.albums

/**
 * M05-S12 — Settings → Memories & Story.
 *
 * The delivery time hides when On This Day is off, the same judgement the quiet
 * hours times follow on Notifications: "arrives at 09:00" describes nothing
 * that is going to arrive.
 *
 * The album list is a local label map, not a read of the memories service. A
 * settings screen that imports `services/memories` to populate a picker takes
 * a dependency the cluster otherwise does not have; when a real album list
 * exists, this map becomes a read and the row does not change.
 */
export function MemoriesSettingsScreen() {
  const router = useRouter()
  const state = usePreferencesStore()
  const toggle = usePreferencesStore((s) => s.toggle)

  const goBack = useCallback(() => router.back(), [router])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.resurfaceGroup}>
        <SettingsToggleRow
          icon="sunrise"
          label={COPY.onThisDay}
          detail={COPY.onThisDayDetail}
          value={state.onThisDayEnabled}
          onValueChange={() => toggle('onThisDayEnabled')}
        />

        {state.onThisDayEnabled ? (
          <SettingsRow icon="clock" label={COPY.deliveryTime} value={state.onThisDayTime} />
        ) : null}
      </SectionPanel>

      <SectionPanel title={COPY.captureGroup}>
        <SettingsToggleRow
          icon="image"
          label={COPY.autoAdd}
          detail={COPY.autoAddDetail}
          value={state.autoAddChatPhotos}
          onValueChange={() => toggle('autoAddChatPhotos')}
        />
        <SettingsRow
          icon="folder"
          label={COPY.defaultAlbum}
          value={ALBUM_LABEL[state.defaultAlbumKey] ?? ALBUM_LABEL.all}
        />

        {/*
          The row reports an album and offers no way to pick another one. A
          settings screen showing a value nobody can change has to say that out
          loud, rather than leaving someone to tap it twice and conclude the
          app is broken.
        */}
        <Text variant="footnote" tone="body">
          {COPY.defaultAlbumFixed}
        </Text>

        <SettingsToggleRow
          icon="bell"
          label={COPY.reminders}
          detail={COPY.remindersDetail}
          value={state.memoryReminders}
          onValueChange={() => toggle('memoryReminders')}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
