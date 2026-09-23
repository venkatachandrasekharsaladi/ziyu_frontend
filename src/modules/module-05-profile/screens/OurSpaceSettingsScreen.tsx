import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { SETTINGS_OUR_SPACE_COPY as COPY } from '@/copy/settingsOurSpace'
import { CoverPreview } from '@/design-system/patterns/CoverPreview'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { useSpaceStore, type CoverStyle } from '@/state/spaceStore'

const COVER_SEGMENTS: { value: CoverStyle; label: string }[] = [
  { value: 'dawn', label: COPY.dawn },
  { value: 'dusk', label: COPY.dusk },
  { value: 'night', label: COPY.night },
]

const schema = z.object({
  name: z.string().trim().min(1, COPY.nameRequired),
  shortName: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

/**
 * M05-S05 — Settings → Our Space.
 *
 * The settings counterpart to onboarding's `PersonalizeSpaceScreen`. The cover
 * is held in component state rather than the form: it is not a text field,
 * `react-hook-form` would be carrying it only to hand it straight back, and
 * the segmented control needs the live value to paint the selection.
 */
export function OurSpaceSettingsScreen() {
  const router = useRouter()
  const name = useSpaceStore((state) => state.name)
  const shortName = useSpaceStore((state) => state.shortName)
  const storedCover = useSpaceStore((state) => state.coverStyle)
  const setSpace = useSpaceStore((state) => state.setSpace)

  const [cover, setCover] = useState<CoverStyle>(storedCover)
  const [isSaved, setIsSaved] = useState(false)

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: name ?? '', shortName: shortName ?? '' },
  })

  const goBack = useCallback(() => router.back(), [router])

  const onSubmit = useCallback(
    (values: FormValues) => {
      setSpace({ name: values.name, shortName: values.shortName, coverStyle: cover })
      setIsSaved(true)
    },
    [cover, setSpace],
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.nameGroup}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label={COPY.nameLabel}
              placeholder={COPY.namePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="shortName"
          render={({ field }) => (
            <Input
              label={COPY.shortNameLabel}
              placeholder={COPY.shortNamePlaceholder}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </SectionPanel>

      <SectionPanel title={COPY.coverGroup}>
        <SettingsChoiceRow
          label={COPY.coverLabel}
          segments={COVER_SEGMENTS}
          value={cover}
          onChange={setCover}
        />

        <CoverPreview
          coverStyle={cover}
          label={COVER_SEGMENTS.find((s) => s.value === cover)?.label ?? ''}
        />
      </SectionPanel>

      <Button label={COPY.save} onPress={handleSubmit(onSubmit)} />

      {isSaved ? (
        <Text variant="footnote" tone="success">
          {COPY.saved}
        </Text>
      ) : null}
    </SettingsScreenLayout>
  )
}
