import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { MemoryForm, type MemoryFormValues } from '@/modules/module-03-memories/components/MemoryForm'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

/**
 * Edit Memory. `MemoryForm`'s only other caller — this one starts from the
 * memory's own fields and calls `update`, not `create`.
 *
 * Same sample-memory fallback as `MemoryDetailScreen` (see its header): a
 * sample memory's id was never seeded into the real store, so loading and
 * saving both fall back to treating it as sample content rather than
 * reporting "not found" or silently failing to save.
 */
export function EditMemoryScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')
  const { id } = useLocalSearchParams<{ id: string }>()

  const [memory, setMemory] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

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

  const submit = useCallback(
    async (values: MemoryFormValues) => {
      const result = await memoriesService.update({ id: String(id), ...values })

      // A sample memory has no real record to update — proceed anyway rather
      // than reporting a failure for something that was never going to save.
      if (!result.ok && !(result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT)) {
        return COPY.add.errors[result.error.code]
      }

      router.replace(`/(app)/memories/${id}`)
      return null
    },
    [id, router],
  )

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

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <Text variant="h2" tone="heading" align="center">
        {COPY.edit.heading}
      </Text>

      <MemoryForm
        initial={memory}
        submitLabel={COPY.edit.submit}
        onCancel={back}
        onSubmit={submit}
      />
    </AppScreenLayout>
  )
}
