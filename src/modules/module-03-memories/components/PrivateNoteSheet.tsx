import { useCallback, useState } from 'react'
import { Modal, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Input } from '@/design-system/primitives/Input'
import { Overlay } from '@/design-system/patterns/Overlay'
import { Text } from '@/design-system/primitives/Text'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

type PrivateNoteSheetProps = {
  visible: boolean
  onClose: () => void
  memory: Memory
  /** Reflects a successful write/withdraw back onto the caller's own state. */
  onUpdate: (next: Memory) => void
}

/**
 * The reciprocal private note, on a memory — writing yours, seeing both once
 * revealed, or withdrawing it. `updatePrivateNote` / `withdrawPrivateNote`
 * have lived in `memoriesService` since before this screen existed; this is
 * the first screen to actually call them.
 *
 * SAMPLE-MEMORY FALLBACK, same shape as `MemoryDetailScreen`'s: a sample
 * memory has no record in the real store, so both calls answer `NOT_FOUND`.
 * Rather than report a failure for a note that was never going to save, this
 * applies the edit to the in-memory `memory` directly — honestly, though:
 * there is no partner to write the other half for sample content, so a
 * sample memory's note never reveals. That is the correct behaviour, not a
 * bug to route around.
 */
export function PrivateNoteSheet({ visible, onClose, memory, onUpdate }: PrivateNoteSheetProps) {
  const [draft, setDraft] = useState(memory.myPrivateNote ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false)

  const save = useCallback(async () => {
    const value = draft.trim()
    if (!value) return

    setSaving(true)
    setError(null)

    const result = await memoriesService.updatePrivateNote({ id: memory.id, note: value })

    if (result.ok) {
      onUpdate(result.value)
    } else if (result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT) {
      onUpdate({ ...memory, myPrivateNote: value })
    } else {
      setError(COPY.privateNote.errors[result.error.code])
    }

    setSaving(false)
  }, [draft, memory, onUpdate])

  const confirmWithdraw = useCallback(() => setConfirmingWithdraw(true), [])
  const cancelWithdraw = useCallback(() => setConfirmingWithdraw(false), [])

  const withdraw = useCallback(async () => {
    setSaving(true)
    setError(null)

    const result = await memoriesService.withdrawPrivateNote({ id: memory.id })

    if (result.ok) {
      onUpdate(result.value)
    } else if (result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT) {
      onUpdate({
        ...memory,
        myPrivateNote: undefined,
        partnerPrivateNote: undefined,
        reciprocalNotesRevealed: false,
      })
    } else {
      setError(COPY.privateNote.errors[result.error.code])
    }

    setSaving(false)
    setConfirmingWithdraw(false)
    setDraft('')
  }, [memory, onUpdate])

  if (!visible) return null

  const hasNote = Boolean(memory.myPrivateNote)

  return (
    <>
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <Overlay onDismiss={onClose} dismissLabel={COPY.privateNote.close} align="bottom">
        <View style={styles.sheet} accessibilityRole="alert" accessibilityViewIsModal>
          <Text variant="h3" tone="heading">
            {COPY.privateNote.heading}
          </Text>

          {memory.reciprocalNotesRevealed ? (
            <>
              <Card>
                <Text variant="caption" tone="muted">
                  {COPY.privateNote.yourNote.toUpperCase()}
                </Text>
                <Text variant="footnote" tone="body">
                  {memory.myPrivateNote}
                </Text>
              </Card>
              <Card>
                <Text variant="caption" tone="muted">
                  {COPY.privateNote.partnerNote.toUpperCase()}
                </Text>
                <Text variant="footnote" tone="body">
                  {memory.partnerPrivateNote}
                </Text>
              </Card>
              <Button
                label={COPY.privateNote.withdraw}
                onPress={confirmWithdraw}
                variant="outline"
                disabled={saving}
              />
            </>
          ) : hasNote ? (
            <>
              <Text variant="body" tone="body">
                {COPY.privateNote.lede}
              </Text>
              <Card>
                <Text variant="caption" tone="muted">
                  {COPY.privateNote.yourNote.toUpperCase()}
                </Text>
                <Text variant="footnote" tone="body">
                  {memory.myPrivateNote}
                </Text>
              </Card>
              <Text variant="footnote" tone="muted">
                {COPY.privateNote.saving}
              </Text>
              <Button
                label={COPY.privateNote.withdraw}
                onPress={confirmWithdraw}
                variant="outline"
                disabled={saving}
              />
            </>
          ) : (
            <>
              <Text variant="body" tone="body">
                {COPY.privateNote.lede}
              </Text>
              <Input
                label={COPY.privateNote.yourNote}
                value={draft}
                onChangeText={setDraft}
                placeholder={COPY.privateNote.placeholder}
                multiline
              />
              {error ? (
                <Text variant="footnote" tone="error">
                  {error}
                </Text>
              ) : null}
              <Button
                label={COPY.privateNote.save}
                onPress={save}
                loading={saving}
                disabled={!draft.trim()}
              />
            </>
          )}
        </View>
        </Overlay>
      </Modal>

      <ConfirmDialog
        visible={confirmingWithdraw}
        title={COPY.privateNote.withdrawConfirm.title}
        body={COPY.privateNote.withdrawConfirm.body}
        confirmLabel={COPY.privateNote.withdrawConfirm.confirm}
        cancelLabel={COPY.privateNote.withdrawConfirm.cancel}
        onConfirm={withdraw}
        onCancel={cancelWithdraw}
        destructive
      />
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
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
