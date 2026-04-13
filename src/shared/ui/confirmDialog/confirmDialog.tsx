import type { FC, ReactNode } from 'react'

import { Button, Modal } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './confirmDialog.module.scss'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  additionalLabel?: string | null
  loading?: boolean
  className?: string
  onConfirm: () => void
  onAdditional?: () => void
  onCancel: () => void
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Да',
  cancelLabel = 'Нет',
  additionalLabel = null,
  loading = false,
  className,
  onConfirm,
  onAdditional,
  onCancel,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={false}
      centered
      width={580}
      className={cn(cls.confirmDialog, className)}
    >
      <div className={cls.body}>
        {description && <div className={cls.description}>{description}</div>}
        <div className={cls.actions}>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading} color="error">
            {confirmLabel}
          </Button>
          {additionalLabel && onAdditional && (
            <Button onClick={onAdditional} disabled={loading}>
              {additionalLabel}
            </Button>
          )}

        </div>
      </div>
    </Modal>
  )
}
