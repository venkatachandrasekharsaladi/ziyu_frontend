import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { SettingsRow, type FeatherName } from '@/design-system/patterns/SettingsRow'

type DangerRowProps = {
  icon: FeatherName
  label: string
  detail?: string
  confirmTitle: string
  confirmBody: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  testID?: string
}

/**
 * A settings row for something the user will not want to do by accident.
 *
 * It ALWAYS asks first, and it asks with `ConfirmDialog` rather than `Alert` —
 * `Alert` has no implementation in react-native-web, so on web the question
 * never appeared and the control was unreachable. See `ConfirmDialog`'s own
 * header comment; this row exists partly so no future caller can rediscover
 * that bug.
 */
export function DangerRow({
  icon,
  label,
  detail,
  confirmTitle,
  confirmBody,
  confirmLabel,
  cancelLabel,
  onConfirm,
  testID,
}: DangerRowProps) {
  const [isAsking, setIsAsking] = useState(false)

  const ask = useCallback(() => setIsAsking(true), [])
  const dismiss = useCallback(() => setIsAsking(false), [])
  const confirm = useCallback(() => {
    setIsAsking(false)
    onConfirm()
  }, [onConfirm])

  return (
    <>
      <SettingsRow
        icon={icon}
        label={label}
        detail={detail}
        onPress={ask}
        tone="danger"
        testID={testID}
      />

      <ConfirmDialog
        visible={isAsking}
        title={confirmTitle}
        body={confirmBody}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={dismiss}
        onConfirm={confirm}
      />
    </>
  )
}
