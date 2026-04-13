import type { GlobalPopoverOpenOptions, PopoverController } from './types'

/**
 * Глобальное хранилище ссылки на текущий контроллер.
 * Провайдер при маунте устанавливает его, при анмаунте — снимает.
 */
let controllerRef: PopoverController | null = null

export function setGlobalController(c: PopoverController | null) {
  controllerRef = c
}

export function getGlobalController(): PopoverController | null {
  return controllerRef
}

/** Открыть глобальный поповер (императивно, «из любого места») */
export function openGlobalPopover(opts: GlobalPopoverOpenOptions) {
  controllerRef?.open(opts)
}

/** Обновить текущий поповер (позиция/контент/опции) */
export function updateGlobalPopover(opts: Partial<GlobalPopoverOpenOptions>) {
  controllerRef?.update(opts)
}

/** Закрыть поповер */
export function closeGlobalPopover() {
  controllerRef?.close()
}

/** Открыт ли поповер сейчас */
export function isGlobalPopoverOpen() {
  return controllerRef?.isOpen() ?? false
}
