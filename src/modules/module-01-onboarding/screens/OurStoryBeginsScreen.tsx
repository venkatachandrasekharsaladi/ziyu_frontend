import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { OUR_STORY_BEGINS_COPY as COPY } from '@/copy/ourStoryBegins'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S11 — Our Story Begins. Figma 522:834.
 *
 * The end of the built flow. Both exits belong to Cluster 3 (M01-S12…S19),
 * which does not exist, so they are disabled and the screen says so rather than
 * navigating to a route that would throw. A pressable button that silently does
 * nothing is worse than one that admits it is not ready.
 *
 * The note and the `disabled` flags go together when Cluster 3 lands.
 */
export function OurStoryBeginsScreen() {
  const noop = useCallback(() => {}, [])

  return (
    <AuthScreenLayout centred>
      <StatusScreen
        heading={COPY.heading}
        lede={COPY.lede}
        actions={
          <>
            <Button label={COPY.begin} onPress={noop} disabled />
            <Button label={COPY.skip} onPress={noop} variant="link" disabled />

            <View style={styles.note}>
              <Text variant="footnote" tone="body" align="center">
                {COPY.endOfFlowNote}
              </Text>
            </View>
          </>
        }
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  note: {
    paddingTop: theme.spacing.md,
  },
}))
