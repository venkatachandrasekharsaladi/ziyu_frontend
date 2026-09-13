import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_LEGAL_COPY as COPY } from '@/copy/settingsLegal'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { Text } from '@/design-system/primitives/Text'
import type { LegalDocumentData } from '@/modules/module-05-profile/data/legal'

type LegalDocumentProps = {
  document: LegalDocumentData
}

/**
 * Renders a legal document, and its placeholder banner if it has one.
 *
 * THE BANNER IS DRAWN FROM THE DOCUMENT, not from the screen. Both legal
 * screens use this component, so neither can ship invented terms by forgetting
 * to include the warning — the only way to remove it is to set
 * `isPlaceholder: false` on the document, which is exactly the moment a real
 * one arrives.
 */
export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <>
      {document.isPlaceholder ? (
        <View style={styles.notice}>
          <Text variant="footnote" tone="error">
            {COPY.placeholderNotice}
          </Text>
        </View>
      ) : null}

      <Text variant="footnote" tone="body">
        {`${COPY.updatedPrefix} ${document.updated}`}
      </Text>

      {document.sections.map((section) => (
        <SectionPanel key={section.heading} title={section.heading}>
          <Text variant="body" tone="body">
            {section.body}
          </Text>
        </SectionPanel>
      ))}
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  notice: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.feedback.error,
    backgroundColor: theme.colors.surface.field,
  },
}))
