import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { MemoryForm, type MemoryFormValues } from '@/modules/module-03-memories/components/MemoryForm'
import { memoriesService } from '@/services/memories'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M03-S03 — Add Memory. Stitch screen 510bd9c6.
 *
 * Only the title is required. Everything the design marks optional stays
 * optional, and the private "Our Note" keeps its own label so it is obvious
 * which field the partner will read. The form itself is `MemoryForm` —
 * `EditMemoryScreen`'s only real difference is what it starts with and what
 * it calls on submit.
 */
export function AddMemoryScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')
  const profile = useRelationshipStore((state) => state.profile)

  const submit = useCallback(
    async (values: MemoryFormValues) => {
      const result = await memoriesService.create({
        ...values,
        tags: [],
        addedBy: profile?.name,
      })

      if (!result.ok) return COPY.add.errors[result.error.code]

      // replace, not push: going "back" to a blank form from the memory you
      // just saved is not a place anyone wants to return to.
      router.replace('/(app)/memories')
      return null
    },
    [profile, router],
  )

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <Text variant="h2" tone="heading" align="center">
        {COPY.add.heading}
      </Text>

      <MemoryForm submitLabel={COPY.add.submit} onCancel={back} onSubmit={submit} />
    </AppScreenLayout>
  )
}
