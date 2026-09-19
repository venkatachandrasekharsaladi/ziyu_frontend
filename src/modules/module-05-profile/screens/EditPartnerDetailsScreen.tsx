import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { z } from 'zod'

import { SPACE_EDIT_PARTNER_COPY as COPY } from '@/copy/spaceEditPartner'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { useBackTo } from '@/hooks/useBackTo'

const schema = z.object({
  name: z.string().trim().min(1, COPY.nameRequired),
  nickname: z.string().trim().optional(),
  pronouns: z.string().trim().optional(),
  birthday: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

/**
 * M05-S31 — Space → Edit Partner Details. Figma `3430:1040`.
 *
 * THE BIRTHDAY DOES NOT LIVE ON THE PARTNER. It is `storyStore.keyDates
 * .partnerBirthday`, where Gentle Reminders already reads it from, so this
 * screen writes two stores on one save. Copying it onto the partner record as
 * well would give the app two answers to "when is their birthday" and no rule
 * for which one wins.
 *
 * The other three fields go to `relationshipStore.partner`, and `id` is
 * carried through untouched — it is the pairing identity, not a detail.
 *
 * A pair who have not linked yet can still reach this screen from Our Identity,
 * so there is an unpaired state. The alternative was a form that invents a
 * partner record for someone who does not exist.
 */
export function EditPartnerDetailsScreen() {
  const router = useRouter()
  const partner = useRelationshipStore((state) => state.partner)
  const setPartner = useRelationshipStore((state) => state.setPartner)
  const keyDates = useStoryStore((state) => state.keyDates)
  const setKeyDates = useStoryStore((state) => state.setKeyDates)

  const [isSaved, setIsSaved] = useState(false)

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: partner?.name ?? '',
      nickname: partner?.nickname ?? '',
      pronouns: partner?.pronouns ?? '',
      birthday: keyDates?.partnerBirthday ?? '',
    },
  })

  const back = useBackTo('/(app)/space/identity')
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  const onSubmit = useCallback(
    (values: FormValues) => {
      if (!partner) return

      setPartner({
        ...partner,
        name: values.name,
        nickname: values.nickname || undefined,
        pronouns: values.pronouns || undefined,
      })

      setKeyDates({ ...keyDates, partnerBirthday: values.birthday || undefined })
      setIsSaved(true)
    },
    [partner, setPartner, keyDates, setKeyDates],
  )

  if (!partner) {
    return (
      <SettingsScreenLayout title={COPY.barTitle} onBack={back}>
        <View style={styles.empty}>
          <Text variant="h3" tone="heading" align="center">
            {COPY.noPartnerTitle}
          </Text>
          <Text variant="body" tone="body" align="center">
            {COPY.noPartnerBody}
          </Text>
        </View>

        <Button label={COPY.invite} onPress={go('/(app)/settings/partner')} />
      </SettingsScreenLayout>
    )
  }

  return (
    <SettingsScreenLayout title={COPY.barTitle} onBack={back}>
      <View style={styles.header}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.photo}>
        <PhotoPicker
          label={COPY.photo}
          name={partner.name}
          uri={partner.photoUri}
          // The picker belongs to the settings screen that owns
          // `expo-image-picker`; see `EditMyProfileScreen` for the same note.
          onPick={go('/(app)/settings/partner')}
        />
      </View>

      <View style={styles.form}>
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

        <View>
          <Controller
            control={control}
            name="nickname"
            render={({ field }) => (
              <Input
                label={COPY.nicknameLabel}
                placeholder={COPY.nicknamePlaceholder}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Text variant="footnote" tone="placeholder" align="center">
            {COPY.nicknameHint}
          </Text>
        </View>

        <Controller
          control={control}
          name="pronouns"
          render={({ field }) => (
            <Input
              label={COPY.pronounsLabel}
              placeholder={COPY.pronounsPlaceholder}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="birthday"
          render={({ field, fieldState }) => (
            <DateField
              label={COPY.birthdayLabel}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <Button label={COPY.save} onPress={handleSubmit(onSubmit)} />

      {isSaved ? (
        <Text variant="footnote" tone="success">
          {COPY.saved}
        </Text>
      ) : null}
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  photo: {
    alignItems: 'center',
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  empty: {
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
}))
