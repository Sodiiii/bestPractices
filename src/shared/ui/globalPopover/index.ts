// Контекст/хук/провайдер
export { useGlobalPopover } from './context'

// Императивное API
export {
  closeGlobalPopover,
  isGlobalPopoverOpen,
  openGlobalPopover,
  updateGlobalPopover,
} from './controllerRegistry'
export { GlobalPopoverTrigger } from './globalPopoverTrigger'

export { GlobalPopoverProvider } from './provider'

// Типы
export type {
  GlobalPopoverContent,
  GlobalPopoverOpenOptions,
  Placement,
  VirtualAnchor,
} from './types'
// Утилиты и готовый триггер
export { createPointAnchor } from './utils'
