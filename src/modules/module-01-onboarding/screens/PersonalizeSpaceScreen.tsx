import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { PERSONALIZE_SPACE_COPY as COPY } from '@/copy/personalizeSpace'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { SegmentedControl } from '@/design-system/primitives/SegmentedControl'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useSpaceStore, type CoverStyle } from '@/state/spaceStore'

/**
 * M01-S20 — Personalize Our Space. Stitch screen d7262d77.
 *
 * The cover style reuses `SegmentedControl` rather than the swatch row the
 * design draws. A swatch grid picks a colour by colour alone, which is exactly
 * what every other state in this app refuses to do; named segments carry the
 * choice to a screen reader as well as to the eye.
 */
export function PersonalizeSpaceScreen() {
  const router = useRouter()
  const setSpace = useSpaceStore((state) => state.setSpace)

  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('dawn')
  const [error, setError] = useState<string | null>(null)

  const next = useCallback(() => router.push('/(onboarding)/ready-to-come-home'), [router])

  const submit = useCallback(() => {
    if (!name.trim()) {
      setError(COPY.nameRequired)
      return
    }

    setSpace({ name: name.trim(), shortName, coverStyle })
    next()
  }, [name, shortName, coverStyle, setSpace, next])

  return (
    <AuthScreenLayout onBack={router.back}>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label={COPY.nameLabel}
          value={name}
          onChangeText={(next) => {
            setName(next)
            setError(null)
          }}
          placeholder={COPY.namePlaceholder}
          autoCapitalize="words"
          error={error ?? undefined}
        />

        <Input
          label={COPY.shortNameLabel}
          value={shortName}
          onChangeText={setShortName}
          placeholder={COPY.shortNamePlaceholder}
          autoCapitalize="characters"
        />

        <SegmentedControl
          label={COPY.styleLabel}
          segments={[...COPY.styles]}
          value={coverStyle}
          onChange={setCoverStyle}
        />

        <Button label={COPY.submit} onPress={submit} />
        <Button label={COPY.skip} onPress={next} variant="link" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.md,
  },
}))
