import { App } from '@tinkerbells/xenon-ui'

export function useDialog() {
  const { modal: dialog } = App.useApp()
  return dialog
}
