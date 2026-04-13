import { App } from '@tinkerbells/xenon-ui'

export function useNotification() {
  const { notification } = App.useApp()
  return notification
}
