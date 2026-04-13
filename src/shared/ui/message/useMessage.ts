import { App } from '@tinkerbells/xenon-ui'

export function useMessage() {
  const { message } = App.useApp()
  return message
}
