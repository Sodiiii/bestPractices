import { observer } from 'mobx-react'

import { ConfirmDialog } from './confirmDialog'
import { confirmDialogStore } from './model/confirmDialogStore'

export const ConfirmDialogHost = observer(() => {
  return (
    <ConfirmDialog
      open={confirmDialogStore.isOpen}
      title={confirmDialogStore.title}
      description={confirmDialogStore.description}
      confirmLabel={confirmDialogStore.confirmLabel}
      cancelLabel={confirmDialogStore.cancelLabel}
      additionalLabel={confirmDialogStore.additionalLabel}
      loading={confirmDialogStore.loading}
      onConfirm={confirmDialogStore.confirm}
      onAdditional={confirmDialogStore.additional}
      onCancel={confirmDialogStore.cancel}
    />
  )
})
