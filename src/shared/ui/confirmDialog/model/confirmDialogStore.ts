import type { ReactNode } from 'react'

import { makeAutoObservable } from 'mobx'

interface ConfirmDialogOptions {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  additionalLabel?: string
  onConfirm: () => void | Promise<void>
  onAdditional?: () => void | Promise<void>
}

class ConfirmDialogStore {
  isOpen = false
  loading = false
  title = ''
  description: ReactNode | undefined = undefined
  confirmLabel = 'Да'
  cancelLabel = 'Нет'
  additionalLabel: string | null = null
  private onConfirm: (() => void | Promise<void>) | null = null
  private onAdditional: (() => void | Promise<void>) | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  open(options: ConfirmDialogOptions) {
    this.isOpen = true
    this.loading = false
    this.title = options.title
    this.description = options.description
    this.confirmLabel = options.confirmLabel ?? 'Да'
    this.cancelLabel = options.cancelLabel ?? 'Нет'
    this.additionalLabel = options.additionalLabel ?? null
    this.onConfirm = options.onConfirm
    this.onAdditional = options.onAdditional ?? null
  }

  close() {
    this.isOpen = false
    this.loading = false
    this.title = ''
    this.description = undefined
    this.confirmLabel = 'Да'
    this.cancelLabel = 'Нет'
    this.additionalLabel = null
    this.onConfirm = null
    this.onAdditional = null
  }

  async confirm() {
    if (!this.onConfirm || this.loading)
      return

    this.loading = true
    try {
      await this.onConfirm()
      this.close()
    }
    catch {
      this.loading = false
    }
  }

  async additional() {
    if (!this.onAdditional || this.loading)
      return

    this.loading = true
    try {
      await this.onAdditional()
      this.close()
    }
    catch {
      this.loading = false
    }
  }

  cancel() {
    if (this.loading)
      return
    this.close()
  }
}

export const confirmDialogStore = new ConfirmDialogStore()
